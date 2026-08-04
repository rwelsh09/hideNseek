import * as turf from "@turf/turf";

import { hiderMode } from "@/lib/context";
import { fastDistance, safeUnion } from "@/maps/geo-utils";
import { geoSpatialVoronoi } from "@/maps/geo-utils/voronoi";
import type { HotColdQuestion } from "@/maps/schema";

export const adjustPerHotCold = (question: HotColdQuestion, mapData: any) => {
    if (mapData === null) return;

    const pointA = turf.point([question.lngA, question.latA]);
    const pointB = turf.point([question.lngB, question.latB]);

    const voronoi = geoSpatialVoronoi(turf.featureCollection([pointA, pointB]));

    if (question.warmer) {
        return turf.intersect(
            turf.featureCollection([safeUnion(mapData), voronoi.features[1]]),
        );
    } else {
        return turf.intersect(
            turf.featureCollection([safeUnion(mapData), voronoi.features[0]]),
        );
    }
};

export const hiderifyHotCold = (question: HotColdQuestion) => {
    const $hiderMode = hiderMode.get();
    if ($hiderMode === false) {
        return question;
    }

    const pointA = turf.point([question.lngA, question.latA]);
    const pointB = turf.point([question.lngB, question.latB]);

    const voronoi = geoSpatialVoronoi(turf.featureCollection([pointA, pointB]));

    const hiderPoint = turf.point([$hiderMode.longitude, $hiderMode.latitude]);
    const hiderRegion = turf.booleanPointInPolygon(
        hiderPoint,
        voronoi.features[1],
    )
        ? 1
        : 0;

    if (hiderRegion === 1) {
        question.warmer = true;
    } else {
        question.warmer = false;
    }

    return question;
};

export const hotColdPlanningPolygon = (question: HotColdQuestion) => {
    const pointA = turf.point([question.lngA, question.latA]);
    const pointB = turf.point([question.lngB, question.latB]);

    const voronoi = geoSpatialVoronoi(turf.featureCollection([pointA, pointB]));

    return turf.featureCollection(
        voronoi.features
            .map((x: any) => turf.polygonToLine(x))
            .flatMap((line) =>
                line.type === "FeatureCollection" ? line.features : [line],
            ),
    );
};

export const isHotColdLocked = (question: any, detail?: string) => {
    if (!question.lngA || !question.latA || !question.lngB || !question.latB)
        return false;
    // Optimization: Use fastDistance instead of turf.distance to avoid allocating
    // GeoJSON Point features for every calculation.
    const dist = fastDistance(
        [question.lngA, question.latA],
        [question.lngB, question.latB]
    );
    const detailDist = parseFloat(detail || "5");
    return Math.abs(dist - detailDist) < 0.1;
};

export const createHotColdDraft = (
    center: any,
    detail: string | undefined,
    isLocked: boolean,
) => {
    const destination = turf.destination(
        [center.lng, center.lat],
        parseFloat(detail || "5"),
        90,
        { units: "kilometers" },
    );
    return {
        latA: center.lat,
        lngA: center.lng,
        latB: destination.geometry.coordinates[1],
        lngB: destination.geometry.coordinates[0],
        warmer: true,
        locked: false,
        colourA: "gold",
        colourB: "blue",
        doubledPenalty: isLocked,
        minDistance: parseFloat(detail || "5"),
    };
};
