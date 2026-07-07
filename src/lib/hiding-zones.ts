import * as turf from "@turf/turf";
import { toast } from "react-toastify";

import calgaryTransitData from "@/data/calgary_rapid_transit_network.json";
import {
    hidingRadius,
    hidingRadiusUnits,
    isLoading,
    questionFinishedMapData,
    questions,
    trainStations,
} from "@/lib/context";
import {
    findPlacesSpecificInZone,
    QuestionSpecificLocation,
    type StationPlace,
} from "@/maps/api";
import { extractStationName, safeUnion } from "@/maps/geo-utils";

export const initializeHidingZonesLogic = async () => {
    const $hidingRadius = hidingRadius.get();
    const $hidingRadiusUnits = hidingRadiusUnits.get();
    const $questionFinishedMapData = questionFinishedMapData.get();

    if (!$questionFinishedMapData) return;

    isLoading.set(true);

    try {
        const places: StationPlace[] = [];

        const transitFeatures = (calgaryTransitData as any).features.map(
            (f: any) => ({
                type: "Feature",
                geometry: f.geometry,
                properties: {
                    ...f.properties,
                    id:
                        f.properties?.["@id"] ||
                        f.id ||
                        `${f.geometry.coordinates[1]},${f.geometry.coordinates[0]}`,
                    name: f.properties?.name,
                },
            }),
        );
        places.push(...transitFeatures);

        const unionized = safeUnion(
            turf.simplify($questionFinishedMapData, {
                tolerance: 0.001,
            }),
        );

        let circles = places
            .map((place) => {
                const radius = $hidingRadius;
                const center = turf.getCoord(place);
                return turf.circle(center, radius, {
                    steps: 32,
                    units: $hidingRadiusUnits,
                    properties: place,
                });
            })
            .filter((circle) => {
                return !turf.booleanWithin(circle, unionized);
            });

        for (const question of questions.get()) {
            if (circles.length === 0) break;

            if (question.data.drag) {
                continue;
            }

            if (
                question.id === "match" &&
                (question.data.type === "same-first-letter-station" ||
                    question.data.type === "same-length-station" ||
                    question.data.type === "same-train-line")
            ) {
                const location = turf.point([
                    question.data.lng,
                    question.data.lat,
                ]);
                const nearestTrainStation = turf.nearestPoint(
                    location,
                    turf.featureCollection(places) as any,
                );

                if (question.data.type === "same-train-line") {
                    const seekerLines: string[] =
                        nearestTrainStation.properties.properties?.lines ||
                        (nearestTrainStation.properties as any).lines ||
                        [];

                    if (seekerLines.length > 0) {
                        circles = circles.filter((circle) => {
                            const hiderLines: string[] =
                                circle.properties.properties?.lines ||
                                (circle.properties as any).lines ||
                                [];

                            const intersects = seekerLines.some((l) =>
                                hiderLines.includes(l),
                            );

                            return question.data.same
                                ? intersects
                                : !intersects;
                        });
                    }
                }

                const englishName = extractStationName(nearestTrainStation);
                if (!englishName) {
                    toast.error("No English name found");
                    return;
                }

                if (question.data.type === "same-first-letter-station") {
                    const letter = englishName[0].toUpperCase();
                    circles = circles.filter((circle) => {
                        const name = extractStationName(circle.properties);
                        if (!name) return false;
                        return question.data.same
                            ? name[0].toUpperCase() === letter
                            : name[0].toUpperCase() !== letter;
                    });
                } else if (question.data.type === "same-length-station") {
                    const seekerLength = englishName.length;
                    const comparison = question.data.lengthComparison;
                    circles = circles.filter((circle) => {
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
                        return question.data.same ? isMatch : !isMatch;
                    });
                }
            }
            if (
                question.id === "measure" &&
                ((question.data as any).type === "mcdonalds" ||
                    (question.data as any).type === "seven11")
            ) {
                const points = await findPlacesSpecificInZone(
                    (question.data as any).type === "mcdonalds"
                        ? QuestionSpecificLocation.McDonalds
                        : QuestionSpecificLocation.Seven11,
                );

                if (points.features.length === 0) {
                    circles = [];
                    continue;
                }

                const nearestPoint = turf.nearestPoint(
                    turf.point([question.data.lng, question.data.lat]),
                    points as any,
                );
                const distance = turf.distance(
                    turf.point([question.data.lng, question.data.lat]),
                    nearestPoint as any,
                    { units: "kilometers" },
                );

                circles = circles.filter((circle) => {
                    const point = turf.point(turf.getCoord(circle.properties));
                    const nearest = turf.nearestPoint(point, points as any);
                    return question.data.hiderCloser
                        ? turf.distance(point, nearest as any, {
                              units: "kilometers",
                          }) <
                              distance + $hidingRadius
                        : turf.distance(point, nearest as any, {
                              units: "kilometers",
                          }) >
                              distance - $hidingRadius;
                });
            }
        }

        trainStations.set(circles);
    } finally {
        isLoading.set(false);
    }
};
