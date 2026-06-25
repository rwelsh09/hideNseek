import * as turf from "@turf/turf";
import type { Point } from "geojson";
import { describe, expect, test } from "vitest";

import { geoSpatialVoronoi } from "@/maps/geo-utils/voronoi";

describe("geoSpatialVoronoi edge cases", () => {
    test("0 points should return 0 polygons", () => {
        const points = turf.featureCollection<Point>([]);
        const voronoi = geoSpatialVoronoi(points);
        expect(voronoi.features).toHaveLength(0);
    });

    test("1 point should return 1 polygon", () => {
        const points = turf.featureCollection([turf.point([0, 0])]);
        const voronoi = geoSpatialVoronoi(points);
        expect(voronoi.features).toHaveLength(1);

        // A single point covers the entire earth, which is a polygon
        expect(voronoi.features[0]?.geometry.type).toMatch(
            /Polygon|MultiPolygon/,
        );
    });

    test("2 points should return 2 polygons", () => {
        const points = turf.featureCollection([
            turf.point([0, 0]),
            turf.point([1, 1]),
        ]);
        const voronoi = geoSpatialVoronoi(points);
        expect(voronoi.features).toHaveLength(2);
    });

    test("3 collinear points should return 3 polygons", () => {
        const points = turf.featureCollection([
            turf.point([0, 0]),
            turf.point([0, 1]),
            turf.point([0, 2]),
        ]);
        const voronoi = geoSpatialVoronoi(points);
        expect(voronoi.features).toHaveLength(3);
    });

    test("duplicate points should handle duplicates correctly", () => {
        const points = turf.featureCollection([
            turf.point([0, 0]),
            turf.point([0, 0]),
        ]);
        const voronoi = geoSpatialVoronoi(points);

        // d3-geo-voronoi with identical points may result in multiple features (1 per point)
        // but their coordinates will have nulls because they share the same site and cannot have a boundary.
        // We just ensure it doesn't crash and returns the same number of features as input.
        expect(voronoi.features).toHaveLength(2);
    });

    test("points near dateline should yield MultiPolygons and trigger massive polygon logic", () => {
        const points = turf.featureCollection([
            turf.point([179, 0]),
            turf.point([-179, 0]),
            turf.point([0, 89]),
            turf.point([0, -89]),
        ]);
        const voronoi = geoSpatialVoronoi(points);
        expect(voronoi.features.length).toBeGreaterThan(0);

        const hasMultiPolygon = voronoi.features.some(
            (f) => f.geometry.type === "MultiPolygon"
        );
        expect(hasMultiPolygon).toBe(true);
    });
});
