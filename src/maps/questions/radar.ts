import * as turf from "@turf/turf";

import { hiderMode } from "@/lib/context";
import { arcBuffer, modifyMapData } from "@/maps/geo-utils";
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

    const distance = turf.distance(
        turf.point([question.lng, question.lat]),
        turf.point([$hiderMode.longitude, $hiderMode.latitude]),
        { units: question.unit },
    );

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
