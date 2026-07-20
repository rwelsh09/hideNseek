import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import * as L from "leaflet";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { FaGlobe } from "react-icons/fa";
import { MdMyLocation, MdZoomInMap } from "react-icons/md";
import { useMap } from "react-leaflet";
import { toast } from "react-toastify";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    followMe,
    geolocationPermission,
    mapGeoLocation,
    questionFinishedMapData,
    showTutorial,
    tutorialDriver,
} from "@/lib/context";
import { holedMask } from "@/maps";
import { flyToWithOffset } from "@/maps/ui-utils";

export const LeafletActionButtons = () => {
    const map = useMap();
    const [isLocating, setIsLocating] = useState(false);
    const $mapGeoLocation = useStore(mapGeoLocation);
    const $questionFinishedMapData = useStore(questionFinishedMapData);
    const $showTutorial = useStore(showTutorial);
    const $tutorialDriver = useStore(tutorialDriver);
    const $geolocationPermission = useStore(geolocationPermission);

    const buttonClass =
        "leaflet-full-screen-specific-name bg-white hover:bg-[#f4f4f4] w-[34px] h-[34px] p-0 rounded-[4px] flex items-center justify-center border-[2px] border-[rgba(0,0,0,0.2)] bg-clip-padding cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const handleLocationFocus = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        if (geolocationPermission.get() === "denied") {
            toast.error("Location access denied.", {
                toastId: "location-denied",
            });
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setIsLocating(false);
                geolocationPermission.set("granted");
                followMe.set(true);
                const { latitude, longitude } = pos.coords;
                flyToWithOffset(map, L.latLng(latitude, longitude), 12);
            },
            (error) => {
                setIsLocating(false);
                if (error.code === error.PERMISSION_DENIED) {
                    geolocationPermission.set("denied");
                    toast.error("Location access denied.", {
                        toastId: "location-denied",
                    });
                } else {
                    toast.error("Unable to access your location.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <>
            {$geolocationPermission !== "granted" ? (
                <AlertDialog
                    onOpenChange={(open) => {
                        if (open && $showTutorial && $tutorialDriver) {
                            $tutorialDriver.destroy();
                        }
                        if (!open && $showTutorial && $tutorialDriver) {
                            $tutorialDriver.drive();
                        }
                    }}
                >
                    <AlertDialogTrigger asChild>
                        <button
                            type="button"
                            className={buttonClass}
                            title="Focus on your location"
                            aria-label="Focus on your location"
                            disabled={isLocating}
                        >
                            {isLocating ? (
                                <Loader2 className="w-5 h-5 text-black animate-spin" />
                            ) : (
                                <MdMyLocation className="w-5 h-5 text-black" />
                            )}
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Location Access Required
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                To use your location in Questions and enable the
                                Follow-Me feature, we need to see your location.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Not Now</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLocationFocus}>
                                Allow
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : (
                <button
                    type="button"
                    className={buttonClass}
                    title="Focus on your location"
                    aria-label="Focus on your location"
                    onClick={handleLocationFocus}
                    disabled={isLocating}
                >
                    {isLocating ? (
                        <Loader2 className="w-5 h-5 text-black animate-spin" />
                    ) : (
                        <MdMyLocation className="w-5 h-5 text-black" />
                    )}
                </button>
            )}

            <button
                type="button"
                className={buttonClass}
                title="Zoom to hider area"
                aria-label="Zoom to hider area"
                onClick={() => {
                    if (!$questionFinishedMapData) {
                        toast.error("No hider area to zoom to");
                        return;
                    }

                    try {
                        const bbox = turf.bbox(
                            holedMask($questionFinishedMapData) as any,
                        );
                        const boundsObj = L.latLngBounds([
                            [bbox[1], bbox[0]],
                            [bbox[3], bbox[2]],
                        ]);

                        const center = boundsObj.getCenter();
                        const zoom = map.getBoundsZoom(boundsObj);

                        flyToWithOffset(map, center, zoom);
                    } catch {
                        toast.error("Error calculating bounds for hider area");
                    }
                }}
            >
                <MdZoomInMap className="w-5 h-5 text-black" />
            </button>

            <button
                type="button"
                className={buttonClass}
                title="Show whole map"
                aria-label="Show whole map"
                onClick={() => {
                    const extent = $mapGeoLocation?.properties?.extent;
                    if (extent) {
                        const boundsObj = L.latLngBounds([
                            [extent[0], extent[1]],
                            [extent[2], extent[3]],
                        ]);

                        const center = boundsObj.getCenter();
                        const zoom = map.getBoundsZoom(boundsObj);

                        flyToWithOffset(map, center, zoom);
                    } else {
                        if ($mapGeoLocation?.geometry?.coordinates) {
                            const center = [
                                $mapGeoLocation.geometry.coordinates[1],
                                $mapGeoLocation.geometry.coordinates[0],
                            ] as [number, number];

                            flyToWithOffset(
                                map,
                                L.latLng(center[0], center[1]),
                                11,
                            );
                        } else {
                            toast.error("Map extent is unavailable");
                        }
                    }
                }}
            >
                <FaGlobe className="w-5 h-5 text-black" />
            </button>
        </>
    );
};
