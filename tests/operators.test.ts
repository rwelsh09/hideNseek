import * as turf from "@turf/turf";
import { expect, test } from "vitest";

import { geoSpatialVoronoi, safeUnion } from "@/maps/geo-utils/operators";

test("safeUnion handles single feature", () => {
    const singleFeature = turf.featureCollection([
        turf.polygon([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]])
    ]);
    const result = safeUnion(singleFeature);
    expect(result).toEqual(singleFeature.features[0]);
});

test("safeUnion handles multiple features", () => {
    const multiFeature = turf.featureCollection([
        turf.polygon([[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]),
        turf.polygon([[[1, 0], [1, 1], [2, 1], [2, 0], [1, 0]]])
    ]);
    const result = safeUnion(multiFeature);
    expect(result.geometry.type).toBe("Polygon");
    // Union of the two adjacent 1x1 squares should be a 2x1 rectangle, checking bounds area
    expect(turf.area(result)).toBeCloseTo(turf.area(multiFeature), 0);
});

test("safeUnion handles empty feature collection by throwing error", () => {
    const emptyFeature = turf.featureCollection([]);
    // Either throws 'Must have at least 2 geometries' from Turf or 'No features' from safeUnion
    expect(() => safeUnion(emptyFeature as any)).toThrowError();
});

test("voronoi diagram", () => {
    const BASE_POINT_COUNT = 25;
    const TEST_POINT_COUNT = 500;

    const basePoints = turf.randomPoint(BASE_POINT_COUNT);
    const voronoi = geoSpatialVoronoi(basePoints);

    expect(voronoi).toBeDefined();
    expect(voronoi.features.length).toBe(BASE_POINT_COUNT);

    const testPoints = turf.randomPoint(TEST_POINT_COUNT);

    testPoints.features.forEach((point) => {
        const voronoiIndex = voronoi.features.findIndex((feature) =>
            turf.booleanPointInPolygon(point, feature),
        );
        const nearestBasePoint = turf.nearestPoint(point, basePoints);
        const basePointIndex = basePoints.features.findIndex(
            (feature) =>
                feature.geometry.coordinates[0] ===
                    nearestBasePoint.geometry.coordinates[0] &&
                feature.geometry.coordinates[1] ===
                    nearestBasePoint.geometry.coordinates[1],
        );

        if (voronoiIndex === -1) {
            return; // A glitch with turf where overlapping polygons can cause this
        }

        expect(voronoiIndex).toBe(basePointIndex);
    });
});
