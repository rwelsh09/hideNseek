import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import { FaGlobe } from "react-icons/fa";
import { MdMyLocation, MdZoomInMap } from "react-icons/md";
import { useMap } from "react-leaflet";
import { toast } from "react-toastify";

import {
    animateMapMovements,
    mapGeoLocation,
    questionFinishedMapData,
} from "@/lib/context";
import { holedMask } from "@/maps";

export const LeafletActionButtons = () => {
    const map = useMap();
    const $mapGeoLocation = useStore(mapGeoLocation);
    const $questionFinishedMapData = useStore(questionFinishedMapData);
    const $animateMapMovements = useStore(animateMapMovements);

    const buttonClass =
        "leaflet-full-screen-specific-name bg-white hover:bg-[#f4f4f4] w-[30px] h-[30px] rounded-sm leading-[30px] text-[22px] flex items-center justify-center border-2 border-black border-opacity-30 cursor-pointer";

    return (
        <>
            <button
                type="button"
                className={buttonClass}
                title="Focus on your location"
                aria-label="Focus on your location"
                onClick={() => {
                    if (!navigator.geolocation) {
                        toast.error(
                            "Geolocation is not supported by your browser",
                        );
                        return;
                    }
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            const { latitude, longitude } = pos.coords;
                            if ($animateMapMovements) {
                                map.flyTo([latitude, longitude], 12);
                            } else {
                                map.setView([latitude, longitude], 12);
                            }
                        },
                        () => {
                            toast.error("Unable to access your location.");
                        },
                    );
                }}
            >
                <MdMyLocation className="w-5 h-5 text-black" />
            </button>

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
                        const bounds = [
                            [bbox[1], bbox[0]],
                            [bbox[3], bbox[2]],
                        ];

                        if ($animateMapMovements) {
                            map.flyToBounds(bounds as any);
                        } else {
                            map.fitBounds(bounds as any);
                        }
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
                        const bounds = [
                            [extent[0], extent[1]],
                            [extent[2], extent[3]],
                        ];
                        if ($animateMapMovements) {
                            map.flyToBounds(bounds as any);
                        } else {
                            map.fitBounds(bounds as any);
                        }
                    } else {
                        // Fallback to Calgary or center if extent is missing
                        if ($mapGeoLocation?.geometry?.coordinates) {
                            const center = [
                                $mapGeoLocation.geometry.coordinates[1],
                                $mapGeoLocation.geometry.coordinates[0],
                            ] as [number, number];

                            if ($animateMapMovements) {
                                map.flyTo(center, 5);
                            } else {
                                map.setView(center, 5);
                            }
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
