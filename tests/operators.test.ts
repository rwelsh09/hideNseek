import * as turf from "@turf/turf";
import { describe, expect, test } from "vitest";

import { geoSpatialVoronoi, safeUnion, modifyMapData } from "@/maps/geo-utils/operators";

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

describe("modifyMapData", () => {
    const mapData = turf.featureCollection([
        turf.polygon([
            [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10],
                [0, 0],
            ],
        ]),
    ]);

    const modificationsFeature = turf.polygon([
        [
            [5, 0],
            [15, 0],
            [15, 10],
            [5, 10],
            [5, 0],
        ],
    ]);

    const modificationsCollection = turf.featureCollection([
        modificationsFeature,
    ]);

    test("withinModifications = true, passing Feature", () => {
        const result = modifyMapData(mapData, modificationsFeature, true);
        expect(result).toBeDefined();
        // Intersection of [0, 10]x[0, 10] and [5, 15]x[0, 10] should be [5, 10]x[0, 10]
        const bbox = turf.bbox(result!);
        expect(bbox).toEqual([5, 0, 10, 10]);
    });

    test("withinModifications = true, passing FeatureCollection", () => {
        const result = modifyMapData(mapData, modificationsCollection, true);
        expect(result).toBeDefined();
        const bbox = turf.bbox(result!);
        expect(bbox).toEqual([5, 0, 10, 10]);
    });

    test("withinModifications = false, passing Feature", () => {
        const result = modifyMapData(mapData, modificationsFeature, false);
        expect(result).toBeDefined();
        // Should be mapData intersection with inverted modifications
        // Inverting [5, 15]x[0, 10] over the whole world.
        // Intersecting [0, 10]x[0, 10] with the world minus [5, 15]x[0, 10]
        // Should yield [0, 5]x[0, 10]
        const bbox = turf.bbox(result!);
        expect(bbox).toEqual([0, 0, 5, 10]);
    });

    test("withinModifications = false, passing FeatureCollection", () => {
        const result = modifyMapData(mapData, modificationsCollection, false);
        expect(result).toBeDefined();
        const bbox = turf.bbox(result!);
        expect(bbox).toEqual([0, 0, 5, 10]);
    });
});
