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
    filterMatchHidingZones,
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

const standardGetDraggablePoints = (data: any) => [
    {
        keySuffix: "",
        lat: data.lat,
        lng: data.lng,
        colour: data.colour,
        update: (d: any, lat: number, lng: number) => {
            d.lat = lat;
            d.lng = lng;
        },
    },
];

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
        getDraggablePoints?: (data: any) => {
            keySuffix: string;
            lat: number;
            lng: number;
            colour: string;
            update: (data: any, lat: number, lng: number) => void;
        }[];
        filterHidingZones?: (data: any, circles: any[], places: any[]) => any[];
    }
> = {
    radar: {
        hiderify: hiderifyRadar,
        planningPolygon: radarPlanningPolygon,
        adjust: adjustPerRadar,
        isLocked: isRadarLocked,
        createDraft: createRadarDraft,
        getDraggablePoints: standardGetDraggablePoints,
    },
    "hot/cold": {
        hiderify: hiderifyHotCold,
        planningPolygon: hotColdPlanningPolygon,
        adjust: adjustPerHotCold,
        isLocked: isHotColdLocked,
        createDraft: createHotColdDraft,
        getDraggablePoints: (data: any) => [
            {
                keySuffix: "a",
                lat: data.latA,
                lng: data.lngA,
                colour: data.colourA,
                update: (d: any, lat: number, lng: number) => {
                    d.latA = lat;
                    d.lngA = lng;
                },
            },
            {
                keySuffix: "b",
                lat: data.latB,
                lng: data.lngB,
                colour: data.colourB,
                update: (d: any, lat: number, lng: number) => {
                    d.latB = lat;
                    d.lngB = lng;
                },
            },
        ],
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
        getDraggablePoints: standardGetDraggablePoints,
    },
    match: {
        hiderify: hiderifyMatch,
        planningPolygon: matchPlanningPolygon,
        adjust: adjustPerMatch,
        isLocked: isMatchLocked,
        createDraft: createMatchDraft,
        getDraggablePoints: standardGetDraggablePoints,
        filterHidingZones: filterMatchHidingZones,
    },
    measure: {
        hiderify: hiderifyMeasure,
        planningPolygon: measurePlanningPolygon,
        adjust: adjustPerMeasure,
        isLocked: isMeasureLocked,
        createDraft: createMeasureDraft,
        getDraggablePoints: standardGetDraggablePoints,
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
        getDraggablePoints: standardGetDraggablePoints,
    },
};

export const getDraggablePointsRegistry = (question: any) => {
    const handler = QUESTION_HANDLERS[question.id as Question["id"]];
    if (handler && handler.getDraggablePoints) {
        return handler.getDraggablePoints(question.data);
    }
    return [];
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
