import * as turf from "@turf/turf";
import _ from "lodash";
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
    findPlacesSpecificInZone,
    LOCATION_FIRST_TAG,
    prettifyLocation,
    QuestionSpecificLocation,
} from "@/maps/api";
import { arcBufferToPoint, modifyMapData, safeUnion } from "@/maps/geo-utils";
import type { APILocations, MeasureQuestion } from "@/maps/schema";

export const determineMeasureBoundary = async (question: MeasureQuestion) => {
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
                return [turf.multiPolygon([])];
            }

            if (data.elements.length >= 5000) {
                toast.error(
                    `Too many ${prettifyLocation(
                        location,
                        true,
                    ).toLowerCase()} found (${data.elements.length}).`,
                );
                return [turf.multiPolygon([])];
            }

            return [
                turf.combine(
                    turf.featureCollection(
                        data.elements.filter((x: any) => typeof (x.center?.lon ?? x.lon) === 'number' && typeof (x.center?.lat ?? x.lat) === 'number').map((x: any) =>
                            turf.point([
                                x.center ? x.center.lon : x.lon,
                                x.center ? x.center.lat : x.lat,
                            ]),
                        ),
                    ),
                ).features[0],
            ];
        }
        case "mcdonalds" as any:
        case "seven11" as any: {
            const points = await findPlacesSpecificInZone(
                (question.type as any) === "mcdonalds"
                    ? QuestionSpecificLocation.McDonalds
                    : QuestionSpecificLocation.Seven11,
            );
            if (!points || !points.features || points.features.length === 0)
                return [turf.multiPolygon([])];

            return points.features as any;
        }
        case "rail-measure" as any: {
            const stations = (calgaryTransitData as any).features;
            if (stations.length === 0) return [turf.multiPolygon([])];
            const fc = turf.featureCollection(
                stations.map((x: any) => ({
                    type: "Feature",
                    properties: x.properties,
                    geometry: x.geometry,
                })) as any[],
            );
            return fc.features as any;
        }
    }
};

const bufferedDeterminer = _.memoize(
    async (question: MeasureQuestion) => {
        const placeData = await determineMeasureBoundary(question);

        if (placeData === (false as any) || placeData === undefined)
            return false as any;

        return arcBufferToPoint(
            turf.featureCollection(placeData as any),
            question.lat,
            question.lng,
        );
    },
    (question) =>
        JSON.stringify({
            type: question.type,
            lat: question.lat,
            lng: question.lng,
            entirety: polyGeoJSON.get()
                ? polyGeoJSON.get()
                : mapGeoLocation.get(),
        }),
);

export const adjustPerMeasure = async (
    question: MeasureQuestion,
    mapData: any,
) => {
    if (mapData === null) return;

    const buffer = await bufferedDeterminer(question);

    if (buffer === (false as any)) return mapData;

    return modifyMapData(mapData, buffer as any, question.hiderCloser);
};

export const hiderifyMeasure = async (question: MeasureQuestion) => {
    const $hiderMode = hiderMode.get();
    if ($hiderMode === false) {
        return question;
    }

    if (mapGeoJSON.get() === null) return question;

    const hiderPoint = turf.point([$hiderMode.longitude, $hiderMode.latitude]);

    const buffer = await bufferedDeterminer(question);
    if (buffer === false) return question;

    const normalizedBuffer =
        "features" in buffer ? safeUnion(buffer as any) : buffer;

    if (turf.booleanPointInPolygon(hiderPoint, normalizedBuffer as any)) {
        question.hiderCloser = true;
    } else {
        question.hiderCloser = false;
    }

    return question;
};

export const measurePlanningPolygon = async (question: MeasureQuestion) => {
    try {
        const buffered = await bufferedDeterminer(question);

        if (buffered === false) return false;

        return turf.polygonToLine(buffered);
    } catch {
        return false;
    }
};

export const calculateMeasureDistance = async (
    question: MeasureQuestion,
): Promise<number | null> => {
    const seeker = turf.point([question.lng, question.lat]);

    switch (question.type) {
        case "rail-measure" as any: {
            const stations = (calgaryTransitData as any).features;
            if (stations.length === 0) return null;
            const nearestTrainStation = turf.nearestPoint(
                seeker,
                turf.featureCollection(
                    stations.map((x: any) => ({
                        type: "Feature",
                        properties: x.properties,
                        geometry: x.geometry,
                    })) as any,
                ),
            );
            return turf.distance(seeker, nearestTrainStation, {
                units: "kilometers",
            });
        }
        case "mcdonalds" as any:
        case "seven11" as any: {
            const points = await findPlacesSpecificInZone(
                (question.type as any) === "mcdonalds"
                    ? QuestionSpecificLocation.McDonalds
                    : QuestionSpecificLocation.Seven11,
            );
            if (!points || !points.features || points.features.length === 0)
                return null;
            const nearest = turf.nearestPoint(seeker, points as any);
            return turf.distance(seeker, nearest, { units: "kilometers" });
        }

        case "museum":
        case "hospital":
        case "cinema":
        case "library":
        case "golf_course": {
            const boundaryData = await determineMeasureBoundary(question);
            if (
                !boundaryData ||
                (Array.isArray(boundaryData) && boundaryData.length === 0)
            )
                return null;

            const features = Array.isArray(boundaryData)
                ? boundaryData
                : [boundaryData];
            const flattenedFeatures: any[] = [];

            for (const f of features) {
                if (f) {
                    if ((f as any).type === "FeatureCollection") {
                        flattenedFeatures.push(...(f as any).features);
                    } else if ((f as any).type === "Feature") {
                        flattenedFeatures.push(f);
                    }
                }
            }

            let minDistance = Infinity;

            for (const feature of flattenedFeatures) {
                if (!feature || !feature.geometry) continue;

                let dist = Infinity;
                if (feature.geometry.type === "Point") {
                    dist = turf.distance(seeker, feature, {
                        units: "kilometers",
                    });
                } else if (
                    feature.geometry.type === "Polygon" ||
                    feature.geometry.type === "MultiPolygon"
                ) {
                    dist = turf.pointToLineDistance(
                        seeker,
                        turf.polygonToLine(feature as any) as any,
                        {
                            units: "kilometers",
                            method: "geodesic",
                        },
                    );
                } else if (
                    feature.geometry.type === "LineString" ||
                    feature.geometry.type === "MultiLineString"
                ) {
                    dist = turf.pointToLineDistance(seeker, feature, {
                        units: "kilometers",
                        method: "geodesic",
                    });
                } else if (feature.geometry.type === "MultiPoint") {
                    for (const coord of feature.geometry.coordinates) {
                        const d = turf.distance(seeker, turf.point(coord), {
                            units: "kilometers",
                        });
                        if (d < dist) dist = d;
                    }
                }

                if (dist < minDistance) {
                    minDistance = dist;
                }
            }

            return minDistance === Infinity ? null : minDistance;
        }
    }

    return null;
};
