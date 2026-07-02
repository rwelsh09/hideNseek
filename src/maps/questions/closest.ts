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

    const pointsWithDist = points.features.map((feature: any) => {
        const coords =
            feature?.geometry?.coordinates ??
            (feature?.properties?.lon && feature?.properties?.lat
                ? [feature.properties.lon, feature.properties.lat]
                : null);

        if (!coords) return { feature, dist: Infinity };

        const pt = turf.point(coords);
        const dist = turf.distance(center, pt, { units: question.unit });
        return { feature, dist };
    });

    pointsWithDist.sort((a: any, b: any) => a.dist - b.dist);

    // Take the closest 5 or all if there's less than 5
    let closest5 = pointsWithDist.slice(0, 5);

    // If we have at least one point, evaluate target radius
    if (closest5.length > 0) {
        const maxDistInTop5 = closest5[closest5.length - 1].dist;
        const maxAllowedRadius = question.unit === "kilometers" ? 50 : 30; // Safety guard: max 50km or 30miles

        let targetRadius = maxDistInTop5;
        if (targetRadius > maxAllowedRadius) {
            targetRadius = maxAllowedRadius;
        }

        // If there are exactly 5 or more points found in the entire city,
        // we can set the radius exactly to the 5th point's distance (shrinking or growing).
        // If there are FEWER than 5 points in the entire city, that means even if we grew the radius, we couldn't find 5.
        // In that case, we shrink to the farthest found point.
        // Wait, `maxDistInTop5` is the distance of the furthest point in the top 5 we found.
        // Because `findClosestLocations` now returns the top 5 points across the ENTIRE city regardless of the initial radius,
        // `maxDistInTop5` IS the distance needed to encompass the 5 closest points (or all points if < 5 exist).
        // Therefore, setting the radius to `targetRadius` correctly grows AND shrinks it.

        if (question.radius !== targetRadius) {
            question.radius = targetRadius;
        }

        closest5 = closest5.filter((p: any) => p.dist <= question.radius);
    }

    return turf.featureCollection(closest5.map((p: any) => p.feature));
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
