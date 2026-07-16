import * as turf from "@turf/turf";
import { toast } from "react-toastify";

import calgaryTransitData from "@/data/calgary_rapid_transit_network.json";
import {
    disabledStations,
    hidingRadius,
    hidingRadiusUnits,
    isLoading,
    lockedActiveStationIds,
    questionFinishedMapData,
    questions,
    trainStations,
} from "@/lib/context";
import { type StationPlace } from "@/maps/api";
import {
    extractStationId,
    extractStationLines,
    extractStationName,
    safeUnion,
} from "@/maps/geo-utils";

let previousQuestionDisabled: string[] = [];

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

        let circles = places.map((place) => {
            const radius = $hidingRadius;
            const center = turf.getCoord(place);
            return turf.circle(center, radius, {
                steps: 32,
                units: $hidingRadiusUnits,
                properties: place,
            });
        });

        // Reset disabled stations since we are recalculating
        const currentDisabledForReset = disabledStations.get();
        const previousSet = new Set(previousQuestionDisabled);
        const manuallyDisabled = currentDisabledForReset.filter(
            (id) => !previousSet.has(id),
        );
        disabledStations.set(manuallyDisabled);
        const newlyDisabledStations: string[] = [];

        circles.forEach((circle) => {
            const diff = turf.difference(
                turf.featureCollection([circle, unionized]),
            );
            if (!diff || turf.area(diff) < 1) {
                const id = extractStationId(circle);
                if (!manuallyDisabled.includes(id)) {
                    newlyDisabledStations.push(id);
                }
            }
        });

        const lockedIds = lockedActiveStationIds.get();
        for (const question of questions.get()) {
            if (circles.length === 0) break;

            if (!question.data.locked) {
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

                const originalIds = circles.map((c) => extractStationId(c));
                const originalCirclesState = [...circles];

                if (question.data.type === "same-train-line") {
                    const seekerLines =
                        extractStationLines(nearestTrainStation);

                    if (seekerLines.length > 0) {
                        circles = circles.filter((circle) => {
                            const hiderLines = extractStationLines(circle);

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

                const remainingIds = circles.map((c) => extractStationId(c));
                const newlyDisabled = originalIds.filter(
                    (id) =>
                        !remainingIds.includes(id) &&
                        !manuallyDisabled.includes(id),
                );
                newlyDisabledStations.push(...newlyDisabled);

                if (lockedIds) {
                    // Restore circles array if it's locked so base shapes do not change
                    circles = originalCirclesState;
                }
            }
        }

        trainStations.set(circles);

        if (newlyDisabledStations.length > 0) {
            const currentDisabled = disabledStations.get();
            disabledStations.set(
                Array.from(
                    new Set([...currentDisabled, ...newlyDisabledStations]),
                ),
            );
        }
        previousQuestionDisabled = newlyDisabledStations;
    } finally {
        isLoading.set(false);
    }
};
