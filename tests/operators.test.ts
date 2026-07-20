import * as turf from "@turf/turf";
import { describe, expect, test, vi } from "vitest";

vi.mock("@turf/turf", async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        union: vi.fn(actual.union),
        difference: vi.fn(actual.difference),
    };
});

import {
    geoSpatialVoronoi,
    holedMask,
    modifyMapData,
    safeUnion,
} from "@/maps/geo-utils/operators";

test("safeUnion handles single feature", () => {
    const singleFeature = turf.featureCollection([
        turf.polygon([
            [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
            ],
        ]),
    ]);
    const result = safeUnion(singleFeature);
    expect(result).toEqual(singleFeature.features[0]);
});

test("safeUnion handles multiple features", () => {
    const multiFeature = turf.featureCollection([
        turf.polygon([
            [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
            ],
        ]),
        turf.polygon([
            [
                [1, 0],
                [1, 1],
                [2, 1],
                [2, 0],
                [1, 0],
            ],
        ]),
    ]);
    const result = safeUnion(multiFeature);
    expect(result.geometry.type).toBe("Polygon");
    // Union of the two adjacent 1x1 squares should be a 2x1 rectangle, checking bounds area
    expect(turf.area(result)).toBeCloseTo(turf.area(multiFeature), 0);
});

test("safeUnion throws 'No features' when turf.union returns falsy", () => {
    const multiFeature = turf.featureCollection([
        turf.polygon([
            [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
                [0, 0],
            ],
        ]),
        turf.polygon([
            [
                [1, 0],
                [1, 1],
                [2, 1],
                [2, 0],
                [1, 0],
            ],
        ]),
    ]);

    vi.mocked(turf.union).mockReturnValueOnce(null as any);

    expect(() => safeUnion(multiFeature)).toThrowError("No features");

    vi.mocked(turf.union).mockClear();
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

        const expectedDistance = turf.distance(point, basePoints.features[basePointIndex]);
        const actualDistance = turf.distance(point, basePoints.features[voronoiIndex]);
        expect(actualDistance).toBeCloseTo(expectedDistance, 0);
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

describe("holedMask", () => {
    const holeFeature = turf.polygon([
        [
            [10, 10],
            [20, 10],
            [20, 20],
            [10, 20],
            [10, 10],
        ],
    ]);

    test("handles a Feature input representing a hole", () => {
        const result = holedMask(holeFeature);
        expect(result).toBeDefined();
        expect(result?.geometry.type).toBe("Polygon");
        // A point inside the hole should be false in the resulting mask
        expect(turf.booleanPointInPolygon(turf.point([15, 15]), result!)).toBe(false);
        // A point outside the hole but in the world should be true
        expect(turf.booleanPointInPolygon(turf.point([0, 0]), result!)).toBe(true);
    });

    test("handles a FeatureCollection input representing multiple holes", () => {
        const anotherHoleFeature = turf.polygon([
            [
                [30, 30],
                [40, 30],
                [40, 40],
                [30, 40],
                [30, 30],
            ],
        ]);
        const holeCollection = turf.featureCollection([holeFeature, anotherHoleFeature]);

        const result = holedMask(holeCollection);
        expect(result).toBeDefined();
        // A point inside either hole should be false in the resulting mask
        expect(turf.booleanPointInPolygon(turf.point([15, 15]), result!)).toBe(false);
        expect(turf.booleanPointInPolygon(turf.point([35, 35]), result!)).toBe(false);
        // A point outside the holes but in the world should be true
        expect(turf.booleanPointInPolygon(turf.point([0, 0]), result!)).toBe(true);
    });

    test("returns null if turf.difference returns null", () => {
        // Temporarily mock turf.difference to return null
        vi.mocked(turf.difference).mockReturnValueOnce(null as any);

        const result = holedMask(holeFeature);
        expect(result).toBeNull();
    });
});
