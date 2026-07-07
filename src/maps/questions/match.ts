import * as turf from "@turf/turf";
import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";
import _ from "lodash";
import osmtogeojson from "osmtogeojson";
import { toast } from "react-toastify";

import calgaryTransitData from "@/data/calgary_rapid_transit_network.json";
import {
    hiderMode,
    mapGeoJSON,
    mapGeoLocation,
    polyGeoJSON,
} from "@/lib/context";
import {
    findPlacesInZone,
    LOCATION_FIRST_TAG,
    prettifyLocation,
} from "@/maps/api";
import {
    extractStationLines,
    extractStationName,
    geoSpatialVoronoi,
    holedMask,
    modifyMapData,
    safeUnion,
} from "@/maps/geo-utils";
import type { APILocations, MatchQuestion } from "@/maps/schema";

export const findMatchPlaces = async (question: MatchQuestion) => {
    switch (question.type) {
        case "museum":
        case "hospital":
        case "cinema":
        case "library":
        case "golf_course": {
            const location = question.type as APILocations;

            const data = await findPlacesInZone(
                `[${LOCATION_FIRST_TAG[location]}=${location}]`,
                `Finding ${prettifyLocation(location, true).toLowerCase()}...`,
                "nwr",
                "center",
            );

            if (data.remark && data.remark.startsWith("runtime error")) {
                toast.error(
                    `Error finding ${prettifyLocation(
                        location,
                        true,
                    ).toLowerCase()}.`,
                );
                return [];
            }

            if (data.elements.length >= 5000) {
                toast.error(
                    `Too many ${prettifyLocation(
                        location,
                        true,
                    ).toLowerCase()} found (${data.elements.length}).`,
                );
                return [];
            }

            return data.elements.map((x: any) =>
                turf.point([
                    x.center ? x.center.lon : x.lon,
                    x.center ? x.center.lat : x.lat,
                ]),
            );
        }
    }
};

export const determineMatchBoundary = _.memoize(
    async (question: MatchQuestion) => {
        let boundary: any = false;

        switch (question.type) {
            case "same-neighbourhood":
            case "same-first-letter-neighbourhood": {
                const data = osmtogeojson(
                    await findPlacesInZone(
                        '["admin_level"="10"]',
                        "Finding neighbourhoods...",
                        "nwr",
                        "geom",
                    ),
                ) as FeatureCollection<Polygon | MultiPolygon>;

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

                        const d = turf.distance(point, center);
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
                        const name = extractStationName(p);
                        return name && name[0].toUpperCase() === letter;
                    });

                    if (matchPolygons.length > 0) {
                        boundary = safeUnion(
                            turf.featureCollection(matchPolygons as any),
                        );
                    }
                }
                break;
            }

            case "same-first-letter-station":
            case "same-length-station":
            case "same-train-line": {
                const places =
                    calgaryTransitData as unknown as FeatureCollection<Point>;

                const point = turf.point([question.lng, question.lat]);
                const nearest = turf.nearestPoint(point, places);

                const seekerEnglishName = extractStationName(nearest);

                if (!seekerEnglishName) {
                    throw new Error("No English name found");
                }

                const voronoi = geoSpatialVoronoi(places.features as any);

                const matchCells = [];

                const mappedFeatures = voronoi.features.map((feature) => {
                    const station = feature.properties!.site;
                    return {
                        feature,
                        stationLines: extractStationLines(station),
                        stationEnglishName: extractStationName(station) as string,
                    };
                });

                if (question.type === "same-train-line") {
                    const seekerLines = extractStationLines(nearest);
                    for (const { feature, stationLines } of mappedFeatures) {
                        if (seekerLines.some((l) => stationLines.includes(l))) {
                            matchCells.push(feature);
                        }
                    }
                } else if (question.type === "same-first-letter-station") {
                    const letter = seekerEnglishName[0].toUpperCase();
                    for (const {
                        feature,
                        stationEnglishName,
                    } of mappedFeatures) {
                        if (
                            stationEnglishName &&
                            stationEnglishName[0].toUpperCase() === letter
                        ) {
                            matchCells.push(feature);
                        }
                    }
                } else if (question.type === "same-length-station") {
                    const length = seekerEnglishName.length;
                    for (const {
                        feature,
                        stationEnglishName,
                    } of mappedFeatures) {
                        if (stationEnglishName) {
                            if (
                                question.lengthComparison === "shorter" &&
                                stationEnglishName.length < length
                            ) {
                                matchCells.push(feature);
                            } else if (
                                question.lengthComparison === "longer" &&
                                stationEnglishName.length > length
                            ) {
                                matchCells.push(feature);
                            } else if (
                                (question.lengthComparison === "same" ||
                                    !question.lengthComparison) &&
                                stationEnglishName.length === length
                            ) {
                                matchCells.push(feature);
                            }
                        }
                    }
                }

                if (matchCells.length > 0) {
                    boundary = safeUnion(
                        turf.featureCollection(matchCells as any),
                    );
                }
                break;
            }
            case "museum":
            case "hospital":
            case "cinema":
            case "library":
            case "golf_course": {
                const data = await findMatchPlaces(question);

                const voronoi = geoSpatialVoronoi(data);
                const point = turf.point([question.lng, question.lat]);

                for (const feature of voronoi.features) {
                    if (turf.booleanPointInPolygon(point, feature)) {
                        boundary = feature;
                        break;
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

    const $mapGeoJSON = mapGeoJSON.get();
    if ($mapGeoJSON === null) return question;

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

    let feature = null;

    try {
        feature = holedMask((await adjustPerMatch(question, $mapGeoJSON))!);
    } catch {
        try {
            feature = await adjustPerMatch(question, {
                type: "FeatureCollection",
                features: [holedMask($mapGeoJSON)],
            });
        } catch {
            return question;
        }
    }

    if (feature === null || feature === undefined) return question;

    if (turf.booleanPointInPolygon(hiderPoint, feature)) {
        question.same = !question.same;
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
