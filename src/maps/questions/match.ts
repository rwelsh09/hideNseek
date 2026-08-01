import * as turf from "@turf/turf";
import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";
import _ from "lodash";
import osm2geojson from "osm2geojson-lite";
import { toast } from "react-toastify";

import calgaryTransitData from "@/data/calgary_rapid_transit_network.json";
import {
    hiderMode,
    mapGeoJSON,
    mapGeoLocation,
    polyGeoJSON,
} from "@/lib/context";
import { findPlacesInZone, LOCATION_FIRST_TAG } from "@/maps/api";
import {
    extractStationLines,
    extractStationName,
    fastDistance,
    geoSpatialVoronoi,
    modifyMapData,
    safeUnion,
} from "@/maps/geo-utils";
import { PLACES } from "@/maps/placesConfig";
import type { MatchQuestion } from "@/maps/schema";

export const findMatchPlaces = async (question: MatchQuestion) => {
    const place = PLACES.find((p) => p.id === question.type);
    if (place) {
        const location = place.id;
        let data;
        if (place.type === "specific" && place.specificLocation) {
            data = await findPlacesInZone(
                place.specificLocation,
                `Finding ${place.labelPlural.toLowerCase()}...`,
            );
        } else {
            data = await findPlacesInZone(
                `[${LOCATION_FIRST_TAG[location]}=${location}]`,
                `Finding ${place.labelPlural.toLowerCase()}...`,
            );
        }

        if (data.elements.length >= 5000) {
            toast.error(
                `Too many ${place.labelPlural.toLowerCase()} found (${data.elements.length}).`,
            );
            return turf.featureCollection([]);
        }

        return turf.featureCollection(
            data.elements
                .filter(
                    (x: any) =>
                        typeof (x.center?.lon ?? x.lon) === "number" &&
                        typeof (x.center?.lat ?? x.lat) === "number",
                )
                .map((x: any) =>
                    turf.point([
                        x.center ? x.center.lon : x.lon,
                        x.center ? x.center.lat : x.lat,
                    ]),
                ),
        );
    }
};

export const determineMatchBoundary = _.memoize(
    async (question: MatchQuestion) => {
        let boundary;

        switch (question.type) {
            case "same-neighbourhood":
            case "same-first-letter-neighbourhood": {
                const rawData = await findPlacesInZone(
                    '["admin_level"="10"]',
                    "Finding neighbourhoods...",
                );

                const data = osm2geojson(rawData, {
                    completeFeature: true,
                }) as FeatureCollection<Polygon | MultiPolygon>;

                if (!data.features || data.features.length === 0) {
                    toast.error("No neighbourhood polygons found in this map");
                    throw new Error("No neighbourhoods found");
                }

                const point = turf.point([question.lng, question.lat]);

                let nearest: any = null;
                for (const feature of data.features) {
                    if (
                        feature.geometry.type !== "Polygon" &&
                        feature.geometry.type !== "MultiPolygon"
                    )
                        continue;
                    if (turf.booleanPointInPolygon(point, feature)) {
                        nearest = feature;
                        break;
                    }
                }

                if (!nearest) {
                    let minDistance = Infinity;
                    for (const feature of data.features) {
                        if (
                            feature.geometry.type !== "Polygon" &&
                            feature.geometry.type !== "MultiPolygon"
                        )
                            continue;

                        let center = feature.properties?.center;
                        if (!center) {
                            center = turf.center(feature);
                            if (!feature.properties) {
                                feature.properties = {};
                            }
                            feature.properties.center = center;
                        }

                        const d = fastDistance(
                            point.geometry.coordinates as [number, number],
                            center.geometry.coordinates as [number, number],
                        );
                        if (d < minDistance) {
                            minDistance = d;
                            nearest = feature;
                        }
                    }
                }

                if (!nearest) {
                    throw new Error("No nearest found");
                }

                if (question.type === "same-neighbourhood") {
                    boundary = nearest;
                } else {
                    const hiderEnglishName = extractStationName(nearest);
                    if (!hiderEnglishName) {
                        toast.error(
                            "No English name found for nearest neighbourhood",
                        );
                        throw new Error("No English name found");
                    }
                    const letter = hiderEnglishName[0].toUpperCase();

                    const matchPolygons = data.features.filter((p: any) => {
                        if (
                            p.geometry.type !== "Polygon" &&
                            p.geometry.type !== "MultiPolygon"
                        ) {
                            return false;
                        }
                        const name = extractStationName(p);
                        return name && name[0].toUpperCase() === letter;
                    });

                    if (matchPolygons.length > 0) {
                        boundary = safeUnion(
                            turf.featureCollection(matchPolygons as any),
                        );
                        if (boundary) {
                            if (!boundary.properties) boundary.properties = {};
                            boundary.properties.name = hiderEnglishName;
                        }
                    }
                }
                break;
            }

            case "same-first-letter-station":
            case "same-length-station":
            case "same-train-line": {
                return false;
            }
            default: {
                const place = PLACES.find((p) => p.id === question.type);
                if (place) {
                    const data = await findMatchPlaces(question);
                    if (!data) break;

                    const voronoi = geoSpatialVoronoi(data);
                    const point = turf.point([question.lng, question.lat]);

                    for (const feature of voronoi.features) {
                        if (turf.booleanPointInPolygon(point, feature)) {
                            boundary = feature;
                            break;
                        }
                    }
                }
                break;
            }
        }

        return boundary;
    },
    (question: MatchQuestion & { cat?: unknown }) =>
        JSON.stringify({
            type: question.type,
            lat: question.lat,
            lng: question.lng,
            lengthComparison: question.lengthComparison,
            cat: question.cat,
            entirety: polyGeoJSON.get()
                ? polyGeoJSON.get()
                : mapGeoLocation.get(),
        }),
);

export const adjustPerMatch = async (question: MatchQuestion, mapData: any) => {
    if (mapData === null) return;

    const boundary = await determineMatchBoundary(question);

    if (boundary === false) {
        return mapData;
    }

    return modifyMapData(mapData, boundary, question.same);
};

export const hiderifyMatch = async (question: MatchQuestion) => {
    const $hiderMode = hiderMode.get();
    if ($hiderMode === false) {
        return question;
    }

    if (mapGeoJSON.get() === null) return question;

    const hiderPoint = turf.point([$hiderMode.longitude, $hiderMode.latitude]);

    if (
        question.type === "same-first-letter-station" ||
        question.type === "same-length-station" ||
        question.type === "same-train-line"
    ) {
        const places =
            calgaryTransitData as unknown as FeatureCollection<Point>;

        const seekerPoint = turf.point([question.lng, question.lat]);
        const nearestSeekerStation = turf.nearestPoint(seekerPoint, places);

        const seekerEnglishName = extractStationName(nearestSeekerStation);

        if (!seekerEnglishName) {
            return question;
        }

        const nearestHiderStation = turf.nearestPoint(hiderPoint, places);
        const hiderEnglishName = extractStationName(nearestHiderStation);

        if (!hiderEnglishName) {
            return question;
        }

        if (question.type === "same-train-line") {
            const seekerLines = extractStationLines(nearestSeekerStation);
            const hiderLines = extractStationLines(nearestHiderStation);
            if (seekerLines.some((l) => hiderLines.includes(l))) {
                question.same = true;
            } else {
                question.same = false;
            }
        } else if (question.type === "same-first-letter-station") {
            const seekerLetter = seekerEnglishName[0].toUpperCase();
            const hiderLetter = hiderEnglishName[0].toUpperCase();
            question.same = seekerLetter === hiderLetter;
        } else if (question.type === "same-length-station") {
            const seekerLength = seekerEnglishName.length;
            const hiderLength = hiderEnglishName.length;

            if (question.lengthComparison === "shorter") {
                question.same = hiderLength < seekerLength;
            } else if (question.lengthComparison === "longer") {
                question.same = hiderLength > seekerLength;
            } else {
                question.same = hiderLength === seekerLength;
            }
        }

        return question;
    }

    const boundary = await determineMatchBoundary(question);
    if (boundary === false) return question;

    const normalizedBoundary =
        "features" in boundary ? safeUnion(boundary) : boundary;

    if (turf.booleanPointInPolygon(hiderPoint, normalizedBoundary)) {
        question.same = true;
    } else {
        question.same = false;
    }

    return question;
};

export const matchPlanningPolygon = async (question: MatchQuestion) => {
    try {
        const boundary = await determineMatchBoundary(question);

        if (boundary === false) {
            return false;
        }

        return turf.polygonToLine(boundary);
    } catch {
        return false;
    }
};

export const isMatchLocked = (question: any, detail?: string) => {
    return question.type === (detail || "museum");
};

export const createMatchDraft = (
    center: any,
    detail: string | undefined,
    isLocked: boolean,
) => {
    return {
        lat: center.lat,
        lng: center.lng,
        locked: false,
        doubledPenalty: isLocked,
        type: detail || "museum",
        same: true,
        colour: "red",
    };
};

export const getMatchPlaceName = async (question: MatchQuestion) => {
    if (
        question.type === "same-first-letter-station" ||
        question.type === "same-length-station" ||
        question.type === "same-train-line"
    ) {
        const places =
            calgaryTransitData as unknown as FeatureCollection<Point>;

        const seekerPoint = turf.point([question.lng, question.lat]);
        const nearestSeekerStation = turf.nearestPoint(seekerPoint, places);

        const seekerEnglishName = extractStationName(nearestSeekerStation);

        if (!seekerEnglishName) {
            return null;
        }

        if (question.type === "same-train-line") {
            const lines = extractStationLines(nearestSeekerStation);
            return `${seekerEnglishName} (${lines.join(", ")})`;
        }

        return seekerEnglishName;
    }

    try {
        const boundary = await determineMatchBoundary(question);
        if (!boundary) return null;

        const name =
            extractStationName(boundary) ||
            (boundary.properties
                ? boundary.properties.name || boundary.properties["name:en"]
                : null);

        if (!name) return null;

        const place = PLACES.find((p) => p.id === question.type);
        if (
            place &&
            question.type !== "same-neighbourhood" &&
            question.type !== "same-first-letter-neighbourhood"
        ) {
            return `${name} (${place.label})`;
        }
        return name;
    } catch {
        return null;
    }
};

export const filterMatchHidingZones = (
    data: MatchQuestion,
    circles: any[],
    places: any[],
) => {
    if (
        data.type !== "same-first-letter-station" &&
        data.type !== "same-length-station" &&
        data.type !== "same-train-line"
    ) {
        return circles;
    }

    const location = turf.point([data.lng, data.lat]);
    const nearestTrainStation = turf.nearestPoint(
        location,
        turf.featureCollection(places) as any,
    );

    let filteredCircles = [...circles];

    if (data.type === "same-train-line") {
        const seekerLines = extractStationLines(nearestTrainStation);

        if (seekerLines.length > 0) {
            filteredCircles = filteredCircles.filter((circle) => {
                const hiderLines = extractStationLines(circle);
                const intersects = seekerLines.some((l) =>
                    hiderLines.includes(l),
                );
                return data.same ? intersects : !intersects;
            });
        }
    }

    const englishName = extractStationName(nearestTrainStation);
    if (!englishName) {
        toast.error("No English name found");
        return circles;
    }

    if (data.type === "same-first-letter-station") {
        const letter = englishName[0].toUpperCase();
        filteredCircles = filteredCircles.filter((circle) => {
            const name = extractStationName(circle.properties);
            if (!name) return false;
            return data.same
                ? name[0].toUpperCase() === letter
                : name[0].toUpperCase() !== letter;
        });
    } else if (data.type === "same-length-station") {
        const seekerLength = englishName.length;
        const comparison = data.lengthComparison;
        filteredCircles = filteredCircles.filter((circle) => {
            const name = extractStationName(circle.properties);
            if (!name) return false;
            let isMatch = false;
            if (comparison === "same") {
                isMatch = name.length === seekerLength;
            } else if (comparison === "shorter") {
                isMatch = name.length < seekerLength;
            } else if (comparison === "longer") {
                isMatch = name.length > seekerLength;
            }
            return data.same ? isMatch : !isMatch;
        });
    }

    return filteredCircles;
};
