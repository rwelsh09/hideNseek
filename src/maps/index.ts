import type { Feature, FeatureCollection } from "geojson";

import {
    adjustPerMatch,
    hiderifyMatch,
    matchPlanningPolygon,
} from "./questions/match";
import {
    adjustPerMeasure,
    hiderifyMeasure,
    measurePlanningPolygon,
} from "./questions/measure";
import {
    adjustPerRadius,
    hiderifyRadius,
    radiusPlanningPolygon,
} from "./questions/radius";
import {
    adjustPerClosest,
    hiderifyClosest,
    closestPlanningPolygon,
} from "./questions/closest";
import {
    adjustPerHotCold,
    hiderifyHotCold,
    hotColdPlanningPolygon,
} from "./questions/hot-cold";
import type { Question, Questions } from "./schema";

export * from "./geo-utils";

export const hiderifyQuestion = async (question: Question) => {
    if (question.data.drag) {
        switch (question.id) {
            case "radius":
                question.data = hiderifyRadius(question.data);
                break;
            case "hot-cold":
                question.data = await hiderifyHotCold(question.data);
                break;
            case "closest":
                question.data = await hiderifyClosest(question.data);
                break;
            case "match":
                question.data = await hiderifyMatch(question.data);
                break;
            case "measure":
                question.data = await hiderifyMeasure(question.data);
                break;
        }
    }

    return question;
};

export const determinePlanningPolygon = async (
    question: Question,
    liveUpdateMapEnabled: boolean,
) => {
    if (!liveUpdateMapEnabled && question.data.drag) {
        switch (question.id) {
            case "radius":
                return radiusPlanningPolygon(question.data);
            case "hot-cold":
                return hotColdPlanningPolygon(question.data);
            case "closest":
                return closestPlanningPolygon(question.data);
            case "match":
                return matchPlanningPolygon(question.data);
            case "measure":
                return measurePlanningPolygon(question.data);
        }
    }
};

export async function adjustMapGeoDataForQuestion(
    question: any,
    mapGeoData: any,
) {
    try {
        switch (question?.id) {
            case "radius":
                return await adjustPerRadius(question.data, mapGeoData);
            case "hot-cold":
                return await adjustPerHotCold(question.data, mapGeoData);
            case "closest":
                if (question.data.location === false) {
                    return adjustPerRadius(
                        { ...question.data, within: false },
                        mapGeoData,
                    );
                }
                return await adjustPerClosest(question.data, mapGeoData);
            case "match":
                return await adjustPerMatch(question.data, mapGeoData);
            case "measure":
                return await adjustPerMeasure(question.data, mapGeoData);
            default:
                return mapGeoData;
        }
    } catch {
        return mapGeoData;
    }
}

export async function applyQuestionsToMapGeoData(
    questions: Questions,
    mapGeoData: any,
    liveUpdateMapEnabled: boolean,
    planningModeCallback?: (
        polygon: FeatureCollection | Feature,
        question: any,
    ) => void,
): Promise<any> {
    if (planningModeCallback) {
        const planningPolygons = await Promise.all(
            questions.map((question) =>
                determinePlanningPolygon(question, liveUpdateMapEnabled),
            ),
        );

        for (let i = 0; i < questions.length; i++) {
            const planningPolygon = planningPolygons[i];
            if (planningPolygon) {
                planningModeCallback(planningPolygon, questions[i]);
            }
        }
    }

    for (const question of questions) {
        if (!liveUpdateMapEnabled && question.data.drag) {
            continue;
        }

        mapGeoData = await adjustMapGeoDataForQuestion(question, mapGeoData);

        if (mapGeoData.type !== "FeatureCollection") {
            mapGeoData = {
                type: "FeatureCollection",
                features: [mapGeoData],
            };
        }
    }
    return mapGeoData;
}
