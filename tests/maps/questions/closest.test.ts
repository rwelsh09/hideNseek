import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as turf from '@turf/turf';
import {
    fetchClosestLocationsWithGrowth,
    filterPointsWithinRadius,
    adjustPerClosest,
    hiderifyClosest,
    closestPlanningPolygon
} from '../../../src/maps/questions/closest';
import { findClosestLocations } from '../../../src/maps/api';
import { hiderMode } from '../../../src/lib/context';
import { geoSpatialVoronoi, arcBuffer, safeUnion } from '../../../src/maps/geo-utils';

vi.mock('../../../src/maps/api', () => ({
    findClosestLocations: vi.fn(),
}));

vi.mock('../../../src/maps/geo-utils', () => ({
    arcBuffer: vi.fn(),
    geoSpatialVoronoi: vi.fn(),
    getFeatureCoords: vi.fn((feature) => feature.geometry?.coordinates),
    safeUnion: vi.fn((data) => data),
}));

vi.mock('../../../src/lib/context', () => ({
    hiderMode: {
        get: vi.fn(),
    },
}));

describe('closest question logic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchClosestLocationsWithGrowth', () => {
        it('returns raw points directly if question lacks lng, lat, or radius', async () => {
            const mockPoints = { type: 'FeatureCollection', features: [] };
            vi.mocked(findClosestLocations).mockResolvedValue(mockPoints as any);

            const result = await fetchClosestLocationsWithGrowth({ lng: null, lat: null, radius: null } as any);
            expect(result).toBe(mockPoints);
            expect(findClosestLocations).toHaveBeenCalledTimes(1);
        });

        it('stops growing when 5 or more locations are found', async () => {
            const initialQuestion = { lng: -114, lat: 51, radius: 1, unit: 'kilometers', locationType: 'park' } as any;

            // First call: 2 points
            vi.mocked(findClosestLocations).mockResolvedValueOnce({
                type: 'FeatureCollection',
                features: [1, 2].map(() => turf.point([-114, 51]))
            } as any);

            // Second call: 5 points
            const expectedPoints = {
                type: 'FeatureCollection',
                features: [1, 2, 3, 4, 5].map(() => turf.point([-114, 51]))
            };
            vi.mocked(findClosestLocations).mockResolvedValueOnce(expectedPoints as any);

            const result = await fetchClosestLocationsWithGrowth(initialQuestion);
            expect(result).toBe(expectedPoints);
            expect(findClosestLocations).toHaveBeenCalledTimes(2);
            expect(findClosestLocations).toHaveBeenNthCalledWith(1, { ...initialQuestion, radius: 1 }, expect.any(String));
            expect(findClosestLocations).toHaveBeenNthCalledWith(2, { ...initialQuestion, radius: 2 }, expect.any(String));
        });

        it('caps search radius at maxAllowedRadius (50 for km)', async () => {
            const initialQuestion = { lng: -114, lat: 51, radius: 40, unit: 'kilometers', locationType: 'park' } as any;

            const mockPoints = {
                type: 'FeatureCollection',
                features: [1, 2].map(() => turf.point([-114, 51]))
            };
            vi.mocked(findClosestLocations).mockResolvedValue(mockPoints as any);

            const result = await fetchClosestLocationsWithGrowth(initialQuestion);
            expect(result).toBe(mockPoints);

            // Should clamp at 50, not go to 80
            expect(findClosestLocations).toHaveBeenLastCalledWith({ ...initialQuestion, radius: 50 }, expect.any(String));
        });
    });

    describe('filterPointsWithinRadius', () => {
        it('returns points directly if lng, lat, or radius missing', () => {
            const points = { type: 'FeatureCollection', features: [] };
            const result = filterPointsWithinRadius(points, { lng: null, lat: null, radius: null } as any);
            expect(result).toBe(points);
        });

        it('sorts points by distance and filters out beyond top 5 max distance (or target radius)', () => {
            // Create points at various distances
            // Roughly 1 deg lat is ~111km, so 0.01 deg is ~1.1km
            const points = turf.featureCollection([
                turf.point([-114.0, 51.01]), // ~1.1km
                turf.point([-114.0, 51.05]), // ~5.5km
                turf.point([-114.0, 51.02]), // ~2.2km
                turf.point([-114.0, 51.08]), // ~8.8km
                turf.point([-114.0, 51.03]), // ~3.3km
                turf.point([-114.0, 51.04]), // ~4.4km
                turf.point([-114.0, 51.09]), // ~9.9km
            ]);

            const question = { lng: -114.0, lat: 51.0, radius: 10, unit: 'kilometers' } as any;

            const result = filterPointsWithinRadius(points, question);

            // Should take closest 5: 51.01, 51.02, 51.03, 51.04, 51.05
            // Their distances are all <= maxDistInTop5.
            expect(result.features).toHaveLength(5);
            // The 5th closest point is 51.05 (~5.5km), so question.radius should be updated to that distance
            expect(question.radius).toBeCloseTo(5.56, 1);
        });

        it('handles points with no valid coordinates', () => {
            const points = turf.featureCollection([
                turf.point([-114.0, 51.01]),
                { type: 'Feature', geometry: null, properties: {} } as any
            ]);
            const question = { lng: -114.0, lat: 51.0, radius: 10, unit: 'kilometers' } as any;

            const result = filterPointsWithinRadius(points, question);
            // Missing coords get Infinity distance, so valid point is first.
            // Since less than 5 points, it sets radius to maxAllowedRadius
            expect(result.features).toHaveLength(1);
            expect(question.radius).toBe(50); // max for km
        });
    });

    describe('adjustPerClosest', () => {
        it('returns mapData early if it is null', async () => {
            const result = await adjustPerClosest({ location: true } as any, null);
            expect(result).toBeUndefined();
        });

        it('throws if question.location is false', async () => {
            await expect(adjustPerClosest({ location: false } as any, {})).rejects.toThrow("Must have a location");
        });

        it('returns original mapData if correct polygon not found in voronoi', async () => {
            const question = {
                lng: -114, lat: 51, radius: 10, unit: 'kilometers',
                location: { properties: { name: 'TargetPlace' } }
            } as any;

            vi.mocked(findClosestLocations).mockResolvedValue(turf.featureCollection([]) as any);
            vi.mocked(geoSpatialVoronoi).mockReturnValue(turf.featureCollection([]) as any);

            const mapData = { type: 'FeatureCollection', features: [] };
            const result = await adjustPerClosest(question, mapData);
            expect(result).toBe(mapData);
        });

        it('intersects unioned map data with the selected voronoi polygon and circle', async () => {
            const question = {
                lng: -114, lat: 51, radius: 10, unit: 'kilometers',
                location: { properties: { site: { properties: { name: 'TargetPlace' } } } }
            } as any;

            vi.mocked(findClosestLocations).mockResolvedValue(turf.featureCollection([]) as any);

            const voronoiFeature = turf.polygon([
                [[-115, 50], [-115, 52], [-113, 52], [-113, 50], [-115, 50]]
            ], { site: { properties: { name: 'TargetPlace' } } });

            vi.mocked(geoSpatialVoronoi).mockReturnValue(turf.featureCollection([voronoiFeature]) as any);

            const circleFeature = turf.polygon([
                [[-114.5, 50.5], [-114.5, 51.5], [-113.5, 51.5], [-113.5, 50.5], [-114.5, 50.5]]
            ]);
            vi.mocked(arcBuffer).mockResolvedValue(circleFeature as any);
            vi.mocked(safeUnion).mockReturnValue({ type: 'Feature', geometry: turf.polygon([
                [[-116, 49], [-116, 53], [-112, 53], [-112, 49], [-116, 49]]
            ]).geometry, properties: {} } as any);

            const mapData = { type: 'FeatureCollection', features: [] };
            const result = await adjustPerClosest(question, mapData);

            expect(result).not.toBeNull();
            expect(result?.type).toBe('FeatureCollection');
        });
    });

    describe('hiderifyClosest', () => {
        it('returns unmodified question if hiderMode is false', async () => {
            vi.mocked(hiderMode.get).mockReturnValue(false);
            const question = { location: { properties: { name: 'Test' } } } as any;
            const result = await hiderifyClosest(question);
            expect(result).toBe(question);
        });

        it('sets question.location to false if hider is outside radius', async () => {
            vi.mocked(hiderMode.get).mockReturnValue({ longitude: -114, latitude: 51.5 }); // Far away
            const question = { lng: -114, lat: 51, radius: 10, unit: 'kilometers', location: true } as any;

            vi.mocked(findClosestLocations).mockResolvedValue(turf.featureCollection([]) as any);

            const result = await hiderifyClosest(question);
            expect(result.location).toBe(false);
        });

        it('updates question.location based on voronoi polygon the hider is in', async () => {
            vi.mocked(hiderMode.get).mockReturnValue({ longitude: -114.01, latitude: 51.01 }); // Close by
            const question = { lng: -114, lat: 51, radius: 10, unit: 'kilometers', location: true } as any;

            const mockPoints = turf.featureCollection([
                turf.point([-114.01, 51.01], { name: 'ClosestPlace' })
            ]);
            vi.mocked(findClosestLocations).mockResolvedValue(mockPoints as any);

            const voronoiPoly = turf.polygon([[
                [-115, 50], [-115, 52], [-113, 52], [-113, 50], [-115, 50]
            ]]);
            vi.mocked(geoSpatialVoronoi).mockReturnValue(turf.featureCollection([voronoiPoly]) as any);

            const result = await hiderifyClosest(question);
            expect(result.location).toEqual(mockPoints.features[0]);
        });

        it('returns unmodified question if correct voronoi polygon is not found', async () => {
             vi.mocked(hiderMode.get).mockReturnValue({ longitude: -114.01, latitude: 51.01 });
            const question = { lng: -114, lat: 51, radius: 10, unit: 'kilometers', location: { id: 'old' } } as any;

            vi.mocked(findClosestLocations).mockResolvedValue(turf.featureCollection([]) as any);

            // Return an empty voronoi list, so hider point doesn't intersect any
            vi.mocked(geoSpatialVoronoi).mockReturnValue(turf.featureCollection([]) as any);

            const result = await hiderifyClosest(question);
            expect(result).toBe(question);
            expect(result.location).toEqual({ id: 'old' }); // Still the same
        });
    });

    describe('closestPlanningPolygon', () => {
        it('creates an outline of the voronoi intersected with the search circle', async () => {
            const question = { lng: -114, lat: 51, radius: 10, unit: 'kilometers', location: true } as any;

            vi.mocked(findClosestLocations).mockResolvedValue(turf.featureCollection([]) as any);

            const voronoiPoly = turf.polygon([[
                [-115, 50], [-115, 52], [-113, 52], [-113, 50], [-115, 50]
            ]]);
            vi.mocked(geoSpatialVoronoi).mockReturnValue(turf.featureCollection([voronoiPoly]) as any);

            const circleFeature = turf.polygon([
                [[-114.5, 50.5], [-114.5, 51.5], [-113.5, 51.5], [-113.5, 50.5], [-114.5, 50.5]]
            ]);
            vi.mocked(arcBuffer).mockResolvedValue(circleFeature as any);

            const result = await closestPlanningPolygon(question);
            expect(result).not.toBeNull();
            expect(result?.type).toBe('FeatureCollection');
            // Check that it's combined into line features
            if (result) {
                expect(result.features[0].geometry.type).toMatch(/LineString|MultiLineString/);
            }
        });
    });
});
