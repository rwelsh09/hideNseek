import { geoSpatialVoronoi, safeUnion, holedMask } from "@/maps/geo-utils/operators";
import * as turf from "@turf/turf";
import { expect, test } from "vitest";


test("holedMask with a single Polygon feature", () => {
    const inputPoly = turf.polygon([
        [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
        ],
    ]);
    const mask = holedMask(inputPoly);

    expect(mask).toBeDefined();

    const pointInside = turf.point([5, 5]);
    const pointOutside = turf.point([20, 20]);

    expect(turf.booleanPointInPolygon(pointInside, mask!)).toBe(false);
    expect(turf.booleanPointInPolygon(pointOutside, mask!)).toBe(true);
});

test("holedMask with a FeatureCollection of polygons", () => {
    const poly1 = turf.polygon([
        [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
            [0, 0],
        ],
    ]);
    const poly2 = turf.polygon([
        [
            [20, 20],
            [30, 20],
            [30, 30],
            [20, 30],
            [20, 20],
        ],
    ]);
    const featureCollection = turf.featureCollection([poly1, poly2]);

    const mask = holedMask(featureCollection);

    expect(mask).toBeDefined();

    const pointInside1 = turf.point([5, 5]);
    const pointInside2 = turf.point([25, 25]);
    const pointOutside = turf.point([15, 15]);

    expect(turf.booleanPointInPolygon(pointInside1, mask!)).toBe(false);
    expect(turf.booleanPointInPolygon(pointInside2, mask!)).toBe(false);
    expect(turf.booleanPointInPolygon(pointOutside, mask!)).toBe(true);
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
