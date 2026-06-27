import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import type { Feature, FeatureCollection } from "geojson";
import * as L from "leaflet";
import { AlertTriangle, SidebarCloseIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import {
    Sidebar,
    SidebarContent,
    SidebarContext,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar-r";
import calgaryTransitData from "@/data/calgary_rapid_transit_network.json";
import {
    disabledStations,
    displayHidingZones,
    displayHidingZonesStyle,
    headStartMinutes,
    hidingRadius,
    hidingRadiusUnits,
    isLoading,
    leafletMapContext,
    liveUpdateMapEnabled,
    questionFinishedMapData,
    questions,
    trainStations,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import {
    findPlacesSpecificInZone,
    QuestionSpecificLocation,
    type StationCircle,
    type StationPlace,
} from "@/maps/api";
import {
    extractStationLabel,
    extractStationName,
    geoSpatialVoronoi,
    lngLatToText,
    safeUnion,
} from "@/maps/geo-utils";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";
import { Checkbox } from "./ui/checkbox";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollToTop } from "./ui/scroll-to-top";
import { MENU_ITEM_CLASSNAME } from "./ui/sidebar-l";
import { UnitSelect } from "./UnitSelect";

let buttonJustClicked = false;

export const ZoneSidebar = () => {
    const $displayHidingZones = useStore(displayHidingZones);
    const $questionFinishedMapData = useStore(questionFinishedMapData);
    const $displayHidingZonesStyle = useStore(displayHidingZonesStyle);
    const $hidingRadius = useStore(hidingRadius);
    const $hidingRadiusUnits = useStore(hidingRadiusUnits);
    const $headStartMinutes = useStore(headStartMinutes);
    const $isLoading = useStore(isLoading);
    const map = useStore(leafletMapContext);
    const stations = useStore(trainStations);
    const $disabledStations = useStore(disabledStations);
    const [hidingZoneModeStationID, setHidingZoneModeStationID] =
        useState<string>("");
    const [stationSearch, setStationSearch] = useState<string>("");
    const isStationSearchActive = stationSearch.trim().length > 0;
    const setStations = trainStations.set;
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);

    const removeHidingZones = () => {
        if (!map) return;
        map.eachLayer((layer: any) => {
            if (layer.hidingZones) {
                map.removeLayer(layer);
            }
        });
    };

    const showGeoJSON = (
        geoJSONData: any,
        nonOverlappingStations: boolean = false,
        additionalOptions: L.GeoJSONOptions = {},
    ) => {
        if (!map) return;
        removeHidingZones();

        const geoJsonLayer = L.geoJSON(geoJSONData, {
            interactive: nonOverlappingStations,
            style: (feature: any) => {
                let color = "blue";
                const isSelected =
                    feature?.properties?.id === hidingZoneModeStationID ||
                    feature?.properties?.properties?.id ===
                        hidingZoneModeStationID;

                if (isSelected) {
                    color = "yellow";
                } else {
                    const transitType =
                        feature?.properties?.properties?.transit_type ||
                        feature?.properties?.transit_type;
                    if (transitType === "CTrain Station") {
                        color = "red";
                    } else if (transitType === "MAX Station") {
                        color = "blue";
                    } else if (transitType === "CTrain & MAX Hub") {
                        color = "purple";
                    } else {
                        color = "green";
                    }
                }
                return {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.2,
                };
            },
            onEachFeature: nonOverlappingStations
                ? (feature, layer) => {
                      const id =
                          feature?.properties?.id ||
                          feature?.properties?.properties?.id;
                      const isSelected = id && id === hidingZoneModeStationID;

                      if (isSelected) {
                          const name =
                              extractStationLabel(feature?.properties) ||
                              "Selected Zone";
                          layer.bindTooltip(name, {
                              permanent: true,
                              direction: "center",
                              className:
                                  "bg-black text-white px-2 py-1 rounded",
                          });
                      }

                      layer.on("click", async () => {
                          if (!map) return;

                          setHidingZoneModeStationID((prev) =>
                              prev === id ? "" : id,
                          );
                      });
                  }
                : undefined,
            pointToLayer(geoJsonPoint, latlng) {
                const marker = L.marker(latlng, {
                    icon: L.divIcon({
                        html: `<div class="text-black bg-opacity-0"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M96 0C43 0 0 43 0 96L0 352c0 48 35.2 87.7 81.1 94.9l-46 46C28.1 499.9 33.1 512 43 512l39.7 0c8.5 0 16.6-3.4 22.6-9.4L160 448l128 0 54.6 54.6c6 6 14.1 9.4 22.6 9.4l39.7 0c10 0 15-12.1 7.9-19.1l-46-46c46-7.1 81.1-46.9 81.1-94.9l0-256c0-53-43-96-96-96L96 0zM64 96c0-17.7 14.3-32 32-32l256 0c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32L96 224c-17.7 0-32-14.3-32-32l0-96zM224 288a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"></path></svg></div>`,
                        className: "",
                    }),
                });

                marker.bindPopup(
                    `<b>${
                        extractStationName(geoJsonPoint) || "No Name Found"
                    } (${lngLatToText(
                        geoJsonPoint.geometry.coordinates as [number, number],
                    )})</b>`,
                );

                return marker;
            },
            ...additionalOptions,
        });

        // @ts-expect-error This is intentionally added as a check
        geoJsonLayer.hidingZones = true;
        geoJsonLayer.addTo(map);
        geoJsonLayer.bringToBack();
    };

    useEffect(() => {
        if (!map || isLoading.get()) return;

        const initializeHidingZones = async () => {
            isLoading.set(true);

            try {
                if ($displayHidingZonesOptions.length === 0) {
                    toast.error("At least one place type must be selected");
                    return;
                }

                let places: StationPlace[] = [];

                const overpassOptions = $displayHidingZonesOptions.filter(
                    (o) => !o.startsWith("SPECIAL:"),
                );
                const specialOptions = $displayHidingZonesOptions.filter((o) =>
                    o.startsWith("SPECIAL:"),
                );

                if (overpassOptions.length > 0) {
                    // @ts-expect-error osmtogeojson always defines properties with an "id" string
                    places =
                        osmtogeojson(
                            await findPlacesInZone(
                                overpassOptions[0],
                                "Finding stations. This may take a while...",
                                "nwr",
                                "center",
                                overpassOptions.slice(1),
                            ),
                        ).features || [];
                } else {
                    places = [];
                }

                if (specialOptions.includes("SPECIAL:CALGARY_TRANSIT")) {
                    const transitFeatures = (
                        calgaryTransitData as any
                    ).features.map((f: any) => ({
                        type: "Feature",
                        geometry: f.geometry,
                        properties: {
                            ...f.properties,
                            id:
                                f.properties?.["@id"] ||
                                f.id ||
                                `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`,
                            name: f.properties?.name,
                        },
                    }));
                    places.push(...transitFeatures);
                }

                const unionized = safeUnion(
                    turf.simplify($questionFinishedMapData, {
                        tolerance: 0.001,
                    }),
                );

                let circles = places
                    .map((place) => {
                        const radius = $hidingRadius;
                        const center = turf.getCoord(place);
                        return turf.circle(center, radius, {
                            steps: 32,
                            units: $hidingRadiusUnits,
                            properties: place,
                        });
                    })
                    .filter((circle) => {
                        return !turf.booleanWithin(circle, unionized);
                    });

                for (const question of questions.get()) {
                    if (circles.length === 0) break;

                    if (!liveUpdateMapEnabled.get() && question.data.drag) {
                        continue;
                    }

                    if (
                        question.id === "match" &&
                        (question.data.type === "same-first-letter-station" ||
                            question.data.type === "same-length-station" ||
                            question.data.type === "same-train-line")
                    ) {
                        const location = turf.point([
                            question.data.lng,
                            question.data.lat,
                        ]);
                        const nearestTrainStation = turf.nearestPoint(
                            location,
                            turf.featureCollection(places) as any,
                        );

                        if (question.data.type === "same-train-line") {
                            const seekerLines: string[] =
                                nearestTrainStation.properties.properties
                                    ?.lines ||
                                (nearestTrainStation.properties as any).lines ||
                                [];

                            if (seekerLines.length > 0) {
                                circles = circles.filter((circle) => {
                                    const hiderLines: string[] =
                                        circle.properties.properties?.lines ||
                                        (circle.properties as any).lines ||
                                        [];

                                    const intersects = seekerLines.some((l) =>
                                        hiderLines.includes(l),
                                    );

                                    return question.data.same
                                        ? intersects
                                        : !intersects;
                                });
                            }
                        }

                        const englishName =
                            extractStationName(nearestTrainStation);
                        if (!englishName)
                            return toast.error("No English name found");

                        if (
                            question.data.type === "same-first-letter-station"
                        ) {
                            const letter = englishName[0].toUpperCase();
                            circles = circles.filter((circle) => {
                                const name = extractStationName(
                                    circle.properties,
                                );
                                if (!name) return false;
                                return question.data.same
                                    ? name[0].toUpperCase() === letter
                                    : name[0].toUpperCase() !== letter;
                            });
                        } else if (
                            question.data.type === "same-length-station"
                        ) {
                            const seekerLength = englishName.length;
                            const comparison = question.data.lengthComparison;
                            circles = circles.filter((circle) => {
                                const name = extractStationName(
                                    circle.properties,
                                );
                                if (!name) return false;
                                if (comparison === "same")
                                    return name.length === seekerLength;
                                if (comparison === "shorter")
                                    return name.length < seekerLength;
                                if (comparison === "longer")
                                    return name.length > seekerLength;
                                return false;
                            });
                        }
                    }
                    if (
                        question.id === "measure" &&
                        ((question.data as any).type === "mcdonalds" ||
                            (question.data as any).type === "seven11")
                    ) {
                        const points = await findPlacesSpecificInZone(
                            (question.data as any).type === "mcdonalds"
                                ? QuestionSpecificLocation.McDonalds
                                : QuestionSpecificLocation.Seven11,
                        );

                        if (points.features.length === 0) {
                            circles = [];
                            continue;
                        }

                        const nearestPoint = turf.nearestPoint(
                            turf.point([question.data.lng, question.data.lat]),
                            points as any,
                        );
                        const distance = turf.distance(
                            turf.point([question.data.lng, question.data.lat]),
                            nearestPoint as any,
                            { units: "kilometers" },
                        );

                        circles = circles.filter((circle) => {
                            const point = turf.point(
                                turf.getCoord(circle.properties),
                            );
                            const nearest = turf.nearestPoint(
                                point,
                                points as any,
                            );
                            return question.data.hiderCloser
                                ? turf.distance(point, nearest as any, {
                                      units: "kilometers",
                                  }) <
                                      distance + $hidingRadius
                                : turf.distance(point, nearest as any, {
                                      units: "kilometers",
                                  }) >
                                      distance - $hidingRadius;
                        });
                    }
                }

                setStations(circles);
            } finally {
                isLoading.set(false);
            }
        };

        if ($displayHidingZones && $questionFinishedMapData) {
            initializeHidingZones().catch((err) => {
                console.error(err);
                toast.error(
                    "An error occurred during hiding zone initialization",
                    { toastId: "hiding-zone-initialization-error" },
                );
            });
        }
    }, [
        $questionFinishedMapData,
        $displayHidingZones,
        $hidingRadius,
    ]);

    useEffect(() => {
        if (!map || isLoading.get()) return;

        if ($displayHidingZones) {
            const activeStations = stations.filter(
                (x) => !$disabledStations.includes(x.properties.properties.id),
            );
            showGeoJSON(
                styleStations(
                    activeStations,
                    $displayHidingZonesStyle,
                    $questionFinishedMapData,
                ),
                $displayHidingZonesStyle === "zones",
            );

            if (hidingZoneModeStationID) {
                const element: HTMLDivElement | null = document.querySelector(
                    `[data-station-id="${hidingZoneModeStationID}"]`,
                );
                if (element) {
                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                    element.classList.add("selected-card-background-temporary");
                    setTimeout(() => {
                        element.classList.remove(
                            "selected-card-background-temporary",
                        );
                    }, 5000);
                }
            }
        } else {
            removeHidingZones();
        }
    }, [
        $disabledStations,
        $displayHidingZones,
        $displayHidingZonesStyle,
        $hidingRadius,
        $questionFinishedMapData,
        hidingZoneModeStationID,
        stations,
    ]);

    return (
        <Sidebar side="right">
            <div className="flex items-center justify-between">
                <h2 className="ml-4 mt-4 font-poppins text-2xl">Hiding Zone</h2>
                <SidebarCloseIcon
                    className="mr-2 visible cursor-pointer scale-x-[-1]"
                    onClick={() => {
                        SidebarContext.get().toggleSidebar();
                    }}
                />
            </div>
            <SidebarContent ref={sidebarRef}>
                <ScrollToTop element={sidebarRef} minHeight={500} />
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Label className="font-semibold font-poppins ml-2">
                                    Head Start (Minutes)
                                </Label>
                                <div
                                    className={cn(
                                        MENU_ITEM_CLASSNAME,
                                        "gap-2 flex flex-row",
                                    )}
                                >
                                    <Input
                                        type="number"
                                        className="rounded-md p-2 w-full"
                                        value={$headStartMinutes}
                                        onChange={(e) => {
                                            headStartMinutes.set(
                                                parseInt(e.target.value) || 0,
                                            );
                                        }}
                                        disabled={$isLoading}
                                    />
                                </div>
                            </SidebarMenuItem>
                            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                                <Label className="font-semibold font-poppins">
                                    Display hiding zones?
                                </Label>
                                <Checkbox
                                    defaultChecked={$displayHidingZones}
                                    checked={$displayHidingZones}
                                    onCheckedChange={(checked) => {
                                        if (checked === true) {
                                            setIsWarningDialogOpen(true);
                                        } else {
                                            displayHidingZones.set(false);
                                        }
                                    }}
                                    disabled={$isLoading}
                                />
                                <AlertDialog
                                    open={isWarningDialogOpen}
                                    onOpenChange={setIsWarningDialogOpen}
                                >
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center text-orange-500">
                                                <AlertTriangle className="mr-2 inline-block h-5 w-5" />
                                                Warning: Performance Impact
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This feature may slow down your
                                                device.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel
                                                onClick={() => {
                                                    setIsWarningDialogOpen(
                                                        false,
                                                    );
                                                }}
                                            >
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    displayHidingZones.set(
                                                        true,
                                                    );
                                                    setIsWarningDialogOpen(
                                                        false,
                                                    );
                                                }}
                                            >
                                                Enable
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </SidebarMenuItem>
                            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                                <MultiSelect
                                    options={[
                                        {
                                            label: "Railway Stations",
                                            value: "[railway=station]",
                                        },
                                        {
                                            label: "Railway Halts",
                                            value: "[railway=halt]",
                                        },
                                        {
                                            label: "Railway Stops",
                                            value: "[railway=stop]",
                                        },
                                        {
                                            label: "Tram Stops",
                                            value: "[railway=tram_stop]",
                                        },
                                        {
                                            label: "Bus Stops",
                                            value: "[highway=bus_stop]",
                                        },
                                        {
                                            label: "Calgary Rapid Transit Network",
                                            value: "SPECIAL:CALGARY_TRANSIT",
                                        },
                                        {
                                            label: "Ferry Terminals",
                                            value: "[amenity=ferry_terminal]",
                                        },
                                        {
                                            label: "Ferry Platforms (public transport)",
                                            value: "[public_transport=platform][platform=ferry]",
                                        },
                                        {
                                            label: "Funicular Stations",
                                            value: "[railway=funicular]",
                                        },
                                        {
                                            label: "Aerialway Stations",
                                            value: "[aerialway=station]",
                                        },
                                        {
                                            label: "Railway Stations Excluding Subways",
                                            value: "[railway=station][subway!=yes]",
                                        },
                                        {
                                            label: "Subway Stations",
                                            value: "[railway=station][subway=yes]",
                                        },
                                        {
                                            label: "Light Rail Stations",
                                            value: "[railway=station][light_rail=yes]",
                                        },
                                        {
                                            label: "Light Rail Halts",
                                            value: "[railway=halt][light_rail=yes]",
                                        },
                                    ]}
                                    onValueChange={
                                        displayHidingZonesOptions.set
                                    }
                                    defaultValue={$displayHidingZonesOptions}
                                    placeholder="Select allowed places"
                                    animation={2}
                                    maxCount={3}
                                    modalPopover
                                    className="!bg-popover bg-opacity-100"
                                    disabled={$isLoading}
                                />
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <Label className="font-semibold font-poppins ml-2">
                                    Hiding Zone Radius
                                </Label>
                                <div
                                    className={cn(
                                        MENU_ITEM_CLASSNAME,
                                        "gap-2 flex flex-row",
                                    )}
                                >
                                    <Input
                                        type="number"
                                        className="rounded-md p-2 w-16"
                                        value={$hidingRadius}
                                        onChange={(e) => {
                                            hidingRadius.set(
                                                parseFloat(e.target.value),
                                            );
                                        }}
                                        disabled={$isLoading}
                                    />
                                    <UnitSelect
                                        unit={$hidingRadiusUnits}
                                        disabled={$isLoading}
                                        onChange={(unit) => {
                                            hidingRadiusUnits.set(unit);
                                        }}
                                    />
                                </div>
                            </SidebarMenuItem>
                            {$displayHidingZones && stations.length > 0 && (
                                <SidebarMenuItem
                                    className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                    onClick={() => {
                                        setHidingZoneModeStationID("");
                                        displayHidingZonesStyle.set(
                                            "no-display",
                                        );
                                    }}
                                    disabled={$isLoading}
                                >
                                    No Display
                                </SidebarMenuItem>
                            )}
                            {$displayHidingZones && stations.length > 0 && (
                                <SidebarMenuItem
                                    className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                    onClick={() => {
                                        setHidingZoneModeStationID("");
                                        displayHidingZonesStyle.set("stations");
                                    }}
                                    disabled={$isLoading}
                                >
                                    All Stations
                                </SidebarMenuItem>
                            )}
                            {$displayHidingZones && stations.length > 0 && (
                                <SidebarMenuItem
                                    className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                    onClick={() => {
                                        setHidingZoneModeStationID("");
                                        displayHidingZonesStyle.set("zones");
                                    }}
                                    disabled={$isLoading}
                                >
                                    All Zones
                                </SidebarMenuItem>
                            )}
                            {$displayHidingZones && stations.length > 0 && (
                                <SidebarMenuItem
                                    className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                    onClick={() => {
                                        setHidingZoneModeStationID("");
                                        displayHidingZonesStyle.set(
                                            "no-overlap",
                                        );
                                    }}
                                    disabled={$isLoading}
                                >
                                    No Overlap
                                </SidebarMenuItem>
                            )}
                            {$displayHidingZones && hidingZoneModeStationID && (
                                <SidebarMenuItem
                                    className={cn(
                                        MENU_ITEM_CLASSNAME,
                                        "bg-popover hover:bg-accent",
                                    )}
                                    disabled={$isLoading}
                                >
                                    Current:{" "}
                                    {(() => {
                                        const selected = stations.find(
                                            (x) =>
                                                x.properties.properties.id ===
                                                hidingZoneModeStationID,
                                        );
                                        const displayName = extractStationLabel(
                                            selected?.properties,
                                        );
                                        const id = selected?.properties
                                            .properties.id as string;
                                        const coords = selected?.properties
                                            .geometry.coordinates as [
                                            number,
                                            number,
                                        ];
                                        const href = id?.includes("/")
                                            ? `https://www.openstreetmap.org/${id}`
                                            : `https://www.openstreetmap.org/?mlat=${coords[1]}&mlon=${coords[0]}#map=17/${coords[1]}/${coords[0]}`;
                                        return (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-500"
                                            >
                                                {displayName}
                                            </a>
                                        );
                                    })()}
                                </SidebarMenuItem>
                            )}
                            {$displayHidingZones &&
                                $disabledStations.length > 0 && (
                                    <SidebarMenuItem
                                        className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                        onClick={() => {
                                            disabledStations.set([]);
                                        }}
                                        disabled={$isLoading}
                                    >
                                        Clear Disabled
                                    </SidebarMenuItem>
                                )}
                            {$displayHidingZones && (
                                <SidebarMenuItem
                                    className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                    onClick={() => {
                                        disabledStations.set(
                                            stations.map(
                                                (x) =>
                                                    x.properties.properties.id,
                                            ),
                                        );
                                    }}
                                    disabled={$isLoading}
                                >
                                    Disable All
                                </SidebarMenuItem>
                            )}
                            {$displayHidingZones && (
                                <Command
                                    key={
                                        isStationSearchActive
                                            ? "station-search-active"
                                            : "station-search-idle"
                                    }
                                    shouldFilter={isStationSearchActive}
                                >
                                    <CommandInput
                                        placeholder="Search for a hiding zone..."
                                        value={stationSearch}
                                        onValueChange={setStationSearch}
                                        disabled={$isLoading}
                                    />
                                    <CommandList className="max-h-full">
                                        <CommandEmpty>
                                            No hiding zones found.
                                        </CommandEmpty>
                                        <CommandGroup>
                                            {stations.map((station) => (
                                                <CommandItem
                                                    key={
                                                        station.properties
                                                            .properties.id
                                                    }
                                                    data-station-id={
                                                        station.properties
                                                            .properties.id
                                                    }
                                                    className={cn(
                                                        $disabledStations.includes(
                                                            station.properties
                                                                .properties.id,
                                                        ) && "line-through",
                                                    )}
                                                    onSelect={async () => {
                                                        if (!map) return;
                                                        setTimeout(() => {
                                                            if (
                                                                buttonJustClicked
                                                            ) {
                                                                buttonJustClicked =
                                                                    false;
                                                                return;
                                                            }
                                                            if (
                                                                $disabledStations.includes(
                                                                    station
                                                                        .properties
                                                                        .properties
                                                                        .id,
                                                                )
                                                            ) {
                                                                disabledStations.set(
                                                                    [
                                                                        ...$disabledStations.filter(
                                                                            (
                                                                                x,
                                                                            ) =>
                                                                                x !==
                                                                                station
                                                                                    .properties
                                                                                    .properties
                                                                                    .id,
                                                                        ),
                                                                    ],
                                                                );
                                                            } else {
                                                                disabledStations.set(
                                                                    [
                                                                        ...$disabledStations,
                                                                        station
                                                                            .properties
                                                                            .properties
                                                                            .id,
                                                                    ],
                                                                );
                                                            }
                                                            setStations([
                                                                ...stations,
                                                            ]);
                                                        }, 100);
                                                    }}
                                                    disabled={$isLoading}
                                                >
                                                    {extractStationLabel(
                                                        station.properties,
                                                    )}
                                                    <button
                                                        onClick={async () => {
                                                            if (!map) return;
                                                            buttonJustClicked =
                                                                true;
                                                            setHidingZoneModeStationID(
                                                                station
                                                                    .properties
                                                                    .properties
                                                                    .id,
                                                            );
                                                        }}
                                                        className="bg-slate-600 p-0.5 rounded-md"
                                                        disabled={$isLoading}
                                                    >
                                                        View
                                                    </button>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
};

function styleStations(
    circles: StationCircle[],
    style: string,
    $questionFinishedMapData: any,
): FeatureCollection | Feature {
    const applyMask = (
        feature: FeatureCollection | Feature,
    ): FeatureCollection | Feature => {
        if (!$questionFinishedMapData) return feature;
        try {
            const unionized = safeUnion(
                turf.simplify($questionFinishedMapData, {
                    tolerance: 0.001,
                }),
            );
            if (feature.type === "FeatureCollection") {
                const intersectedFeatures = feature.features
                    .map((f: any) => {
                        const intersection = turf.difference(
                            turf.featureCollection([f, unionized]),
                        );
                        if (intersection) {
                            intersection.properties = f.properties;
                            return intersection;
                        }
                        return null;
                    })
                    .filter(Boolean);
                return turf.featureCollection(intersectedFeatures as any);
            } else {
                const intersection = turf.difference(
                    turf.featureCollection([feature as any, unionized]),
                );
                if (intersection) {
                    intersection.properties = feature.properties;
                    return intersection;
                }
                return { type: "FeatureCollection", features: [] };
            }
        } catch {
            return feature;
        }
    };

    switch (style) {
        case "no-display":
            return { type: "FeatureCollection", features: [] };
        case "no-overlap":
            return applyMask(safeUnion(turf.featureCollection(circles)));
        case "stations":
            return applyMask(turf.featureCollection(circles));
        case "zones":
        default:
            if (circles.length > 1) {
                const points = turf.featureCollection(
                    circles.map((c) => c.properties),
                );
                try {
                    const voronoi = geoSpatialVoronoi(points as any);

                    if (voronoi && voronoi.features) {
                        const intersectedCircles = circles.map((circle) => {
                            const stationId = circle.properties.properties.id;
                            const v = voronoi.features.find(
                                (f: any) =>
                                    f.properties?.site?.properties?.id ===
                                    stationId,
                            );

                            if (v) {
                                const intersection = turf.intersect(
                                    turf.featureCollection([circle, v as any]),
                                );
                                if (intersection) {
                                    intersection.properties = circle.properties;
                                    return intersection;
                                }
                            }
                            return circle;
                        });
                        return applyMask(
                            turf.featureCollection(intersectedCircles as any),
                        );
                    }
                } catch (e) {
                    console.error("Error generating voronoi for zones:", e);
                }
            }
            return applyMask(turf.featureCollection(circles));
    }
}
