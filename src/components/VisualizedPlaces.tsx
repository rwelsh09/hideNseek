import { useStore } from "@nanostores/react";
import osm2geojson from "osm2geojson-lite";
import React, { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";

import { questions } from "@/lib/context";
import { findPlacesInZone } from "@/maps/api";
import { LOCATION_FIRST_TAG } from "@/maps/api/constants";
import { getFeatureCoords } from "@/maps/geo-utils";
import { PLACES } from "@/maps/placesConfig";

const pathOptionsCache: Record<
    string,
    { color: string; fillColor: string; fillOpacity: number }
> = {};

const getPathOptions = (colour: string) => {
    if (!pathOptionsCache[colour]) {
        pathOptionsCache[colour] = {
            color: colour,
            fillColor: colour,
            fillOpacity: 0.8,
        };
    }
    return pathOptionsCache[colour];
};

const TOOLTIP_OFFSET: [number, number] = [0, -10];

const VisualizedPlaceMarker = React.memo(function VisualizedPlaceMarker({
    coords,
    colour,
    name,
}: {
    coords: number[];
    colour: string;
    name: string;
}) {
    const centerArray = React.useMemo(
        () => [coords[1], coords[0]] as [number, number],
        [coords[1], coords[0]],
    );

    return (
        <CircleMarker
            center={centerArray}
            radius={5}
            pathOptions={getPathOptions(colour)}
        >
            <Tooltip direction="top" offset={TOOLTIP_OFFSET}>
                {name}
            </Tooltip>
        </CircleMarker>
    );
});

export const VisualizedPlaces = () => {
    const $questions = useStore(questions);

    const [places, setPlaces] = useState<any[]>([]);

    const typesHash = React.useMemo(() => {
        const typesSet = new Set<string>();
        const specificTypesSet = new Set<string>();

        $questions.forEach((q) => {
            const data = q.data as any;

            const isLocked = data.locked;
            if (isLocked || q.id === "closest") return;

            if (data.locationType) {
                typesSet.add(data.locationType);
            }

            if (data.type) {
                const type = data.type;
                const place = PLACES.find(
                    (p) => p.id === type || p.id === type.replace("-full", ""),
                );
                if (place) {
                    if (place.type === "specific" && place.specificLocation) {
                        specificTypesSet.add(place.specificLocation);
                    } else {
                        typesSet.add(place.id);
                    }
                }
            }
        });

        return JSON.stringify({
            standard: Array.from(typesSet).filter(
                (type) => (LOCATION_FIRST_TAG as any)[type],
            ).sort(),
            specific: Array.from(specificTypesSet).sort(),
        });
    }, [$questions]);

    useEffect(() => {
        let isMounted = true;

        const loadPlaces = async () => {
            const allPlaces: any[] = [];
            const { standard: standardTypesArray, specific: specificTypesArray } = JSON.parse(typesHash);

            const promises: Promise<void>[] = [];

            if (standardTypesArray.length > 0) {
                promises.push((async () => {
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
                            alternatives,
                        );

                        const processedData = {
                            ...rawData,
                            elements: rawData.elements.map((e: any) => {
                                if (
                                    (e.type === "way" || e.type === "relation") &&
                                    e.center
                                ) {
                                    return {
                                        ...e,
                                        type: "node",
                                        lat: e.center.lat,
                                        lon: e.center.lon,
                                        id: e.id,
                                        tags: e.tags,
                                    };
                                }
                                return e;
                            }),
                        };
                        const features = osm2geojson(processedData, { completeFeature: true });

                        if (features && features.features) {
                            features.features.forEach((f: any) => {
                                allPlaces.push({
                                    ...f,
                                    customColour: "purple", // distinct colour for visualized
                                });
                            });
                        }
                    } catch (e) {
                        console.error("Failed to load visualized places", e);
                    }
                })());
            }

            // Fetch specific types
            if (specificTypesArray.length > 0) {
                promises.push((async () => {
                    try {
                        const firstSpecific = specificTypesArray[0];
                        const specificAlternatives = specificTypesArray.slice(1);

                        const rawData = await findPlacesInZone(
                            firstSpecific,
                            undefined,
                            specificAlternatives,
                        );

                        const processedData = {
                            ...rawData,
                            elements: rawData.elements.map((e: any) => {
                                if (
                                    (e.type === "way" || e.type === "relation") &&
                                    e.center
                                ) {
                                    return {
                                        ...e,
                                        type: "node",
                                        lat: e.center.lat,
                                        lon: e.center.lon,
                                        id: e.id,
                                        tags: e.tags,
                                    };
                                }
                                return e;
                            }),
                        };
                        const features = osm2geojson(processedData, { completeFeature: true });

                        if (features && features.features) {
                            features.features.forEach((f: any) => {
                                allPlaces.push({
                                    ...f,
                                    customColour: "green",
                                });
                            });
                        }
                    } catch (e) {
                        console.error("Failed to load specific visualized places", e);
                    }
                })());
            }

            await Promise.all(promises);

            if (isMounted) {
                setPlaces(allPlaces);
            }
        };

        loadPlaces();

        return () => {
            isMounted = false;
        };
    }, [typesHash]);

    const markers = React.useMemo(() => {
        return places.map((place, i) => {
            const coords = getFeatureCoords(place);

            if (!coords) return null;

            const name =
                place?.properties?.name ??
                place?.properties?.["name:en"] ??
                "Unknown Place";
            const colour = place?.customColour ?? "orange";

            return (
                <VisualizedPlaceMarker
                    key={i}
                    coords={coords}
                    colour={colour}
                    name={name}
                />
            );
        });
    }, [places]);

    return (
        <>
            {markers}
        </>
    );
};
