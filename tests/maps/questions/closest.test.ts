import * as turf from "@turf/turf";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { hiderMode } from "@/lib/context";
import { findClosestLocations } from "@/maps/api";
import { geoSpatialVoronoi, arcBuffer, safeUnion } from "@/maps/geo-utils";
import {
    adjustPerClosest,
    closestPlanningPolygon,
    fetchClosestLocationsWithGrowth,
    filterPointsWithinRadius,
    hiderifyClosest,
} from "@/maps/questions/closest";

vi.mock("@/maps/api", () => ({
    findClosestLocations: vi.fn(),
}));

vi.mock("@/maps/geo-utils", () => ({
    arcBuffer: vi.fn(),
    geoSpatialVoronoi: vi.fn(),
    getFeatureCoords: vi.fn((feature) => {
        if (feature?.geometry?.coordinates) {
            return feature.geometry.coordinates;
        }
        return null;
    }),
    safeUnion: vi.fn(),
}));

// Mock nanostores
vi.mock("@/lib/context", async (importOriginal) => {
    const actual = await importOriginal();
    return actual;
});

describe("closest", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hiderMode.set(false as any);
    });

    const mockQuestion = {
        type: "mcdonalds",
        lng: -114.0,
        lat: 51.0,
        radius: 1,
        unit: "kilometers" as const,
        location: false as any,
    };

    describe("fetchClosestLocationsWithGrowth", () => {
        it("calls findClosestLocations directly if coordinates or radius are missing", async () => {
            const noCoords = { ...mockQuestion, lng: null, lat: null };
            vi.mocked(findClosestLocations).mockResolvedValueOnce({ type: "FeatureCollection", features: [] });
            await fetchClosestLocationsWithGrowth(noCoords);
            expect(findClosestLocations).toHaveBeenCalledTimes(1);
            expect(findClosestLocations).toHaveBeenCalledWith(noCoords, "Determining closest locations...");
        });

        it("clamps searchRadius to maxAllowedRadius initially if too large", async () => {
            const largeRadius = { ...mockQuestion, radius: 100, unit: "kilometers" as const };
            vi.mocked(findClosestLocations).mockResolvedValueOnce({ type: "FeatureCollection", features: [] });
            await fetchClosestLocationsWithGrowth(largeRadius);

            // Should clamp to 50 for km
            expect(findClosestLocations).toHaveBeenCalledWith(expect.objectContaining({ radius: 50 }), expect.any(String));
        });

        it("clamps searchRadius to maxAllowedRadius initially if too large (miles)", async () => {
            const largeRadius = { ...mockQuestion, radius: 50, unit: "miles" as const };
            vi.mocked(findClosestLocations).mockResolvedValueOnce({ type: "FeatureCollection", features: [] });
            await fetchClosestLocationsWithGrowth(largeRadius);

            // Should clamp to 30 for miles
            expect(findClosestLocations).toHaveBeenCalledWith(expect.objectContaining({ radius: 30 }), expect.any(String));
        });

        it("returns early if exactly or more than 5 features are found on first try", async () => {
            const points = turf.featureCollection(new Array(5).fill(turf.point([0, 0])));
            vi.mocked(findClosestLocations).mockResolvedValueOnce(points as any);
            const result = await fetchClosestLocationsWithGrowth(mockQuestion);

            expect(findClosestLocations).toHaveBeenCalledTimes(1);
            expect(result?.features.length).toBe(5);
        });

        it("iteratively grows radius until 5 features are found", async () => {
            vi.mocked(findClosestLocations)
                .mockResolvedValueOnce({ type: "FeatureCollection", features: new Array(1).fill(turf.point([0,0])) }) // radius = 1
                .mockResolvedValueOnce({ type: "FeatureCollection", features: new Array(3).fill(turf.point([0,0])) }) // radius = 2
                .mockResolvedValueOnce({ type: "FeatureCollection", features: new Array(5).fill(turf.point([0,0])) }); // radius = 4

            const result = await fetchClosestLocationsWithGrowth(mockQuestion);

            expect(findClosestLocations).toHaveBeenCalledTimes(3);
            expect(findClosestLocations).toHaveBeenNthCalledWith(1, expect.objectContaining({ radius: 1 }), expect.any(String));
            expect(findClosestLocations).toHaveBeenNthCalledWith(2, expect.objectContaining({ radius: 2 }), expect.any(String));
            expect(findClosestLocations).toHaveBeenNthCalledWith(3, expect.objectContaining({ radius: 4 }), expect.any(String));
            expect(result?.features.length).toBe(5);
        });

        it("stops growing if max radius is hit", async () => {
            // Mock to always return 1 feature, causing it to loop until max radius
            vi.mocked(findClosestLocations).mockResolvedValue({ type: "FeatureCollection", features: new Array(1).fill(turf.point([0,0])) });

            await fetchClosestLocationsWithGrowth({ ...mockQuestion, radius: 25, unit: "kilometers" });

            // Calls:
            // 1. radius: 25
            // 2. radius: 50 (max)
            expect(findClosestLocations).toHaveBeenCalledTimes(2);
            expect(findClosestLocations).toHaveBeenLastCalledWith(expect.objectContaining({ radius: 50 }), expect.any(String));
        });
    });

    describe("filterPointsWithinRadius", () => {
        it("returns raw points if question is missing location/radius", () => {
            const points = { features: [] };
            const result = filterPointsWithinRadius(points, { ...mockQuestion, lng: null });
            expect(result).toBe(points);
        });

        it("sorts points by distance and slices to top 5", () => {
            const center = turf.point([-114.0, 51.0]);

            // Create points at various distances
            const features = [
                turf.point([-114.005, 51.0], { id: 1 }), // ~0.35km
                turf.point([-114.1, 51.0], { id: 2 }), // ~7km
                turf.point([-114.001, 51.0], { id: 3 }), // ~0.07km
                turf.point([-114.2, 51.0], { id: 4 }), // ~14km
                turf.point([-114.002, 51.0], { id: 5 }), // ~0.14km
                turf.point([-114.003, 51.0], { id: 6 }), // ~0.21km
            ];
            const points = turf.featureCollection(features);

            const q = { ...mockQuestion, radius: 20 };
            const result = filterPointsWithinRadius(points, q) as any;

            expect(result.features.length).toBe(5);
            // Closest first
            expect(result.features[0].properties.id).toBe(3);
            expect(result.features[1].properties.id).toBe(5);
            expect(result.features[2].properties.id).toBe(6);
            expect(result.features[3].properties.id).toBe(1);
            expect(result.features[4].properties.id).toBe(2);

            // Question radius should be updated to the distance of the 5th closest point
            const dist5th = turf.distance(center, result.features[4], { units: "kilometers" });
            expect(q.radius).toBe(dist5th);
        });

        it("handles points with invalid coordinates (distance = Infinity)", () => {
            const features = [
                turf.point([-114.001, 51.0], { id: 1 }), // Valid
                { type: "Feature", properties: { id: 2 }, geometry: { type: "Point", coordinates: null } } as any, // Invalid
            ];
            const points = turf.featureCollection(features);

            const q = { ...mockQuestion };
            const result = filterPointsWithinRadius(points, q) as any;

            // Because distance is Infinity, the targetRadius becomes Infinity, but it is capped at maxAllowedRadius (50 for km).
            // Then the filter `p.dist <= question.radius` evaluates `Infinity <= 50` which is false.
            // So the invalid point is correctly filtered out.
            expect(result.features.length).toBe(1);
            expect(result.features[0].properties.id).toBe(1);
        });

        it("clamps target radius to maxAllowedRadius if furthest top 5 is too far", () => {
            const features = [
                turf.point([-114.001, 51.0]),
                turf.point([-114.002, 51.0]),
                turf.point([-114.003, 51.0]),
                turf.point([-114.004, 51.0]),
                turf.point([-115.0, 51.0]), // ~70km away
            ];
            const points = turf.featureCollection(features);

            const q = { ...mockQuestion, unit: "kilometers" as const };
            const result = filterPointsWithinRadius(points, q) as any;

            // Max allowed for km is 50
            expect(q.radius).toBe(50);

            // The point at 70km should be filtered out
            expect(result.features.length).toBe(4);
        });

        it("clamps target radius to maxAllowedRadius if fewer than 5 points are found", () => {
            const features = [
                turf.point([-114.001, 51.0]), // Very close
            ];
            const points = turf.featureCollection(features);

            const q = { ...mockQuestion, unit: "miles" as const };
            const result = filterPointsWithinRadius(points, q) as any;

            // Max allowed for miles is 30
            expect(q.radius).toBe(30);

            // The 1 point should still be there
            expect(result.features.length).toBe(1);
        });
    });

    describe("adjustPerClosest", () => {
        it("returns undefined if mapData is null", async () => {
            const result = await adjustPerClosest(mockQuestion, null);
            expect(result).toBeUndefined();
        });

        it("throws if question.location is false", async () => {
            await expect(adjustPerClosest(mockQuestion, {})).rejects.toThrow("Must have a location");
        });

        it("returns original mapData if correct polygon is not found", async () => {
            const q = { ...mockQuestion, location: { properties: { name: "Missing" } } };
            vi.mocked(findClosestLocations).mockResolvedValueOnce({ type: "FeatureCollection", features: [] });
            vi.mocked(geoSpatialVoronoi).mockReturnValueOnce({ type: "FeatureCollection", features: [] } as any);

            const mapData = { type: "Polygon" };
            const result = await adjustPerClosest(q, mapData);

            expect(result).toBe(mapData);
        });

        it("returns intersected polygon if correct polygon is found", async () => {
            const q = { ...mockQuestion, location: { properties: { name: "Target" } } };

            // Create a fake voronoi feature that matches the target name
            const correctPolygon = turf.polygon([[[0,0], [0,1], [1,1], [1,0], [0,0]]], {
                site: { properties: { name: "Target" } }
            });

            vi.mocked(findClosestLocations).mockResolvedValueOnce({
                type: "FeatureCollection",
                features: [turf.point([0.5, 0.5])]
            });
            vi.mocked(geoSpatialVoronoi).mockReturnValueOnce({
                type: "FeatureCollection",
                features: [correctPolygon]
            } as any);
            vi.mocked(arcBuffer).mockResolvedValueOnce(turf.polygon([[[0,0], [0,2], [2,2], [2,0], [0,0]]]));
            vi.mocked(safeUnion).mockReturnValueOnce(turf.polygon([[[-1,-1], [-1,3], [3,3], [3,-1], [-1,-1]]]));

            const mapData = { type: "Polygon" };
            const result = await adjustPerClosest(q, mapData);

            expect(result).toBeDefined();
            expect(arcBuffer).toHaveBeenCalled();
            expect(safeUnion).toHaveBeenCalledWith(mapData);
        });
    });

    describe("hiderifyClosest", () => {
        it("returns unchanged question if not in hider mode", async () => {
            const result = await hiderifyClosest(mockQuestion);
            expect(result).toBe(mockQuestion);
        });

        it("sets location to false if hider is further than radius", async () => {
            hiderMode.set({ latitude: 52.0, longitude: -115.0 } as any); // Far away
            vi.mocked(findClosestLocations).mockResolvedValueOnce({ type: "FeatureCollection", features: [] });
            vi.mocked(geoSpatialVoronoi).mockReturnValueOnce({ type: "FeatureCollection", features: [] } as any);

            const result = await hiderifyClosest({ ...mockQuestion, radius: 1 });
            expect(result.location).toBe(false);
        });

        it("returns unchanged question if voronoi polygon not found", async () => {
            hiderMode.set({ latitude: 51.0, longitude: -114.0 } as any); // Same place
            vi.mocked(findClosestLocations).mockResolvedValueOnce({ type: "FeatureCollection", features: [] });
            vi.mocked(geoSpatialVoronoi).mockReturnValueOnce({ type: "FeatureCollection", features: [] } as any);

            const q = { ...mockQuestion, location: "test" as any };
            const result = await hiderifyClosest(q);
            expect(result.location).toBe("test");
        });

        it("sets location to correct point if hider is inside voronoi polygon", async () => {
            // Hider is at 51.0, -114.0
            hiderMode.set({ latitude: 51.0, longitude: -114.0 } as any);

            const point1 = turf.point([-114.0, 51.0], { name: "Target" }); // Same place
            const point2 = turf.point([-114.1, 51.1], { name: "Other" }); // Different place

            // FilterPointsWithinRadius is called, which sorts by distance.
            // point1 is at center, so it is index 0. point2 is index 1.
            vi.mocked(findClosestLocations).mockResolvedValueOnce({
                type: "FeatureCollection",
                features: [point2, point1] // reversed to verify sorting
            });

            // Polygon 1 contains the hider
            const poly1 = turf.polygon([[[ -114.05, 50.95 ], [ -114.05, 51.05 ], [ -113.95, 51.05 ], [ -113.95, 50.95 ], [ -114.05, 50.95 ]]], { site: point1 });
            const poly2 = turf.polygon([[[ -114.15, 51.05 ], [ -114.15, 51.15 ], [ -114.05, 51.15 ], [ -114.05, 51.05 ], [ -114.15, 51.05 ]]], { site: point2 });

            // filterPointsWithinRadius will sort [point2, point1] -> [point1, point2]
            // geoSpatialVoronoi is called with the sorted features.
            // When hiderifyClosest iterates through voronoi.features, the index corresponds to the sorted features.
            vi.mocked(geoSpatialVoronoi).mockReturnValueOnce({
                type: "FeatureCollection",
                features: [poly1, poly2] // poly1 corresponds to sorted features[0] (point1)
            } as any);

            const q = { ...mockQuestion, radius: 100 }; // Make sure radius is large enough
            const result = await hiderifyClosest(q);

            expect(result.location).toBeDefined();
            expect(result.location.properties.name).toBe("Target");
        });
    });

    describe("closestPlanningPolygon", () => {
        it("intersects voronoi features with circle and returns combined polygon lines", async () => {
            const point1 = turf.point([-114.0, 51.0]);
            const poly1 = turf.polygon([[[ -114.05, 50.95 ], [ -114.05, 51.05 ], [ -113.95, 51.05 ], [ -113.95, 50.95 ], [ -114.05, 50.95 ]]]);

            vi.mocked(findClosestLocations).mockResolvedValueOnce({
                type: "FeatureCollection",
                features: [point1]
            });
            vi.mocked(geoSpatialVoronoi).mockReturnValueOnce({
                type: "FeatureCollection",
                features: [poly1]
            } as any);
            vi.mocked(arcBuffer).mockResolvedValueOnce(turf.polygon([[[ -114.1, 50.9 ], [ -114.1, 51.1 ], [ -113.9, 51.1 ], [ -113.9, 50.9 ], [ -114.1, 50.9 ]]]));

            const result = await closestPlanningPolygon(mockQuestion);

            expect(result).toBeDefined();
            expect(result.type).toBe("FeatureCollection");
            expect(arcBuffer).toHaveBeenCalled();
            expect(geoSpatialVoronoi).toHaveBeenCalled();
        });

        it("handles empty voronoi features", async () => {
            vi.mocked(findClosestLocations).mockResolvedValueOnce({
                type: "FeatureCollection",
                features: []
            });
            vi.mocked(geoSpatialVoronoi).mockReturnValueOnce({
                type: "FeatureCollection",
                features: []
            } as any);
            vi.mocked(arcBuffer).mockResolvedValueOnce(turf.polygon([[[ -114.1, 50.9 ], [ -114.1, 51.1 ], [ -113.9, 51.1 ], [ -113.9, 50.9 ], [ -114.1, 50.9 ]]]));

            const result = await closestPlanningPolygon(mockQuestion);

            expect(result.features).toHaveLength(0);
        });
    });
});
