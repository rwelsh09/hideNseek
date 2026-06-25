import * as turf from "@turf/turf";
import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";
import _ from "lodash";
import osmtogeojson from "osmtogeojson";
import { toast } from "react-toastify";

import calgaryTransitData from "@/data/calgary_rapid_transit_network.json";
import { hiderMode, mapGeoLocation, polyGeoJSON } from "@/lib/context";
import {
    findPlacesInZone,
    LOCATION_FIRST_TAG,
    prettifyLocation,
} from "@/maps/api";
import { modifyMapData, safeUnion } from "@/maps/geo-utils";
import { geoSpatialVoronoi } from "@/maps/geo-utils";
import type { APILocations, MatchingQuestion } from "@/maps/schema";

export const findMatchingPlaces = async (question: MatchingQuestion) => {
    switch (question.type) {
        case "museum-full":
        case "hospital-full":
        case "cinema-full":
        case "library-full":
        case "golf_course-full": {
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

            case "museum-full":
            case "hospital-full":
            case "cinema-full":
            case "library-full":
            case "golf_course-full": {
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
    (question: MatchingQuestion & { cat?: unknown }) =>
        JSON.stringify({
            type: question.type,
            lat: question.lat,
            lng: question.lng,
            cat: question.cat,
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

    if (
        question.type === "same-first-letter-station" ||
        question.type === "same-length-station" ||
        question.type === "same-train-line"
    ) {
        return mapData;
    }

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
        const nearestHiderStation = turf.nearestPoint(hiderPoint, places);

        const seekerEnglishName =
            (nearestSeekerStation.properties as any)["name:en"] ||
            nearestSeekerStation.properties.name;

        const hiderEnglishName =
            (nearestHiderStation.properties as any)["name:en"] ||
            nearestHiderStation.properties.name;

        if (!seekerEnglishName || !hiderEnglishName) {
            return question;
        }

        let isMatch = false;

        if (question.type === "same-train-line") {
            const seekerLines: string[] =
                (nearestSeekerStation.properties as any).lines || [];
            const hiderLines: string[] =
                (nearestHiderStation.properties as any).lines || [];

            isMatch = seekerLines.some((l) => hiderLines.includes(l));
        } else if (question.type === "same-first-letter-station") {
            isMatch =
                seekerEnglishName[0].toUpperCase() ===
                hiderEnglishName[0].toUpperCase();
        } else if (question.type === "same-length-station") {
            const seekerLength = seekerEnglishName.length;
            const hiderLength = hiderEnglishName.length;

            if (question.lengthComparison === "shorter") {
                isMatch = hiderLength < seekerLength;
            } else if (question.lengthComparison === "longer") {
                isMatch = hiderLength > seekerLength;
            } else {
                isMatch = hiderLength === seekerLength;
            }
        }

        if (!isMatch) {
            question.same = !question.same;
        }

        return question;
    }

    const feature = await determineMatchingBoundary(question);

    if (feature === null || feature === undefined || feature === false)
        return question;

    if (!turf.booleanPointInPolygon(hiderPoint, feature)) {
        question.same = !question.same;
    }

    return question;
};

export const matchingPlanningPolygon = async (question: MatchingQuestion) => {
    if (
        question.type === "same-first-letter-station" ||
        question.type === "same-length-station" ||
        question.type === "same-train-line"
    ) {
        return false;
    }

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
