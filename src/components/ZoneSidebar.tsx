import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import type { Feature, FeatureCollection } from "geojson";
import * as L from "leaflet";
import { AlertTriangle, SidebarCloseIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { Accordion } from "@/components/ui/accordion";
import {
    RightSidebarContext,
    Sidebar,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    disabledStations,
    displayHidingZonesStyle,
    hasSeenPerformanceWarning,
    headStartMinutes,
    hidingRadius,
    hidingRadiusUnits,
    isLoading,
    leafletMapContext,
    lockedActiveStationIds,
    questionFinishedMapData,
    questions,
    showRecommendedStart,
    trainStations,
} from "@/lib/context";
import { initializeHidingZonesLogic } from "@/lib/hiding-zones";
import { cn } from "@/lib/utils";
import { type StationCircle } from "@/maps/api";
import {
    extractStationId,
    extractStationLabel,
    extractStationName,
    geoSpatialVoronoi,
    getFeatureProperties,
    lngLatToText,
} from "@/maps/geo-utils";

import { AdvancedStationManagement } from "./AdvancedStationManagement";
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
import { Input } from "./ui/input";

interface HidingZoneLayer extends L.GeoJSON {
    hidingZones?: boolean;
}
import { Label } from "./ui/label";
import { ScrollToTop } from "./ui/scroll-to-top";
import { MENU_ITEM_CLASSNAME } from "./ui/sidebar";
import { UnitSelect } from "./UnitSelect";

export const ZoneSidebar = () => {
    const $showRecommendedStart = useStore(showRecommendedStart);
    const $questionFinishedMapData = useStore(questionFinishedMapData);
    const $displayHidingZonesStyle = useStore(displayHidingZonesStyle);
    const $hasSeenPerformanceWarning = useStore(hasSeenPerformanceWarning);
    const $hidingRadius = useStore(hidingRadius);
    const $hidingRadiusUnits = useStore(hidingRadiusUnits);
    const $headStartMinutes = useStore(headStartMinutes);
    const $isLoading = useStore(isLoading);
    const $questions = useStore(questions);
    const map = useStore(leafletMapContext);
    const stations = useStore(trainStations);
    const $disabledStations = useStore(disabledStations);
    const $lockedActiveStationIds = useStore(lockedActiveStationIds);
    const [hidingZoneModeStationID, setHidingZoneModeStationID] =
        useState<string>("");
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);
    const [pendingStyle, setPendingStyle] = useState<"zones" | "no-display">(
        "no-display",
    );

    const removeHidingZones = () => {
        if (!map) return;
        map.eachLayer((layer: L.Layer) => {
            if ((layer as HidingZoneLayer).hidingZones) {
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

        if (!map.getPane("hidingZonesPane")) {
            map.createPane("hidingZonesPane");
            map.getPane("hidingZonesPane")!.style.zIndex = "399";
        }
        const geoJsonLayer = L.geoJSON(geoJSONData, {
            pane: "hidingZonesPane",
            interactive: nonOverlappingStations,
            style: (feature: any) => {
                let colour = "blue";
                const isSelected =
                    extractStationId(feature) === hidingZoneModeStationID;

                if (isSelected) {
                    colour = "yellow";
                } else {
                    const transitType =
                        getFeatureProperties(feature).transit_type;
                    if (transitType === "CTrain Station") {
                        colour = "red";
                    } else if (transitType === "MAX Station") {
                        colour = "blue";
                    } else if (transitType === "CTrain & MAX Hub") {
                        colour = "purple";
                    } else {
                        colour = "green";
                    }
                }
                return {
                    color: colour,
                    fillColor: colour,
                    fillOpacity: 0.2,
                };
            },
            onEachFeature: nonOverlappingStations
                ? (feature, layer) => {
                      const id = extractStationId(feature);
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

        (geoJsonLayer as HidingZoneLayer).hidingZones = true;
        geoJsonLayer.addTo(map);
        geoJsonLayer.bringToBack();
    };

    useEffect(() => {
        if (!map || isLoading.get()) return;

        if ($questionFinishedMapData) {
            initializeHidingZonesLogic().catch((err) => {
                console.error(err);
                toast.error(
                    "An error occurred during hiding zone initialization",
                    { toastId: "hiding-zone-initialization-error" },
                );
            });
        }
    }, [
        $questionFinishedMapData,
        $showRecommendedStart,
        $hidingRadius,
        $questions,
    ]);

    useEffect(() => {
        if (!map || isLoading.get()) return;

        if ($displayHidingZonesStyle !== "no-display") {
            const activeStations = stations.filter(
                (x) => !$disabledStations.includes(extractStationId(x)),
            );
            showGeoJSON(
                styleStations(
                    activeStations,
                    $displayHidingZonesStyle,
                    $questionFinishedMapData,
                    $lockedActiveStationIds,
                    stations,
                ),
                $displayHidingZonesStyle === "zones",
            );

            if (hidingZoneModeStationID) {
                const element: HTMLDivElement | null = document.querySelector(
                    `[data-station-id="${hidingZoneModeStationID}"]`,
                );
                if (
                    element &&
                    stations.find(
                        (x) => extractStationId(x) === hidingZoneModeStationID,
                    )
                ) {
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
                } else if (
                    stations.length > 0 &&
                    !stations.find(
                        (x) => extractStationId(x) === hidingZoneModeStationID,
                    )
                ) {
                    setHidingZoneModeStationID("");
                }
            }
        } else {
            removeHidingZones();
        }
    }, [
        $disabledStations,
        $displayHidingZonesStyle,
        $hidingRadius,
        $questionFinishedMapData,
        hidingZoneModeStationID,
        stations,
    ]);

    return (
        <Sidebar side="right">
            <div className="flex items-center justify-between">
                <h2 className="ml-4 mt-4 font-poppins text-2xl">
                    Game Settings
                </h2>
                <button
                    type="button"
                    className="mr-2 visible cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    aria-label="Close sidebar"
                    onClick={() => {
                        RightSidebarContext.get().toggleSidebar();
                    }}
                >
                    <SidebarCloseIcon className="scale-x-[-1]" />
                </button>
            </div>
            <SidebarContent ref={sidebarRef} className="px-4 py-4 space-y-6">
                <ScrollToTop element={sidebarRef} minHeight={500} />

                <div className="space-y-3">
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden divide-y divide-border">
                        <div className="flex items-center justify-between p-4 bg-slate-50/30 dark:bg-slate-900/30">
                            <Label className="flex-1 text-base font-medium text-muted-foreground mr-4">
                                Head Start (Minutes)
                            </Label>
                            <div className="w-[100px]">
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    className="rounded-md p-2 w-full bg-background"
                                    value={$headStartMinutes}
                                    onChange={(e) => {
                                        headStartMinutes.set(
                                            parseInt(e.target.value) || 0,
                                        );
                                    }}
                                    disabled={$isLoading}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50/30 dark:bg-slate-900/30">
                            <Label className="text-base font-medium text-muted-foreground mr-4">
                                Hiding Zone Radius
                            </Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="number"
                                    inputMode="decimal"
                                    className="rounded-md p-2 w-16 bg-background"
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
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                        Hiding Zone Display Options
                    </h3>
                    <div className="rounded-xl border bg-card shadow-sm overflow-hidden divide-y divide-border">
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
                                        This feature may slow down your device.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel
                                        onClick={() =>
                                            setIsWarningDialogOpen(false)
                                        }
                                    >
                                        Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => {
                                            hasSeenPerformanceWarning.set(true);
                                            displayHidingZonesStyle.set(
                                                pendingStyle,
                                            );
                                            setIsWarningDialogOpen(false);
                                        }}
                                    >
                                        Enable
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <SidebarMenu className="gap-0 border-0 bg-transparent p-0 m-0 w-full rounded-none">
                            <SidebarMenuItem
                                className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                onClick={() => {
                                    setHidingZoneModeStationID("");
                                    displayHidingZonesStyle.set("no-display");
                                }}
                                disabled={$isLoading}
                            >
                                Hide Zones
                            </SidebarMenuItem>
                            <SidebarMenuItem
                                className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                                onClick={() => {
                                    if (!$hasSeenPerformanceWarning) {
                                        setPendingStyle("zones");
                                        setIsWarningDialogOpen(true);
                                    } else {
                                        setHidingZoneModeStationID("");
                                        displayHidingZonesStyle.set("zones");
                                    }
                                }}
                                disabled={$isLoading}
                            >
                                Show All Zones
                            </SidebarMenuItem>
                            {hidingZoneModeStationID && (
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
                                                extractStationId(x) ===
                                                hidingZoneModeStationID,
                                        );
                                        const displayName = selected
                                            ? extractStationLabel(
                                                  selected?.properties,
                                              )
                                            : "Unknown";
                                        const id = (
                                            selected
                                                ? extractStationId(selected)
                                                : ""
                                        ) as string;
                                        const coords = selected?.properties
                                            ?.geometry?.coordinates as
                                            | [number, number]
                                            | undefined;
                                        const href = id?.includes("/")
                                            ? `https://www.openstreetmap.org/${id}`
                                            : coords
                                              ? `https://www.openstreetmap.org/?mlat=${coords[1]}&mlon=${coords[0]}#map=17/${coords[1]}/${coords[0]}`
                                              : "#";
                                        return (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500"
                                            >
                                                {displayName}
                                            </a>
                                        );
                                    })()}
                                </SidebarMenuItem>
                            )}
                            <Accordion
                                type="single"
                                collapsible
                                className="w-full"
                            >
                                <AdvancedStationManagement />
                            </Accordion>
                        </SidebarMenu>
                    </div>
                </div>
            </SidebarContent>
        </Sidebar>
    );
};

function styleStations(
    circles: StationCircle[],
    style: string,

    $questionFinishedMapData: any,
    lockedActiveStationIds?: string[] | null,
    allStations?: any[],
): FeatureCollection | Feature {
    const applyMask = (
        feature: FeatureCollection | Feature,
    ): FeatureCollection | Feature => {
        return feature;
    };

    switch (style) {
        case "no-display":
            return { type: "FeatureCollection", features: [] };
        case "zones":
        default:
            if (circles.length > 1) {
                let voronoiPoints = circles;
                if (lockedActiveStationIds && allStations) {
                    const lockedActiveStationIdsSet = new Set(
                        lockedActiveStationIds,
                    );
                    voronoiPoints = allStations.filter((s) =>
                        lockedActiveStationIdsSet.has(
                            extractStationId(s) as string,
                        ),
                    );
                }
                const points = turf.featureCollection(
                    voronoiPoints.map((c) => c.properties),
                );
                try {
                    const voronoi = geoSpatialVoronoi(points as any);

                    if (voronoi && voronoi.features) {
                        // Filter the locked voronoi polygons to ONLY include the ones corresponding to the currently active circles
                        const activeVoronoiFeatures = voronoi.features.filter(
                            (f) =>
                                circles.some(
                                    (c) =>
                                        extractStationId(c) ===
                                        extractStationId(f.properties?.site),
                                ),
                        );
                        voronoi.features = activeVoronoiFeatures;

                        const intersectedCircles = circles.map((circle) => {
                            const stationId = extractStationId(circle);
                            const v = voronoi.features.find(
                                (f: any) =>
                                    extractStationId(f.properties?.site) ===
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
