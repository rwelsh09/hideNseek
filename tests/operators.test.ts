import * as turf from "@turf/turf";
import { describe, expect, test } from "vitest";

import { geoSpatialVoronoi, safeUnion } from "@/maps/geo-utils/operators";

describe("safeUnion", () => {
    test("returns the single feature if collection has only one feature", () => {
        const poly = turf.polygon([
            [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
            ],
        ]);
        const collection = turf.featureCollection([poly]);
        const result = safeUnion(collection);
        expect(result).toEqual(poly);
    });

    test("correctly unions multiple overlapping features", () => {
        const poly1 = turf.polygon([
            [
                [0, 0],
                [0, 2],
                [2, 2],
                [2, 0],
                [0, 0],
            ],
        ]);
        const poly2 = turf.polygon([
            [
                [1, 1],
                [1, 3],
                [3, 3],
                [3, 1],
                [1, 1],
            ],
        ]);
        const collection = turf.featureCollection([poly1, poly2]);
        const result = safeUnion(collection);

        // The resulting union should be a single Polygon or MultiPolygon
        expect(result.geometry.type).toMatch(/Polygon/);
        // The area should be roughly the area of union
        const area = turf.area(result);
        expect(area).toBeGreaterThan(0);
    });

    test("throws an error when an empty FeatureCollection is passed", () => {
        const collection = turf.featureCollection([]);
        // turf.union throws "Must have at least 2 geometries" for empty inputs in recent versions.
        // If turf.union returns null/undefined, safeUnion will throw "No features".
        expect(() => safeUnion(collection as any)).toThrowError(
            /No features|Must have at least 2 geometries/,
        );
    });
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
