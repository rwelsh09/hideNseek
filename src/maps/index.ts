import type { Feature, FeatureCollection } from "geojson";

import {
    adjustPerClosest,
    closestPlanningPolygon,
    createClosestDraft,
    hiderifyClosest,
    isClosestLocked,
} from "./questions/closest";
import {
    adjustPerHotCold,
    createHotColdDraft,
    hiderifyHotCold,
    hotColdPlanningPolygon,
    isHotColdLocked,
} from "./questions/hot-cold";
import {
    adjustPerMatch,
    createMatchDraft,
    hiderifyMatch,
    isMatchLocked,
    matchPlanningPolygon,
} from "./questions/match";
import {
    adjustPerMeasure,
    createMeasureDraft,
    hiderifyMeasure,
    isMeasureLocked,
    measurePlanningPolygon,
} from "./questions/measure";
import {
    adjustPerRadar,
    createRadarDraft,
    hiderifyRadar,
    isRadarLocked,
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
        isLocked?: (data: any, detail?: string) => boolean;
        createDraft?: (
            center: any,
            detail: string | undefined,
            isLocked: boolean,
        ) => any;
    }
> = {
    radar: {
        hiderify: hiderifyRadar,
        planningPolygon: radarPlanningPolygon,
        adjust: adjustPerRadar,
        isLocked: isRadarLocked,
        createDraft: createRadarDraft,
    },
    "hot/cold": {
        hiderify: hiderifyHotCold,
        planningPolygon: hotColdPlanningPolygon,
        adjust: adjustPerHotCold,
        isLocked: isHotColdLocked,
        createDraft: createHotColdDraft,
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
        isLocked: isClosestLocked,
        createDraft: createClosestDraft,
    },
    match: {
        hiderify: hiderifyMatch,
        planningPolygon: matchPlanningPolygon,
        adjust: adjustPerMatch,
        isLocked: isMatchLocked,
        createDraft: createMatchDraft,
    },
    measure: {
        hiderify: hiderifyMeasure,
        planningPolygon: measurePlanningPolygon,
        adjust: adjustPerMeasure,
        isLocked: isMeasureLocked,
        createDraft: createMeasureDraft,
    },
    photo: {
        hiderify: (data: any) => data,
        planningPolygon: () => false,
        adjust: (data: any, mapGeoData: any) => mapGeoData,
        isLocked: (data: any, detail?: string) =>
            data.type === (detail || "camera"),
        createDraft: (
            center: any,
            detail: string | undefined,
            isLocked: boolean,
        ) => ({
            lat: center.lat,
            lng: center.lng,
            locked: false,
            doubledPenalty: isLocked,
            notes: "",
            type: detail || "camera",
            colour: "blue",
        }),
    },
};

export const isQuestionLockedRegistry = (
    questions: any[],
    type: string,
    detail?: string,
) => {
    return questions.some((q) => {
        if (!q.data.locked) return false;
        if (q.id === type) {
            const handler = QUESTION_HANDLERS[q.id as Question["id"]];
            if (handler && handler.isLocked) {
                return handler.isLocked(q.data, detail);
            }
        }
        return false;
    });
};

export const createDraftQuestionRegistry = (
    type: string,
    center: any,
    detail: string | undefined,
    isLocked: boolean,
) => {
    const handler = QUESTION_HANDLERS[type as Question["id"]];
    if (handler && handler.createDraft) {
        return {
            id: type,
            data: handler.createDraft(center, detail, isLocked),
        };
    }
    return null;
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
