import { useStore } from "@nanostores/react";
import osmtogeojson from "osmtogeojson";
import React, { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";

import { liveUpdateMapEnabled, questions } from "@/lib/context";
import { findPlacesInZone, findPlacesSpecificInZone } from "@/maps/api";
import { LOCATION_FIRST_TAG } from "@/maps/api/constants";

// Performance Optimization: Cache path options for different colors to prevent react-leaflet
// from re-triggering layer styling methods due to unstable object references on every render.
const pathOptionsCache: Record<
    string,
    { color: string; fillColor: string; fillOpacity: number }
> = {};

const getPathOptions = (color: string) => {
    if (!pathOptionsCache[color]) {
        pathOptionsCache[color] = {
            color: color,
            fillColor: color,
            fillOpacity: 0.8,
        };
    }
    return pathOptionsCache[color];
};

export const PlaytestPlaces = () => {
    const $liveUpdateMapEnabled = useStore(liveUpdateMapEnabled);
    const $questions = useStore(questions);

    const [places, setPlaces] = useState<any[]>([]);

    useEffect(() => {
        if ($liveUpdateMapEnabled) return;

        let isMounted = true;

        const loadPlaces = async () => {
            const allPlaces: any[] = [];
            const typesSet = new Set<string>();
            const specificTypesSet = new Set<string>();

            // Collect required location types from questions
            $questions.forEach((q) => {
                const data = q.data as any;

                // Note: According to src/maps/schema.ts, `drag` is synonymous with `unlocked`.
                // Therefore, data.drag === false means the question is currently locked.
                const isLocked = data.drag === false;
                if (isLocked) return;

                if (data.locationType) {
                    typesSet.add(data.locationType);
                }

                if (data.type) {
                    const type = data.type;
                    if (type === "mcdonalds")
                        specificTypesSet.add('["brand:wikidata"="Q38076"]');
                    else if (type === "seven11")
                        specificTypesSet.add('["brand:wikidata"="Q259340"]');
                    else if (type.endsWith("-full")) {
                        typesSet.add(type.replace("-full", ""));
                    } else if (
                        type === "museum" ||
                        type === "hospital" ||
                        type === "cinema" ||
                        type === "library" ||
                        type === "golf_course"
                    ) {
                        typesSet.add(type);
                    }
                }
            });

            // Fetch standard location types
            for (const type of Array.from(typesSet)) {
                if ((LOCATION_FIRST_TAG as any)[type]) {
                    const tag = (LOCATION_FIRST_TAG as any)[type];
                    try {
                        const rawData = await findPlacesInZone(
                            `[${tag}=${type}]`,
                            undefined,
                            "nwr",
                            "center",
                            [],
                            0,
                        );

                        const features = osmtogeojson(rawData);

                        if (features && features.features) {
                            features.features.forEach((f: any) => {
                                allPlaces.push({
                                    ...f,
                                    customColor: "purple", // distinct color for playtest
                                });
                            });
                        }
                    } catch (e) {
                        console.error(
                            "Failed to load playtest places for",
                            type,
                            e,
                        );
                    }
                }
            }

            // Fetch specific types
            for (const specificType of Array.from(specificTypesSet)) {
                try {
                    const features = await findPlacesSpecificInZone(
                        specificType as any,
                    );
                    if (features && features.features) {
                        features.features.forEach((f: any) => {
                            allPlaces.push({
                                ...f,
                                customColor: "green",
                            });
                        });
                    }
                } catch (e) {
                    console.error(
                        "Failed to load specific playtest places for",
                        specificType,
                        e,
                    );
                }
            }

            if (isMounted) {
                setPlaces(allPlaces);
            }
        };

        loadPlaces();

        return () => {
            isMounted = false;
        };
    }, [$liveUpdateMapEnabled, $questions]);

    if ($liveUpdateMapEnabled) return null;

    return (
        <>
            {places.map((place, i) => {
                const coords =
                    place?.geometry?.coordinates ??
                    (place?.properties?.lon && place?.properties?.lat
                        ? [place.properties.lon, place.properties.lat]
                        : null);

                if (!coords) return null;

                const name =
                    place?.properties?.name ??
                    place?.properties?.["name:en"] ??
                    "Unknown Place";
                const color = place?.customColor ?? "orange";

                return (
                    <CircleMarker
                        key={i}
                        center={[coords[1], coords[0]]}
                        radius={5}
                        pathOptions={getPathOptions(color)}
                    >
                        <Tooltip direction="top" offset={[0, -10]}>
                            {name}
                        </Tooltip>
                    </CircleMarker>
                );
            })}
        </>
    );
};
