import * as turf from "@turf/turf";
import { expect, test, describe, vi, beforeEach } from "vitest";

import {
    adjustPerThermometer,
    hiderifyThermometer,
    thermometerPlanningPolygon,
} from "@/maps/questions/thermometer";
import type { ThermometerQuestion } from "@/maps/schema";

vi.mock("@/lib/context", () => ({
    hiderMode: {
        get: vi.fn(),
    },
}));

vi.mock("@/maps/geo-utils/voronoi", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("@/maps/geo-utils/voronoi")>();
    return {
        ...actual,
        geoSpatialVoronoi: vi.fn(actual.geoSpatialVoronoi),
    };
});

import { hiderMode } from "@/lib/context";
import { geoSpatialVoronoi } from "@/maps/geo-utils/voronoi";

describe("thermometer", () => {
    const questionTemplate: ThermometerQuestion = {
        latA: 51.0,
        lngA: -114.0,
        latB: 51.1,
        lngB: -114.1,
        warmer: true,
        colorA: "red",
        colorB: "blue",
        drag: true,
        collapsed: false,
    };

    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe("adjustPerThermometer", () => {
        test("should return early if mapData is null", () => {
            const result = adjustPerThermometer(questionTemplate, null);
            expect(result).toBeUndefined();
        });

        test("should return null or throw if mapData is empty FeatureCollection", () => {
            // safeUnion throws if features are empty, let's test that adjustPerThermometer handles or bubbles it
            const emptyMapData = turf.featureCollection([]);
            expect(() =>
                adjustPerThermometer(questionTemplate, emptyMapData),
            ).toThrow();
        });

        test("should intersect mapData with warmer voronoi polygon", () => {
            const mapData = turf.featureCollection([
                turf.polygon([
                    [
                        [-115.0, 50.0],
                        [-115.0, 52.0],
                        [-113.0, 52.0],
                        [-113.0, 50.0],
                        [-115.0, 50.0],
                    ],
                ]),
            ]);

            const result = adjustPerThermometer(
                { ...questionTemplate, warmer: true },
                mapData,
            );
            expect(result).toBeDefined();
            expect(result?.type).toBe("Feature");
            // voronoi.features[1] is point B, so this should intersect with that half
        });

        test("should intersect mapData with colder voronoi polygon", () => {
            const mapData = turf.featureCollection([
                turf.polygon([
                    [
                        [-115.0, 50.0],
                        [-115.0, 52.0],
                        [-113.0, 52.0],
                        [-113.0, 50.0],
                        [-115.0, 50.0],
                    ],
                ]),
            ]);

            const result = adjustPerThermometer(
                { ...questionTemplate, warmer: false },
                mapData,
            );
            expect(result).toBeDefined();
            expect(result?.type).toBe("Feature");
        });
    });

    describe("hiderifyThermometer", () => {
        test("should return unchanged question if hiderMode is false", () => {
            (hiderMode.get as any).mockReturnValue(false);

            const result = hiderifyThermometer(questionTemplate);

            expect(result).toEqual(questionTemplate);
        });

        test("should set warmer to true if hider is closer to point B", () => {
            // Point A is at 51.0, -114.0
            // Point B is at 51.1, -114.1
            // Put hider right next to point B
            (hiderMode.get as any).mockReturnValue({
                latitude: 51.09,
                longitude: -114.09,
            });

            const result = hiderifyThermometer({
                ...questionTemplate,
                warmer: false,
            });

            expect(result.warmer).toBe(true);
        });

        test("should set warmer to false if hider is closer to point A", () => {
            // Point A is at 51.0, -114.0
            // Point B is at 51.1, -114.1
            // Put hider right next to point A
            (hiderMode.get as any).mockReturnValue({
                latitude: 51.01,
                longitude: -114.01,
            });

            const result = hiderifyThermometer({
                ...questionTemplate,
                warmer: true,
            });

            expect(result.warmer).toBe(false);
        });
    });

    describe("thermometerPlanningPolygon", () => {
        test("should return a FeatureCollection of LineStrings", () => {
            const result = thermometerPlanningPolygon(questionTemplate);

            expect(result).toBeDefined();
            expect(result.type).toBe("FeatureCollection");
            expect(result.features.length).toBeGreaterThan(0);
            expect(result.features[0].geometry.type).toBe("LineString");
        });

        test("should handle MultiPolygon features from voronoi by flattening the FeatureCollection", () => {
            // Mock geoSpatialVoronoi to return a MultiPolygon to trigger the FeatureCollection branch in polygonToLine
            (geoSpatialVoronoi as any).mockReturnValueOnce(
                turf.featureCollection([
                    turf.multiPolygon([
                        [
                            [
                                [0, 0],
                                [1, 0],
                                [1, 1],
                                [0, 1],
                                [0, 0],
                            ],
                        ],
                        [
                            [
                                [2, 2],
                                [3, 2],
                                [3, 3],
                                [2, 3],
                                [2, 2],
                            ],
                        ],
                    ]),
                ]),
            );

            const result = thermometerPlanningPolygon(questionTemplate);

            expect(result).toBeDefined();
            expect(result.type).toBe("FeatureCollection");
            expect(result.features.length).toBe(2);
            expect(result.features[0].geometry.type).toBe("LineString");
            expect(result.features[1].geometry.type).toBe("LineString");
        });
    });
});
