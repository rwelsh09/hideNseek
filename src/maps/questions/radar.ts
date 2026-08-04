import * as turf from "@turf/turf";

import { hiderMode } from "@/lib/context";
import { arcBuffer, fastDistance, modifyMapData } from "@/maps/geo-utils";
import type { RadarQuestion } from "@/maps/schema";

export const adjustPerRadar = async (question: RadarQuestion, mapData: any) => {
    if (mapData === null) return;

    const point = turf.point([question.lng, question.lat]);
    const circle = await arcBuffer(
        turf.featureCollection([point]),
        question.radius,
        question.unit,
    );

    return modifyMapData(mapData, circle, question.within);
};

export const hiderifyRadar = (question: RadarQuestion) => {
    const $hiderMode = hiderMode.get();
    if ($hiderMode === false) {
        return question;
    }

    // Optimization: Use fastDistance instead of turf.distance to avoid allocating
    // GeoJSON Point features for every calculation.
    let distance = fastDistance(
        [question.lng, question.lat],
        [$hiderMode.longitude, $hiderMode.latitude]
    );
    if (question.unit === "meters") {
        distance *= 1000;
    }

    if (distance <= question.radius) {
        question.within = true;
    } else {
        question.within = false;
    }

    return question;
};

export const radarPlanningPolygon = async (question: RadarQuestion) => {
    const point = turf.point([question.lng, question.lat]);
    const circle = await arcBuffer(
        turf.featureCollection([point]),
        question.radius,
        question.unit,
    );

    return turf.polygonToLine(circle);
};

export const isRadarLocked = (question: any, detail?: string) => {
    const isCustom = detail === "unknown";
    if (isCustom) return question.isCustom === true;
    const radius = parseFloat(detail || "5");
    return question.radius === radius && !question.isCustom;
};

export const createRadarDraft = (
    center: any,
    detail: string | undefined,
    isLocked: boolean,
) => {
    return {
        lat: center.lat,
        lng: center.lng,
        locked: false,
        doubledPenalty: isLocked,
        radius: detail === "unknown" ? 5 : parseFloat(detail || "5"),
        isCustom: detail === "unknown",
        unit: "kilometers",
        within: true,
        colour: "orange",
    };
};
