import * as turf from "@turf/turf";
import _ from "lodash";
import { toast } from "react-toastify";

import {
    hiderMode,
    mapGeoJSON,
    mapGeoLocation,
    polyGeoJSON,
    trainStations,
} from "@/lib/context";
import {
    findPlacesInZone,
    findPlacesSpecificInZone,
    LOCATION_FIRST_TAG,
    nearestToQuestion,
    prettifyLocation,
    QuestionSpecificLocation,
} from "@/maps/api";
import { arcBufferToPoint, holedMask, modifyMapData } from "@/maps/geo-utils";
import type {
    APILocations,
    HomeGameMeasuringQuestions,
    MeasuringQuestion,
} from "@/maps/schema";

export const determineMeasuringBoundary = async (
    question: MeasuringQuestion,
) => {
    switch (question.type) {
        case "mcdonalds":
        case "seven11":
        case "rail-measure":
        case "museum-full":
        case "hospital-full":
        case "cinema-full":
        case "library-full":
        case "golf_course-full": {
            let data: any;
            if (question.type === "rail-measure") {
                const stations = trainStations.get();
                data = {
                    elements: stations.map((x) => ({
                        type: "node",
                        id: (x.properties as any).id,
                        lat: x.geometry.coordinates[1],
                        lon: x.geometry.coordinates[0],
                    }))
                };
            } else if (question.type === "mcdonalds" || question.type === "seven11") {
                const pointsData = await findPlacesSpecificInZone(
                    question.type === "mcdonalds"
                        ? QuestionSpecificLocation.McDonalds
                        : QuestionSpecificLocation.Seven11,
                );

                data = {
                    elements: pointsData.features.map((x: any) => ({
                        type: "node",
                        id: x.properties?.id,
                        lat: x.geometry.coordinates[1],
                        lon: x.geometry.coordinates[0],
                    }))
                };
            } else {
                const location = question.type.split("-full")[0] as APILocations;
                data = await findPlacesInZone(
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
                    return [turf.multiPolygon([])];
                }
            }

            if (data.elements.length >= 5000) {
                toast.error(
                    `Too many ${prettifyLocation(
                        location as unknown as APILocations,
                        true,
                    ).toLowerCase()} found (${data.elements.length}).`,
                );
                return [turf.multiPolygon([])];
            }

            return [
                turf.combine(
                    turf.featureCollection(
                        data.elements.map((x: any) =>
                            turf.point([
                                x.center ? x.center.lon : x.lon,
                                x.center ? x.center.lat : x.lat,
                            ]),
                        ),
                    ),
                ).features[0],
            ];
        }
        case "custom-measure":
            return turf.combine(
                turf.featureCollection((question as any).geo.features),
            ).features;
        case "museum":
        case "hospital":
        case "cinema":
        case "library":
        case "golf_course":
            return false;
    }
};

const bufferedDeterminer = _.memoize(
    async (question: MeasuringQuestion) => {
        const placeData = await determineMeasuringBoundary(question);

        if (placeData === false || placeData === undefined) return false;

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
            geo: (question as any).geo,
        }),
);

export const adjustPerMeasuring = async (
    question: MeasuringQuestion,
    mapData: any,
) => {
    if (mapData === null) return;

    const buffer = await bufferedDeterminer(question);

    if (buffer === false) return mapData;

    return modifyMapData(mapData, buffer, question.hiderCloser);
};

export const hiderifyMeasuring = async (question: MeasuringQuestion) => {
    const $hiderMode = hiderMode.get();
    if ($hiderMode === false) {
        return question;
    }

    if (
        ["museum", "hospital", "cinema", "library", "golf_course"].includes(
            question.type,
        )
    ) {
        const questionNearest = await nearestToQuestion(
            question as HomeGameMeasuringQuestions,
        );
        const hiderNearest = await nearestToQuestion({
            lat: $hiderMode.latitude,
            lng: $hiderMode.longitude,
            hiderCloser: true,
            type: (question as HomeGameMeasuringQuestions).type,
            drag: false,
            color: "black",
            collapsed: false,
        });

        question.hiderCloser =
            questionNearest.properties.distanceToPoint >
            hiderNearest.properties.distanceToPoint;

        return question;
    }

    if (question.type === "rail-measure") {
        const stations = trainStations.get();

        if (stations.length === 0) {
            return question;
        }

        const location = turf.point([question.lng, question.lat]);

        const nearestTrainStation = turf.nearestPoint(
            location,
            turf.featureCollection(stations.map((x) => x.properties)),
        );

        const distance = turf.distance(location, nearestTrainStation);

        const hider = turf.point([$hiderMode.longitude, $hiderMode.latitude]);

        const hiderNearest = turf.nearestPoint(
            hider,
            turf.featureCollection(stations.map((x) => x.properties)),
        );

        const hiderDistance = turf.distance(hider, hiderNearest);

        question.hiderCloser = hiderDistance < distance;
    }

    if (question.type === "mcdonalds" || question.type === "seven11") {
        const points = await findPlacesSpecificInZone(
            question.type === "mcdonalds"
                ? QuestionSpecificLocation.McDonalds
                : QuestionSpecificLocation.Seven11,
        );

        const seeker = turf.point([question.lng, question.lat]);
        const nearest = turf.nearestPoint(seeker, points as any);

        const distance = turf.distance(seeker, nearest, {
            units: "kilometers",
        });

        const hider = turf.point([$hiderMode.longitude, $hiderMode.latitude]);
        const hiderNearest = turf.nearestPoint(hider, points as any);

        const hiderDistance = turf.distance(hider, hiderNearest, {
            units: "kilometers",
        });

        question.hiderCloser = hiderDistance < distance;
        return question;
    }

    const $mapGeoJSON = mapGeoJSON.get();
    if ($mapGeoJSON === null) return question;

    let feature = null;

    try {
        feature = holedMask((await adjustPerMeasuring(question, $mapGeoJSON))!);
    } catch {
        try {
            feature = await adjustPerMeasuring(question, {
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
        question.hiderCloser = !question.hiderCloser;
    }

    return question;
};

export const measuringPlanningPolygon = async (question: MeasuringQuestion) => {
    try {
        const buffered = await bufferedDeterminer(question);

        if (buffered === false) return false;

        return turf.polygonToLine(buffered);
    } catch {
        return false;
    }
};

export const calculateMeasuringDistance = async (
    question: MeasuringQuestion,
): Promise<number | null> => {
    const seeker = turf.point([question.lng, question.lat]);

    switch (question.type) {
        case "rail-measure": {
            const stations = trainStations.get();
            if (stations.length === 0) return null;
            const nearestTrainStation = turf.nearestPoint(
                seeker,
                turf.featureCollection(
                    stations.map((x) => ({
                        type: "Feature",
                        properties: x.properties,
                        geometry: x.properties.geometry,
                    })) as any,
                ),
            );
            return turf.distance(seeker, nearestTrainStation, {
                units: "kilometers",
            });
        }
        case "mcdonalds":
        case "seven11": {
            const points = await findPlacesSpecificInZone(
                question.type === "mcdonalds"
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
            const nearest = await nearestToQuestion(
                question as HomeGameMeasuringQuestions,
            );
            if (
                !nearest ||
                !nearest.properties ||
                nearest.properties.distanceToPoint === undefined
            )
                return null;
            return nearest.properties.distanceToPoint;
        }

        case "museum-full":
        case "hospital-full":
        case "cinema-full":
        case "library-full":
        case "golf_course-full":
        case "custom-measure": {
            const boundaryData = await determineMeasuringBoundary(question);
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
