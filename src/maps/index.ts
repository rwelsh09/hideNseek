import type { Feature, FeatureCollection } from "geojson";

import {
    adjustPerClosest,
    closestPlanningPolygon,
    hiderifyClosest,
} from "./questions/closest";
import {
    adjustPerHotCold,
    hiderifyHotCold,
    hotColdPlanningPolygon,
} from "./questions/hot-cold";
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
    adjustPerRadar,
    hiderifyRadar,
    radarPlanningPolygon,
} from "./questions/radar";
import type { Question, Questions } from "./schema";

export * from "./geo-utils";

export const hiderifyQuestion = async (question: Question) => {
    if (!question.data.locked) {
        switch (question.id) {
            case "radar":
                question.data = hiderifyRadar(question.data);
                break;
            case "hot/cold":
                question.data = hiderifyHotCold(question.data);
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

export const determinePlanningPolygon = async (question: Question) => {
    if (!question.data.locked) {
        switch (question.id) {
            case "radar":
                return radarPlanningPolygon(question.data);
            case "hot/cold":
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

async function adjustMapGeoDataForQuestion(question: any, mapGeoData: any) {
    try {
        switch (question?.id) {
            case "radar":
                return await adjustPerRadar(question.data, mapGeoData);
            case "hot/cold":
                return adjustPerHotCold(question.data, mapGeoData);
            case "closest":
                if (question.data.location === false) {
                    return adjustPerRadar(
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
    planningModeCallback?: (
        polygon: FeatureCollection | Feature,
        question: any,
    ) => void,
): Promise<any> {
    if (planningModeCallback) {
        const planningPolygons = await Promise.all(
            questions.map((question) => determinePlanningPolygon(question)),
        );

        for (let i = 0; i < questions.length; i++) {
            const planningPolygon = planningPolygons[i];
            if (planningPolygon) {
                planningModeCallback(planningPolygon, questions[i]);
            }
        }
    }

    for (const question of questions) {
        if (!question.data.locked) {
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
