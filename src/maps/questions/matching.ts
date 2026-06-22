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
    nearestToQuestion,
    prettifyLocation,
} from "@/maps/api";
import { holedMask, modifyMapData, safeUnion } from "@/maps/geo-utils";
import { geoSpatialVoronoi } from "@/maps/geo-utils";
import type {
    APILocations,
    HomeGameMatchingQuestions,
    MatchingQuestion,
} from "@/maps/schema";

export const findMatchingPlaces = async (question: MatchingQuestion) => {
    switch (question.type) {
        case "major-city": {
            return (
                await findPlacesInZone(
                    '[place=city]["population"~"^[1-9]+[0-9]{6}$"]', // The regex is faster than (if:number(t["population"])>1000000)
                    "Finding cities...",
                )
            ).elements.map((x: any) =>
                turf.point([
                    x.center ? x.center.lon : x.lon,
                    x.center ? x.center.lat : x.lat,
                ]),
            );
        }
        case "peak-full":
        case "museum-full":
        case "hospital-full":
        case "cinema-full":
        case "library-full":
        case "golf_course-full":
        case "consulate-full": {
            const location = question.type.split("-full")[0] as APILocations;

            const data = await findPlacesInZone(
                `[${LOCATION_FIRST_TAG[location]}=${location}]`,
                `Finding ${prettifyLocation(location, true).toLowerCase()}...`,
                "nwr",
                "center",
                [],
                60,
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

export const determineMatchingBoundary = _.memoize(
    async (question: MatchingQuestion) => {
        let boundary;

        switch (question.type) {
            case "peak":
            case "museum":
            case "hospital":
            case "cinema":
            case "library":
            case "golf_course":
            case "consulate":
            case "same-first-letter-station":
            case "same-length-station":
            case "same-train-line": {
                return false;
            }
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
                        const d = turf.distance(point, turf.center(feature));
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
                    const hiderEnglishName =
                        nearest.properties?.["name:en"] ||
                        nearest.properties?.name;
                    if (!hiderEnglishName) {
                        toast.error(
                            "No English name found for nearest neighbourhood",
                        );
                        throw new Error("No English name found");
                    }
                    const letter = hiderEnglishName[0].toUpperCase();

                    const matchingPolygons = data.features.filter((p: any) => {
                        const name =
                            p.properties?.["name:en"] || p.properties?.name;
                        return name && name[0].toUpperCase() === letter;
                    });

                    if (matchingPolygons.length > 0) {
                        boundary = safeUnion(
                            turf.featureCollection(matchingPolygons as any),
                        );
                    }
                }
                break;
            }
            case "custom-zone": {
                boundary = question.geo;
                break;
            }
            case "major-city":
            case "peak-full":
            case "museum-full":
            case "hospital-full":
            case "cinema-full":
            case "library-full":
            case "golf_course-full":
            case "consulate-full": {
                const data = await findMatchingPlaces(question);

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
    (question: MatchingQuestion & { geo?: unknown; cat?: unknown }) =>
        JSON.stringify({
            type: question.type,
            lat: question.lat,
            lng: question.lng,
            cat: question.cat,
            geo: question.geo,
            entirety: polyGeoJSON.get()
                ? polyGeoJSON.get()
                : mapGeoLocation.get(),
        }),
);

export const adjustPerMatching = async (
    question: MatchingQuestion,
    mapData: any,
) => {
    if (mapData === null) return;

    const boundary = await determineMatchingBoundary(question);

    if (boundary === false) {
        return mapData;
    }

    return modifyMapData(mapData, boundary, question.same);
};

export const hiderifyMatching = async (question: MatchingQuestion) => {
    const $hiderMode = hiderMode.get();
    if ($hiderMode === false) {
        return question;
    }

    if (
        [
            "peak",
            "museum",
            "hospital",
            "cinema",
            "library",
            "golf_course",
            "consulate",
        ].includes(question.type)
    ) {
        const questionNearest = await nearestToQuestion(
            question as HomeGameMatchingQuestions,
        );
        const hiderNearest = await nearestToQuestion({
            lat: $hiderMode.latitude,
            lng: $hiderMode.longitude,
            same: true,
            type: (question as HomeGameMatchingQuestions).type,
            drag: false,
            color: "black",
            collapsed: false,
        });

        question.same =
            questionNearest.properties.name === hiderNearest.properties.name;

        return question;
    }

    if (
        question.type === "same-neighbourhood" ||
        question.type === "same-first-letter-neighbourhood"
    ) {
        const hiderPoint = turf.point([
            $hiderMode.longitude,
            $hiderMode.latitude,
        ]);
        const seekerPoint = turf.point([question.lng, question.lat]);

        const data = osmtogeojson(
            await findPlacesInZone(
                '["admin_level"="10"]',
                "Finding neighbourhoods...",
                "nwr",
                "geom",
            ),
        ) as FeatureCollection<Polygon | MultiPolygon>;

        if (!data.features || data.features.length === 0) return question;

        const findNearest = (pt: any) => {
            let nearest: any = null;
            for (const feature of data.features) {
                if (
                    feature.geometry.type !== "Polygon" &&
                    feature.geometry.type !== "MultiPolygon"
                )
                    continue;
                if (turf.booleanPointInPolygon(pt, feature)) {
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
                    const d = turf.distance(pt, turf.center(feature));
                    if (d < minDistance) {
                        minDistance = d;
                        nearest = feature;
                    }
                }
            }
            return nearest;
        };

        const nearestHiderNeighbourhood = findNearest(hiderPoint);
        const nearestSeekerNeighbourhood = findNearest(seekerPoint);

        if (!nearestHiderNeighbourhood || !nearestSeekerNeighbourhood) {
            return question;
        }

        if (question.type === "same-neighbourhood") {
            if (
                nearestHiderNeighbourhood.id === nearestSeekerNeighbourhood.id
            ) {
                question.same = true;
            } else {
                question.same = false;
            }
        } else {
            const hiderEnglishName =
                nearestHiderNeighbourhood.properties?.["name:en"] ||
                nearestHiderNeighbourhood.properties?.name;
            const seekerEnglishName =
                nearestSeekerNeighbourhood.properties?.["name:en"] ||
                nearestSeekerNeighbourhood.properties?.name;

            if (!hiderEnglishName || !seekerEnglishName) {
                return question;
            }

            if (
                hiderEnglishName[0].toUpperCase() ===
                seekerEnglishName[0].toUpperCase()
            ) {
                question.same = true;
            } else {
                question.same = false;
            }
        }

        return question;
    }

    if (
        question.type === "same-first-letter-station" ||
        question.type === "same-length-station" ||
        question.type === "same-train-line"
    ) {
        const hiderPoint = turf.point([
            $hiderMode.longitude,
            $hiderMode.latitude,
        ]);
        const seekerPoint = turf.point([question.lng, question.lat]);

        const places =
            calgaryTransitData as unknown as FeatureCollection<Point>;

        const nearestHiderTrainStation = turf.nearestPoint(hiderPoint, places);
        const nearestSeekerTrainStation = turf.nearestPoint(
            seekerPoint,
            places,
        );

        if (question.type === "same-train-line") {
            const seekerLines: string[] =
                (nearestSeekerTrainStation.properties as any).lines || [];
            const hiderLines: string[] =
                (nearestHiderTrainStation.properties as any).lines || [];

            if (seekerLines.some((l) => hiderLines.includes(l))) {
                question.same = true;
            } else {
                question.same = false;
            }
        }

        const hiderEnglishName =
            (nearestHiderTrainStation.properties as any)["name:en"] ||
            nearestHiderTrainStation.properties.name;
        const seekerEnglishName =
            (nearestSeekerTrainStation.properties as any)["name:en"] ||
            nearestSeekerTrainStation.properties.name;

        if (!hiderEnglishName || !seekerEnglishName) {
            return question;
        }

        if (question.type === "same-first-letter-station") {
            if (
                hiderEnglishName[0].toUpperCase() ===
                seekerEnglishName[0].toUpperCase()
            ) {
                question.same = true;
            } else {
                question.same = false;
            }
        } else if (question.type === "same-length-station") {
            if (hiderEnglishName.length === seekerEnglishName.length) {
                question.lengthComparison = "same";
            } else if (hiderEnglishName.length < seekerEnglishName.length) {
                question.lengthComparison = "shorter";
            } else {
                question.lengthComparison = "longer";
            }
        }

        return question;
    }

    const $mapGeoJSON = mapGeoJSON.get();
    if ($mapGeoJSON === null) return question;

    let feature = null;

    try {
        feature = holedMask((await adjustPerMatching(question, $mapGeoJSON))!);
    } catch {
        try {
            feature = await adjustPerMatching(question, {
                type: "FeatureCollection",
                features: [holedMask($mapGeoJSON)],
            });
        } catch {
            return question;
        }
    }

    if (feature === null || feature === undefined) return question;

    const hiderPoint = turf.point([$hiderMode.longitude, $hiderMode.latitude]);

    if (turf.booleanPointInPolygon(hiderPoint, feature)) {
        question.same = !question.same;
    }

    return question;
};

export const matchingPlanningPolygon = async (question: MatchingQuestion) => {
    try {
        const boundary = await determineMatchingBoundary(question);

        if (boundary === false) {
            return false;
        }

        return turf.polygonToLine(boundary);
    } catch {
        return false;
    }
};
