import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import {
    additionalMapGeoLocations,
    animateMapMovements,
    autoSave,
    baseTileLayer,
    customPresets,
    customStations,
    disabledStations,
    displayHidingZonesOptions,
    displayStationConnections,
    displayTransitLines,
    followMe,
    hiderMode,
    hidingRadius,
    hidingZone,
    includeDefaultStations,
    leafletMapContext,
    mapGeoJSON,
    mapGeoLocation,
    playtestModeEnabled,
    polyGeoJSON,
    questions,
    showTutorial,
    triggerLocalRefresh,
    useCustomStations,
} from "@/lib/context";
import { cn, compress, decompress, shareOrFallback } from "@/lib/utils";
import { questionsSchema } from "@/maps/schema";

import { LatitudeLongitude } from "./LatLngPicker";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Separator } from "./ui/separator";
import { SidebarMenu } from "./ui/sidebar-l";

const HIDING_ZONE_URL_PARAM = "hz";
const HIDING_ZONE_COMPRESSED_URL_PARAM = "hzc";

export const OptionDrawers = ({ className }: { className?: string }) => {
    useStore(triggerLocalRefresh);
    const $animateMapMovements = useStore(animateMapMovements);
    const $hiderMode = useStore(hiderMode);
    const $autoSave = useStore(autoSave);
    const $hidingZone = useStore(hidingZone);
    const $playtestMode = useStore(playtestModeEnabled);
    const $baseTileLayer = useStore(baseTileLayer);
    const $followMe = useStore(followMe);
    const $displayTransitLines = useStore(displayTransitLines);
    const $displayStationConnections = useStore(displayStationConnections);
    const [isOptionsOpen, setOptionsOpen] = useState(false);

    useEffect(() => {
        const params = new URL(window.location.toString()).searchParams;
        const hidingZoneOld = params.get(HIDING_ZONE_URL_PARAM);
        const hidingZoneCompressed = params.get(
            HIDING_ZONE_COMPRESSED_URL_PARAM,
        );

        if (hidingZoneOld !== null) {
            try {
                loadHidingZone(atob(hidingZoneOld));
                window.history.replaceState({}, "", window.location.pathname);
            } catch (e) {
                toast.error(`Invalid hiding zone settings: ${e}`);
            }
        } else if (hidingZoneCompressed !== null) {
            decompress(hidingZoneCompressed).then((data) => {
                try {
                    loadHidingZone(data);
                    window.history.replaceState(
                        {},
                        "",
                        window.location.pathname,
                    );
                } catch (e) {
                    toast.error(`Invalid hiding zone settings: ${e}`);
                }
            });
        }
    }, []);

    const loadHidingZone = (hidingZone: string) => {
        try {
            const geojson = JSON.parse(hidingZone);

            if (
                geojson.properties &&
                geojson.properties.isHidingZone === true
            ) {
                questions.set(
                    questionsSchema.parse(geojson.properties.questions ?? []),
                );
                mapGeoLocation.set(geojson);
                mapGeoJSON.set(null);
                polyGeoJSON.set(null);

                if (geojson.alternateLocations) {
                    additionalMapGeoLocations.set(geojson.alternateLocations);
                } else {
                    additionalMapGeoLocations.set([]);
                }
            } else {
                if (geojson.questions) {
                    questions.set(questionsSchema.parse(geojson.questions));
                    delete geojson.questions;

                    mapGeoJSON.set(geojson);
                    polyGeoJSON.set(geojson);
                } else {
                    questions.set([]);
                    mapGeoJSON.set(geojson);
                    polyGeoJSON.set(geojson);
                }
            }

            const incomingPresets =
                geojson.presets ?? geojson.properties?.presets;
            if (incomingPresets && Array.isArray(incomingPresets)) {
                try {
                    const normalized = (incomingPresets as any[])
                        .filter((p) => p && p.data)
                        .map((p) => {
                            return {
                                id:
                                    p.id ??
                                    (typeof crypto !== "undefined" &&
                                    typeof (crypto as any).randomUUID ===
                                        "function"
                                        ? (crypto as any).randomUUID()
                                        : String(Date.now()) + Math.random()),
                                name: p.name ?? "Imported preset",
                                type: p.type ?? "custom",
                                data: p.data,
                                createdAt:
                                    p.createdAt ?? new Date().toISOString(),
                            };
                        });
                    if (normalized.length > 0) {
                        customPresets.set(normalized);
                        toast.info(`Imported ${normalized.length} preset(s)`);
                    }
                } catch (err) {
                    console.warn("Failed to import presets", err);
                }
            }

            if (
                geojson.disabledStations !== null &&
                geojson.disabledStations.constructor === Array
            ) {
                disabledStations.set(geojson.disabledStations);
            }

            if (geojson.hidingRadius !== null) {
                hidingRadius.set(geojson.hidingRadius);
            }

            if (geojson.zoneOptions) {
                displayHidingZonesOptions.set(geojson.zoneOptions ?? []);
            }

            if (typeof geojson.useCustomStations === "boolean") {
                useCustomStations.set(geojson.useCustomStations);
            }

            if (
                geojson.customStations &&
                geojson.customStations.constructor === Array
            ) {
                customStations.set(geojson.customStations);
            }

            if (typeof geojson.includeDefaultStations === "boolean") {
                includeDefaultStations.set(geojson.includeDefaultStations);
            }

            toast.success("Hiding zone loaded successfully", {
                autoClose: 2000,
            });
        } catch (e) {
            toast.error(`Invalid hiding zone settings: ${e}`);
        }
    };

    return (
        <div
            className={cn(
                "flex justify-end gap-2 max-[412px]:!mb-4 max-[340px]:flex-col",
                className,
            )}
        >
            <Button
                className="shadow-md"
                onClick={async () => {
                    const hidingZoneString = JSON.stringify($hidingZone);
                    let compressedData;
                    try {
                        compressedData = await compress(hidingZoneString);
                    } catch (error) {
                        console.error("Compression failed:", error);
                        toast.error(`Failed to prepare data for sharing`);
                        return;
                    }

                    const baseUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
                    const shareUrl = `${baseUrl}?${HIDING_ZONE_COMPRESSED_URL_PARAM}=${compressedData}`;

                    // Show platform native share sheet if possible
                    await shareOrFallback(shareUrl).then((result) => {
                        if (result === false) {
                            return toast.error(
                                `Clipboard not supported. Try manually copying/pasting: ${shareUrl}`,
                                { className: "p-0 w-[1000px]" },
                            );
                        }

                        if (result === "clipboard") {
                            toast.success(
                                "Hiding zone URL copied to clipboard",
                                {
                                    autoClose: 2000,
                                },
                            );
                        }
                    });
                }}
            >
                Share
            </Button>
            <Drawer open={isOptionsOpen} onOpenChange={setOptionsOpen}>
                <DrawerTrigger className="w-24" asChild>
                    <Button className="w-24 shadow-md">Options</Button>
                </DrawerTrigger>
                <DrawerContent>
                    <div className="flex flex-col items-center gap-4 mb-4">
                        <div className="w-full max-w-[280px] sm:max-w-none flex justify-center mb-2 mt-4">
                            <Button
                                onClick={() => {
                                    setOptionsOpen(false);
                                    setTimeout(() => {
                                        showTutorial.set(true);
                                    }, 300);
                                }}
                                className="w-full sm:w-[280px]"
                            >
                                Start Tutorial
                            </Button>
                            <a
                                href={`${import.meta.env.BASE_URL}rules`}
                                className="w-full sm:w-[280px]"
                            >
                                <Button className="w-full">Rules & Tips</Button>
                            </a>
                        </div>
                        <DrawerHeader>
                            <DrawerTitle className="text-4xl font-semibold font-poppins">
                                Options
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="overflow-y-scroll max-h-[40vh] flex flex-col items-center gap-4 max-w-[1000px] px-4 sm:px-12 pb-10">
                            <div className="flex flex-row items-center gap-2 mt-2">
                                <label className="text-2xl font-semibold font-poppins text-center">
                                    Hider mode?
                                </label>
                                <Checkbox
                                    checked={!!$hiderMode}
                                    onCheckedChange={() => {
                                        if ($hiderMode === false) {
                                            const $leafletMapContext =
                                                leafletMapContext.get();

                                            if ($leafletMapContext) {
                                                const center =
                                                    $leafletMapContext.getCenter();
                                                hiderMode.set({
                                                    latitude: center.lat,
                                                    longitude: center.lng,
                                                });
                                            } else {
                                                hiderMode.set({
                                                    latitude: 0,
                                                    longitude: 0,
                                                });
                                            }
                                        } else {
                                            hiderMode.set(false);
                                        }
                                    }}
                                />
                            </div>
                            {$hiderMode !== false && (
                                <SidebarMenu>
                                    <LatitudeLongitude
                                        latitude={$hiderMode.latitude}
                                        longitude={$hiderMode.longitude}
                                        inlineEdit
                                        onChange={(latitude, longitude) => {
                                            $hiderMode.latitude =
                                                latitude ?? $hiderMode.latitude;
                                            $hiderMode.longitude =
                                                longitude ??
                                                $hiderMode.longitude;

                                            if (
                                                $hiderMode.latitude !== 0 ||
                                                $hiderMode.longitude !== 0
                                            ) {
                                                hiderMode.set({
                                                    ...$hiderMode,
                                                });
                                            }
                                        }}
                                        label="Location"
                                    />
                                </SidebarMenu>
                            )}
                            <Separator className="bg-slate-300 w-[280px]" />
                            <Label>Base map style</Label>
                            <Select
                                trigger="Base map style"
                                options={{
                                    voyager: "CARTO Voyager",
                                    light: "CARTO Light",
                                    dark: "CARTO Dark",
                                    osmcarto: "OpenStreetMap Carto",
                                }}
                                value={$baseTileLayer}
                                onValueChange={(v) =>
                                    baseTileLayer.set(v as any)
                                }
                            />
                            <Separator className="bg-slate-300 w-[280px]" />
                            <div className="flex flex-row items-center gap-2 text-center">
                                <label className="text-xl sm:text-2xl font-semibold font-poppins">
                                    Animate map movements?
                                </label>
                                <Checkbox
                                    checked={$animateMapMovements}
                                    onCheckedChange={() => {
                                        animateMapMovements.set(
                                            !$animateMapMovements,
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex flex-row items-center gap-2 text-center">
                                <label className="text-xl sm:text-2xl font-semibold font-poppins text-center">
                                    Show station connections overlay?
                                </label>
                                <Checkbox
                                    checked={$displayStationConnections}
                                    onCheckedChange={() => {
                                        displayStationConnections.set(
                                            !$displayStationConnections,
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex flex-row items-center gap-2 text-center">
                                <label className="text-xl sm:text-2xl font-semibold font-poppins text-center">
                                    Show transit lines overlay?
                                </label>
                                <Checkbox
                                    checked={$displayTransitLines}
                                    onCheckedChange={() => {
                                        displayTransitLines.set(
                                            !$displayTransitLines,
                                        );
                                    }}
                                />
                            </div>
                            <div className="flex flex-row items-center gap-2 text-center">
                                <label className="text-xl sm:text-2xl font-semibold font-poppins">
                                    Playtest Mode?
                                </label>
                                <Checkbox
                                    checked={$playtestMode}
                                    onCheckedChange={() => {
                                        if ($playtestMode === true) {
                                            const map = leafletMapContext.get();

                                            if (map) {
                                                map.eachLayer((layer: any) => {
                                                    if (
                                                        layer.questionKey ||
                                                        layer.questionKey === 0
                                                    ) {
                                                        map.removeLayer(layer);
                                                    }
                                                });
                                            }
                                        } else {
                                            questions.set([...questions.get()]);
                                        }

                                        playtestModeEnabled.set(!$playtestMode);
                                    }}
                                />
                            </div>
                            <div className="flex flex-row items-center gap-2 text-center">
                                <label className="text-xl sm:text-2xl font-semibold font-poppins">
                                    Auto save?
                                </label>
                                <Checkbox
                                    checked={$autoSave}
                                    onCheckedChange={() =>
                                        autoSave.set(!$autoSave)
                                    }
                                />
                            </div>

                            <div className="flex flex-row items-center gap-2 text-center">
                                <label className="text-xl sm:text-2xl font-semibold font-poppins">
                                    Follow Me (GPS)?
                                </label>
                                <Checkbox
                                    checked={$followMe}
                                    onCheckedChange={() =>
                                        followMe.set(!$followMe)
                                    }
                                />
                            </div>
                            <Separator className="bg-slate-300 w-[280px]" />
                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[280px] sm:max-w-none">
                                <Button
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                        if (!navigator || !navigator.clipboard)
                                            return toast.error(
                                                "Clipboard not supported",
                                            );
                                        navigator.clipboard.writeText(
                                            JSON.stringify($hidingZone),
                                        );
                                        toast.success(
                                            "Game state copied successfully",
                                            {
                                                autoClose: 2000,
                                            },
                                        );
                                    }}
                                >
                                    Copy Game State
                                </Button>
                                <Button
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                        if (!navigator || !navigator.clipboard)
                                            return toast.error(
                                                "Clipboard not supported",
                                            );
                                        navigator.clipboard
                                            .readText()
                                            .then(loadHidingZone);
                                    }}
                                >
                                    Paste Game State
                                </Button>
                            </div>
                            <Separator className="bg-slate-300 w-[280px]" />
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-[280px] sm:max-w-none">
                                <Button
                                    variant="destructive"
                                    className="w-full sm:w-[280px]"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                "Are you sure you want to reset everything? This will delete all saved data and settings.",
                                            )
                                        ) {
                                            localStorage.clear();
                                            sessionStorage.clear();
                                            sessionStorage.setItem(
                                                "resetEverything",
                                                "true",
                                            );
                                            window.location.reload();
                                        }
                                    }}
                                >
                                    Reset Everything
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-[280px] font-normal hover:bg-slate-200"
                                    onClick={() => {
                                        import("@/maps/api").then(
                                            ({ cacheAllPlaces }) => {
                                                cacheAllPlaces();
                                            },
                                        );
                                    }}
                                >
                                    Cache All Possible Places
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-[280px] font-normal hover:bg-slate-200"
                                    onClick={() => {
                                        import("@/maps/api").then(
                                            ({ clearCache, CacheType }) => {
                                                mapGeoJSON.set(null);
                                                polyGeoJSON.set(null);
                                                questions.set([]);
                                                clearCache(
                                                    CacheType.ZONE_CACHE,
                                                );
                                            },
                                        );
                                    }}
                                >
                                    Clear Questions & Cache
                                </Button>
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};
