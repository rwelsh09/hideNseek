import * as turf from "@turf/turf";

import { hiderMode } from "@/lib/context";
import { findClosestLocations } from "@/maps/api";
import { arcBuffer, safeUnion } from "@/maps/geo-utils";
import { geoSpatialVoronoi } from "@/maps/geo-utils";
import type { ClosestQuestion } from "@/maps/schema";

const filterPointsWithinRadius = (points: any, question: ClosestQuestion) => {
    if (
        question.lng === null ||
        question.lat === null ||
        question.radius === undefined ||
        question.radius === null
    ) {
        return points;
    }
    const center = turf.point([question.lng, question.lat]);

    let pointsWithDist = points.features
        .map((feature: any) => {
            const coords =
                feature?.geometry?.coordinates ??
                (feature?.properties?.lon && feature?.properties?.lat
                    ? [feature.properties.lon, feature.properties.lat]
                    : null);

            if (!coords) return { feature, dist: Infinity };

            const pt = turf.point(coords);
            const dist = turf.distance(center, pt, { units: question.unit });
            return { feature, dist };
        })
        .filter((p: any) => p.dist <= question.radius);

    pointsWithDist.sort((a: any, b: any) => a.dist - b.dist);

    if (pointsWithDist.length > 5) {
        pointsWithDist = pointsWithDist.slice(0, 5);
        question.radius = pointsWithDist[4].dist;
    }

    return turf.featureCollection(pointsWithDist.map((p: any) => p.feature));
};

export const adjustPerClosest = async (
    question: ClosestQuestion,
    mapData: any,
) => {
    if (mapData === null) return;
    if (question.location === false) {
        throw new Error("Must have a location");
    }

    const rawPoints = await findClosestLocations(question);

    const points = filterPointsWithinRadius(rawPoints, question);

    const voronoi = geoSpatialVoronoi(points);

    const correctPolygon = voronoi.features.find((feature: any) => {
        if (!question.location) return false;
        return (
            feature.properties.site.properties.name ===
            question.location.properties.name
        );
    });
    if (!correctPolygon) {
        return mapData;
    }

    const circle = await arcBuffer(
        turf.featureCollection([turf.point([question.lng, question.lat])]),
        question.radius,
        question.unit,
    );

    return turf.intersect(
        turf.featureCollection([safeUnion(mapData), correctPolygon, circle]),
    );
};

export const hiderifyClosest = async (question: ClosestQuestion) => {
    const $hiderMode = hiderMode.get();
    if ($hiderMode === false) {
        return question;
    }

    const rawPoints = await findClosestLocations(question);

    const points = filterPointsWithinRadius(rawPoints, question);

    const voronoi = geoSpatialVoronoi(points);

    const hider = turf.point([$hiderMode.longitude, $hiderMode.latitude]);
    const location = turf.point([question.lng, question.lat]);

    if (
        turf.distance(hider, location, { units: question.unit }) >
        question.radius
    ) {
        question.location = false;
        return question;
    }

    let correctLocation: any = null;

    const correctPolygon = voronoi.features.find(
        (feature: any, index: number) => {
            const pointIn =
                turf.booleanPointInPolygon(hider, feature.geometry) || false;

            if (pointIn) {
                correctLocation = points.features[index];
            }
            return pointIn;
        },
    );

    if (!correctPolygon) {
        return question;
    }

    question.location = correctLocation!;
    return question;
};

export const closestPlanningPolygon = async (question: ClosestQuestion) => {
    const rawPoints = await findClosestLocations(question);

    const points = filterPointsWithinRadius(rawPoints, question);

    const voronoi = geoSpatialVoronoi(points);
    const circle = await arcBuffer(
        turf.featureCollection([turf.point([question.lng, question.lat])]),
        question.radius,
        question.unit,
    );

    const interiorVoronoi = voronoi.features
        .map((feature) =>
            turf.intersect(turf.featureCollection([feature, circle])),
        )
        .filter((feature) => feature !== null);

    return turf.combine(
        turf.featureCollection(
            interiorVoronoi
                .map((x: any) => turf.polygonToLine(x))
                .flatMap((line) =>
                    line.type === "FeatureCollection" ? line.features : [line],
                ),
        ),
    );
};
