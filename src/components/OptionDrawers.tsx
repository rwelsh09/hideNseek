import { useStore } from "@nanostores/react";
import { useEffect } from "react";
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
    baseTileLayer,
    disabledStations,
    displayTransitLines,
    followMe,
    hasSeenRules,
    headStartMinutes,
    hiderMode,
    hidingRadius,
    hidingZone,
    isOptionsOpenStore,
    leafletMapContext,
    mapGeoJSON,
    mapGeoLocation,
    polyGeoJSON,
    questions,
    showRecommendedStart,
    showTutorial,
    triggerLocalRefresh,
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
    const $hidingZone = useStore(hidingZone);
    const $baseTileLayer = useStore(baseTileLayer);
    const $followMe = useStore(followMe);
    const $displayTransitLines = useStore(displayTransitLines);
    const $showRecommendedStart = useStore(showRecommendedStart);
    const $isOptionsOpenStore = useStore(isOptionsOpenStore);

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

            if (
                geojson.disabledStations !== null &&
                geojson.disabledStations.constructor === Array
            ) {
                disabledStations.set(geojson.disabledStations);
            }

            if (geojson.hidingRadius !== null) {
                hidingRadius.set(geojson.hidingRadius);
            }

            if (typeof geojson.headStartMinutes === "number") {
                headStartMinutes.set(geojson.headStartMinutes);
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
                data-tutorial-id="tutorial-share-state-btn"
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
            <Drawer
                open={$isOptionsOpenStore}
                onOpenChange={isOptionsOpenStore.set}
            >
                <DrawerTrigger className="w-24" asChild>
                    <Button
                        className="w-24 shadow-md"
                        data-tutorial-id="tutorial-options-btn"
                    >
                        Options
                    </Button>
                </DrawerTrigger>
                <DrawerContent onPointerDown={(e) => e.stopPropagation()}>
                    <div className="flex flex-col items-center gap-4 mb-4 overflow-y-scroll max-h-[85vh]">
                        <div className="w-full max-w-[280px] sm:max-w-none flex flex-col sm:flex-row gap-4 justify-center mb-2 mt-4">
                            <Button
                                onClick={() => {
                                    isOptionsOpenStore.set(false);
                                    setTimeout(() => {
                                        showTutorial.set(true);
                                    }, 300);
                                }}
                                className="w-full sm:w-[280px]"
                            >
                                Start Tutorial
                            </Button>
                            <a
                                href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/rules`}
                                className="w-full sm:w-[280px]"
                                onClick={() => hasSeenRules.set(true)}
                                data-tutorial-id="tutorial-rules-btn"
                            >
                                <Button className="w-full">Rules & Tips</Button>
                            </a>
                        </div>

                        <div className="flex flex-col items-center gap-2 mt-2 w-full max-w-[280px] sm:max-w-[576px]">
                            <p className="text-sm font-semibold text-gray-500 font-poppins text-center">
                                Support the project via PayPal:
                            </p>
                            <a
                                href="https://paypal.me/hideNseekApp/4.03"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-[280px]"
                            >
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-auto py-2">
                                    <span className="whitespace-normal">
                                        &quot;Hiding in the 403&quot; &mdash;
                                        $4.03
                                    </span>
                                </Button>
                            </a>
                            <a
                                href="https://paypal.me/hideNseekApp/7"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-[280px]"
                            >
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-auto py-2">
                                    <span className="whitespace-normal">
                                        &quot;7th Ave Free Zone&quot; &mdash;
                                        $7.00
                                    </span>
                                </Button>
                            </a>
                            <a
                                href="https://paypal.me/hideNseekApp/15"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-[280px]"
                            >
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-auto py-2">
                                    <span className="whitespace-normal">
                                        &quot;Lost in the +15s&quot; &mdash;
                                        $15.00
                                    </span>
                                </Button>
                            </a>
                            <p className="text-sm text-gray-500 font-poppins text-center mt-1">
                                Or e-transfer to: <br />
                                <span className="font-semibold select-all">
                                    hideNseekAppDonation@gmail.com
                                </span>
                            </p>
                        </div>

                        <DrawerHeader>
                            <DrawerTitle className="text-4xl font-semibold font-poppins underline">
                                Options
                            </DrawerTitle>
                        </DrawerHeader>
                        <div className="flex flex-col items-center gap-4 max-w-[1000px] px-4 sm:px-12 pb-10">
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
                            <div className="flex flex-row items-center gap-2 text-center">
                                <label
                                    className="text-xl sm:text-2xl font-semibold font-poppins text-center"
                                    htmlFor="recommended-starting-point-toggle"
                                >
                                    Starting Point?
                                </label>
                                <Checkbox
                                    id="recommended-starting-point-toggle"
                                    checked={$showRecommendedStart}
                                    onCheckedChange={() => {
                                        showRecommendedStart.set(
                                            !$showRecommendedStart,
                                        );
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
                            <Label>Map</Label>
                            <Select
                                trigger="Map"
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
                            <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-[280px] sm:max-w-none">
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
                                    Pre-save All Places
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="w-full sm:w-[280px]"
                                    onClick={async () => {
                                        if (
                                            window.confirm(
                                                "Are you sure you want to reset everything? This will delete all saved data and settings.",
                                            )
                                        ) {
                                            if ("caches" in window) {
                                                const keys =
                                                    await caches.keys();
                                                await Promise.all(
                                                    keys.map((key) =>
                                                        caches.delete(key),
                                                    ),
                                                );
                                            }
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
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};
