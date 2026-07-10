import { useStore } from "@nanostores/react";
import osmtogeojson from "osmtogeojson";
import React, { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";

import { questions } from "@/lib/context";
import { findPlacesInZone } from "@/maps/api";
import { LOCATION_FIRST_TAG } from "@/maps/api/constants";
import { getFeatureCoords } from "@/maps/geo-utils";

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

const TOOLTIP_OFFSET: [number, number] = [0, -10];

const PlaytestPlaceMarker = ({
    coords,
    color,
    name,
}: {
    coords: number[];
    color: string;
    name: string;
}) => {
    const centerArray = React.useMemo(
        () => [coords[1], coords[0]] as [number, number],
        [coords[1], coords[0]],
    );

    return (
        <CircleMarker
            center={centerArray}
            radius={5}
            pathOptions={getPathOptions(color)}
        >
            <Tooltip direction="top" offset={TOOLTIP_OFFSET}>
                {name}
            </Tooltip>
        </CircleMarker>
    );
};

export const PlaytestPlaces = () => {
    const $questions = useStore(questions);

    const [places, setPlaces] = useState<any[]>([]);

    useEffect(() => {
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
                if (isLocked || q.id === "closest") return;

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
            const standardTypesArray = Array.from(typesSet).filter(
                (type) => (LOCATION_FIRST_TAG as any)[type],
            );

            if (standardTypesArray.length > 0) {
                const firstType = standardTypesArray[0];
                const firstTag = (LOCATION_FIRST_TAG as any)[firstType];

                const alternatives = standardTypesArray.slice(1).map((type) => {
                    const tag = (LOCATION_FIRST_TAG as any)[type];
                    return `[${tag}=${type}]`;
                });

                try {
                    const rawData = await findPlacesInZone(
                        `[${firstTag}=${firstType}]`,
                        undefined,
                        "nwr",
                        "center",
                        alternatives,
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
                    console.error("Failed to load playtest places", e);
                }
            }

            // Fetch specific types
            const specificTypesArray = Array.from(specificTypesSet);
            if (specificTypesArray.length > 0) {
                try {
                    const firstSpecific = specificTypesArray[0];
                    const specificAlternatives = specificTypesArray.slice(1);

                    const rawData = await findPlacesInZone(
                        firstSpecific,
                        undefined,
                        "nwr",
                        "center",
                        specificAlternatives,
                        0,
                    );

                    const features = osmtogeojson(rawData);

                    if (features && features.features) {
                        features.features.forEach((f: any) => {
                            allPlaces.push({
                                ...f,
                                customColor: "green",
                            });
                        });
                    }
                } catch (e) {
                    console.error("Failed to load specific playtest places", e);
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
    }, [$questions]);

    return (
        <>
            {places.map((place, i) => {
                const coords = getFeatureCoords(place);

                if (!coords) return null;

                const name =
                    place?.properties?.name ??
                    place?.properties?.["name:en"] ??
                    "Unknown Place";
                const color = place?.customColor ?? "orange";

                return (
                    <PlaytestPlaceMarker
                        key={i}
                        coords={coords}
                        color={color}
                        name={name}
                    />
                );
            })}
        </>
    );
};
