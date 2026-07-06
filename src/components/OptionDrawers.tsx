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
import { SidebarMenu } from "./ui/sidebar-l";

const HIDING_ZONE_URL_PARAM = "hz";
const HIDING_ZONE_COMPRESSED_URL_PARAM = "hzc";

export const OptionDrawers = ({ className }: { className?: string }) => {
    useStore(triggerLocalRefresh);
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

                {/* Updated UI structure starts here */}
                <DrawerContent
                    onPointerDown={(e) => e.stopPropagation()}
                    className="max-h-[85vh]"
                >
                    <div className="mx-auto w-full max-w-lg overflow-y-auto pb-8 px-4 sm:px-8 custom-scrollbar">
                        <DrawerHeader className="pt-6 pb-4 sm:px-0">
                            <DrawerTitle className="text-3xl font-semibold font-poppins text-center sm:text-left">
                                Options
                            </DrawerTitle>
                        </DrawerHeader>

                        <div className="flex flex-col gap-8">
                            {/* --- Map & Game Settings Card --- */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                                    Map & Game Settings
                                </h3>
                                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden divide-y">
                                    {/* Hider Mode Toggle */}
                                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <Label
                                            htmlFor="hider-mode-toggle"
                                            className="flex-1 cursor-pointer text-base font-medium"
                                        >
                                            Hider Mode
                                        </Label>
                                        <Checkbox
                                            id="hider-mode-toggle"
                                            checked={!!$hiderMode}
                                            onCheckedChange={() => {
                                                if ($hiderMode === false) {
                                                    const $leafletMapContext =
                                                        leafletMapContext.get();
                                                    if ($leafletMapContext) {
                                                        const center =
                                                            $leafletMapContext.getCenter();
                                                        hiderMode.set({
                                                            latitude:
                                                                center.lat,
                                                            longitude:
                                                                center.lng,
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

                                    {/* Sub-menu for Hider Mode */}
                                    {$hiderMode !== false && (
                                        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/50 inner-shadow-sm">
                                            <SidebarMenu>
                                                <LatitudeLongitude
                                                    latitude={
                                                        $hiderMode.latitude
                                                    }
                                                    longitude={
                                                        $hiderMode.longitude
                                                    }
                                                    inlineEdit
                                                    onChange={(
                                                        latitude,
                                                        longitude,
                                                    ) => {
                                                        $hiderMode.latitude =
                                                            latitude ??
                                                            $hiderMode.latitude;
                                                        $hiderMode.longitude =
                                                            longitude ??
                                                            $hiderMode.longitude;

                                                        if (
                                                            $hiderMode.latitude !==
                                                                0 ||
                                                            $hiderMode.longitude !==
                                                                0
                                                        ) {
                                                            hiderMode.set({
                                                                ...$hiderMode,
                                                            });
                                                        }
                                                    }}
                                                    label="Location"
                                                />
                                            </SidebarMenu>
                                        </div>
                                    )}

                                    {/* Recommended Start Toggle */}
                                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <Label
                                            htmlFor="recommended-starting-point-toggle"
                                            className="flex-1 cursor-pointer text-base font-medium"
                                        >
                                            Starting Point
                                        </Label>
                                        <Checkbox
                                            id="recommended-starting-point-toggle"
                                            checked={$showRecommendedStart}
                                            onCheckedChange={() =>
                                                showRecommendedStart.set(
                                                    !$showRecommendedStart,
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Transit Overlay Toggle */}
                                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <Label
                                            htmlFor="transit-overlay-toggle"
                                            className="flex-1 cursor-pointer text-base font-medium"
                                        >
                                            Transit Lines on Map
                                        </Label>
                                        <Checkbox
                                            id="transit-overlay-toggle"
                                            checked={$displayTransitLines}
                                            onCheckedChange={() =>
                                                displayTransitLines.set(
                                                    !$displayTransitLines,
                                                )
                                            }
                                        />
                                    </div>

                                    {/* Follow Me Toggle */}
                                    <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                        <Label
                                            htmlFor="follow-me-toggle"
                                            className="flex-1 cursor-pointer text-base font-medium"
                                        >
                                            Follow Me (GPS)
                                        </Label>
                                        <Checkbox
                                            id="follow-me-toggle"
                                            checked={$followMe}
                                            onCheckedChange={() =>
                                                followMe.set(!$followMe)
                                            }
                                        />
                                    </div>

                                    {/* Map Layer Select */}
                                    <div className="flex items-center justify-between p-4 bg-slate-50/30 dark:bg-slate-900/30">
                                        <Label className="text-base font-medium text-muted-foreground mr-4">
                                            Map Layout
                                        </Label>
                                        <div className="w-[180px]">
                                            <Select
                                                trigger="Map"
                                                options={{
                                                    voyager: "CARTO Voyager",
                                                    light: "CARTO Light",
                                                    dark: "CARTO Dark",
                                                    osmcarto:
                                                        "OpenStreetMap Carto",
                                                }}
                                                value={$baseTileLayer}
                                                onValueChange={(v) =>
                                                    baseTileLayer.set(v as any)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* --- Learning & Help Actions --- */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
                                    Help & Learning
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            isOptionsOpenStore.set(false);
                                            setTimeout(() => {
                                                showTutorial.set(true);
                                            }, 300);
                                        }}
                                        className="w-full h-11"
                                    >
                                        Start Tutorial
                                    </Button>
                                    <a
                                        href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/rules/`}
                                        className="w-full"
                                        onClick={() => hasSeenRules.set(true)}
                                        data-tutorial-id="tutorial-rules-btn"
                                    >
                                        <Button
                                            variant="secondary"
                                            className="w-full h-11"
                                        >
                                            Rules & Tips
                                        </Button>
                                    </a>
                                </div>
                            </div>

                            {/* --- Donations Callout Box --- */}
                            <div className="rounded-xl border border-blue-200/60 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 p-5 space-y-4 shadow-sm">
                                <div className="space-y-1 text-center">
                                    <h4 className="font-semibold font-poppins text-blue-900 dark:text-blue-200">
                                        Support the Project
                                    </h4>
                                    <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
                                        Donate via PayPal
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <a
                                        href="https://paypal.me/hideNseekApp/4.03"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                            &quot;Hiding in the 403&quot;
                                            &mdash; $4.03
                                        </Button>
                                    </a>
                                    <a
                                        href="https://paypal.me/hideNseekApp/7"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                            &quot;7th Ave Free Zone&quot;
                                            &mdash; $7.00
                                        </Button>
                                    </a>
                                    <a
                                        href="https://paypal.me/hideNseekApp/15"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                            &quot;Lost in the +15s&quot; &mdash;
                                            $15.00
                                        </Button>
                                    </a>
                                </div>
                                <div className="pt-3 border-t border-blue-200/50 dark:border-blue-900/50 text-center">
                                    <p className="text-xs font-poppins text-blue-800/80 dark:text-blue-300/60">
                                        Or e-transfer to: <br />
                                        <span className="font-semibold select-all text-blue-950 dark:text-blue-100 block mt-1">
                                            hideNseekAppDonation@gmail.com
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* --- Data Management (Danger Zone) --- */}
                            <div className="space-y-3 pb-4">
                                <h3 className="text-sm font-semibold text-red-500/80 uppercase tracking-wider px-1">
                                    Data Management
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Button
                                        variant="outline"
                                        className="w-full h-11 bg-background hover:bg-slate-100 dark:hover:bg-slate-800"
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
                                        className="w-full h-11 shadow-sm"
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
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
    );
};
