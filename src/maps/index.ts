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

export const QUESTION_HANDLERS: Record<
    Question["id"],
    {
        hiderify: (data: any) => any;
        planningPolygon: (data: any) => any;
        adjust: (data: any, mapGeoData: any) => any;
    }
> = {
    radar: {
        hiderify: hiderifyRadar,
        planningPolygon: radarPlanningPolygon,
        adjust: adjustPerRadar,
    },
    "hot/cold": {
        hiderify: hiderifyHotCold,
        planningPolygon: hotColdPlanningPolygon,
        adjust: adjustPerHotCold,
    },
    closest: {
        hiderify: hiderifyClosest,
        planningPolygon: closestPlanningPolygon,
        adjust: async (data, mapGeoData) => {
            if (data.location === false) {
                return adjustPerRadar({ ...data, within: false }, mapGeoData);
            }
            return adjustPerClosest(data, mapGeoData);
        },
    },
    match: {
        hiderify: hiderifyMatch,
        planningPolygon: matchPlanningPolygon,
        adjust: adjustPerMatch,
    },
    measure: {
        hiderify: hiderifyMeasure,
        planningPolygon: measurePlanningPolygon,
        adjust: adjustPerMeasure,
    },
};

export const hiderifyQuestion = async (question: Question) => {
    if (!question.data.locked) {
        const handler = QUESTION_HANDLERS[question.id as Question["id"]];
        if (handler) {
            question.data = await handler.hiderify(question.data);
        }
    }

    return question;
};

const determinePlanningPolygon = async (question: Question) => {
    if (!question.data.locked) {
        const handler = QUESTION_HANDLERS[question.id as Question["id"]];
        if (handler) {
            return handler.planningPolygon(question.data);
        }
    }
};

async function adjustMapGeoDataForQuestion(question: any, mapGeoData: any) {
    try {
        const handler = QUESTION_HANDLERS[question?.id as Question["id"]];
        if (handler) {
            return await handler.adjust(question.data, mapGeoData);
        }
        return mapGeoData;
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
