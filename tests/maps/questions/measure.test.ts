import * as turf from "@turf/turf";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    hiderMode,
    mapGeoJSON,
    mapGeoLocation,
    polyGeoJSON,
} from "@/lib/context";
import { findPlacesInZone } from "@/maps/api";
import { arcBufferToPoint } from "@/maps/geo-utils";
import {
    adjustPerMeasure,
    calculateMeasureDistance,
    hiderifyMeasure,
    measurePlanningPolygon,
} from "@/maps/questions/measure";
import type { MeasureQuestion } from "@/maps/schema";

vi.mock("@/lib/context", () => ({
    hiderMode: { get: vi.fn(), set: vi.fn() },
    mapGeoJSON: { get: vi.fn(), set: vi.fn() },
    mapGeoLocation: { get: vi.fn(), set: vi.fn() },
    polyGeoJSON: { get: vi.fn(), set: vi.fn() },
}));

vi.mock("@/maps/api", async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        findPlacesInZone: vi.fn(),
    };
});

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn() },
}));

vi.mock("@/maps/geo-utils", async (importOriginal) => {
    const actual = await importOriginal<any>();
    const turf = await import("@turf/turf");
    return {
        ...actual,
        arcBufferToPoint: vi.fn().mockImplementation(async () => {
            // Safely mock to return a standard GeoJSON polygon
            return turf.polygon([
                [
                    [-114.1, 51.0],
                    [-114.1, 51.1],
                    [-114.0, 51.1],
                    [-114.0, 51.0],
                    [-114.1, 51.0],
                ],
            ]);
        }),
    };
});

vi.mock("@/data/calgary_rapid_transit_network.json", () => ({
    default: {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                properties: { name: "Station 1" },
                geometry: { type: "Point", coordinates: [-114.05, 51.05] },
            },
        ],
    },
}));

describe("Measure Questions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("calculateMeasureDistance", () => {
        it("calculates distance for rail-measure", async () => {
            const question: MeasureQuestion = {
                id: "measure",
                type: "rail-measure",
                lat: 51.0,
                lng: -114.0,
                hiderCloser: true,
                locked: false,
                collapsed: false,
            };
            const dist = await calculateMeasureDistance(question);
            expect(dist).toBeGreaterThan(0);
        });

        it("calculates distance for regular place types", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [{ lat: 51.06, lon: -114.06 }],
            });
            const question: MeasureQuestion = {
                id: "measure",
                type: "museum",
                lat: 51.0,
                lng: -114.0,
                hiderCloser: true,
                locked: false,
                collapsed: false,
            };
            const dist = await calculateMeasureDistance(question);
            expect(dist).toBeDefined();
            expect(dist).toBeGreaterThan(0);
        });

        it("returns null if no places found", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [],
            });
            const question: MeasureQuestion = {
                id: "measure",
                type: "museum",
                lat: 51.0,
                lng: -114.0,
                hiderCloser: true,
                locked: false,
                collapsed: false,
            };
            const dist = await calculateMeasureDistance(question);
            expect(dist).toBeNull();
        });

        it("returns distance when places have multiple geometry types", async () => {
            // Testing the branches for pointToLineDistance, MultiPoint, etc.
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [
                    // A place with no center/lon/lat directly, but represented as Feature in determineMeasureBoundary...
                    // Wait, findPlacesInZone returns raw OSM elements for measure!
                    // determineMeasureBoundary specifically converts:
                    // turf.point([x.center ? x.center.lon : x.lon, x.center ? x.center.lat : x.lat])
                    // So calculateMeasureDistance actually expects findPlacesInZone elements to be raw points!
                    // BUT calculateMeasureDistance itself checks feature.geometry.type === "Polygon" etc.
                    // Let's look at `determineMeasureBoundary`. It always returns points!
                    // So how could it ever be a Polygon? Oh, wait... if `boundaryData` is the return of `determineMeasureBoundary`, it's an array of Points.
                    { center: { lat: 51.05, lon: -114.05 } },
                ],
            });

            // To properly test the Polygon/LineString branches, we can mock determineMeasureBoundary.
            // Actually, determineMeasureBoundary is not exported. But calculateMeasureDistance just calls it.
            // If we look at determineMeasureBoundary, it returns `turf.combine(turf.featureCollection(points)).features[0]`.
            // The result of `turf.combine` on points is a `MultiPoint`!
            // Let's provide points, and test the MultiPoint branch.

            const question: MeasureQuestion = {
                id: "measure",
                type: "museum",
                lat: 51.0,
                lng: -114.0,
                hiderCloser: true,
                locked: false,
                collapsed: false,
            };

            const dist = await calculateMeasureDistance(question);
            expect(dist).toBeDefined();
            expect(dist).toBeGreaterThan(0);
        });
    });

    describe("adjustPerMeasure", () => {
        it("returns undefined if mapData is null", async () => {
            const result = await adjustPerMeasure(
                { type: "rail-measure" } as any,
                null,
            );
            expect(result).toBeUndefined();
        });

        it("modifies map data when boundary generation succeeds (hiderCloser = true)", async () => {
            vi.mocked(polyGeoJSON.get).mockReturnValue(null as any);
            vi.mocked(mapGeoLocation.get).mockReturnValue(null as any);

            const mapData = turf.featureCollection([
                turf.polygon([
                    [
                        [-114.2, 50.9],
                        [-114.2, 51.2],
                        [-113.9, 51.2],
                        [-113.9, 50.9],
                        [-114.2, 50.9],
                    ],
                ]),
            ]);

            const question: MeasureQuestion = {
                id: "measure",
                type: "rail-measure",
                lat: 51.01,
                lng: -114.01,
                hiderCloser: true,
                locked: false,
                collapsed: false,
            };

            const result = await adjustPerMeasure(question, mapData);
            expect(result).toBeDefined();
            expect(result?.type).toBe("Feature");
            const bbox = turf.bbox(result!);
            expect(bbox).toEqual([-114.1, 51.0, -114.0, 51.1]);
        });

        it("modifies map data when boundary generation succeeds (hiderCloser = false)", async () => {
            vi.mocked(polyGeoJSON.get).mockReturnValue(null as any);
            vi.mocked(mapGeoLocation.get).mockReturnValue(null as any);

            const mapData = turf.featureCollection([
                turf.polygon([
                    [
                        [-114.2, 50.9],
                        [-114.2, 51.2],
                        [-113.9, 51.2],
                        [-113.9, 50.9],
                        [-114.2, 50.9],
                    ],
                ]),
            ]);

            const question: MeasureQuestion = {
                id: "measure",
                type: "rail-measure",
                lat: 51.02,
                lng: -114.02,
                hiderCloser: false,
                locked: false,
                collapsed: false,
            };

            const result = await adjustPerMeasure(question, mapData);
            expect(result).toBeDefined();
            expect(result?.type).toBe("Feature");
            const originalArea = turf.area(mapData);
            const newArea = turf.area(result!);
            expect(newArea).toBeLessThan(originalArea);
        });
    });

    describe("hiderifyMeasure", () => {
        it("returns unmodified if hiderMode is false", async () => {
            vi.mocked(hiderMode.get).mockReturnValue(false);
            const question: MeasureQuestion = {
                type: "rail-measure",
                hiderCloser: true,
                lat: 51.03,
                lng: -114.03,
            } as any;
            const result = await hiderifyMeasure(question);
            expect(result).toEqual(question);
        });

        it("returns unmodified if mapGeoJSON is null", async () => {
            vi.mocked(hiderMode.get).mockReturnValue({
                latitude: 51.05,
                longitude: -114.05,
            });
            vi.mocked(mapGeoJSON.get).mockReturnValue(null as any);
            const question: MeasureQuestion = {
                type: "rail-measure",
                hiderCloser: true,
                lat: 51.04,
                lng: -114.04,
            } as any;
            const result = await hiderifyMeasure(question);
            expect(result).toEqual(question);
        });

        it("sets hiderCloser to true if hider is within the buffer", async () => {
            vi.mocked(hiderMode.get).mockReturnValue({
                latitude: 51.05,
                longitude: -114.05,
            });
            vi.mocked(mapGeoJSON.get).mockReturnValue({} as any);
            const question: MeasureQuestion = {
                id: "measure",
                type: "rail-measure",
                lat: 51.05,
                lng: -114.05,
                hiderCloser: false,
                locked: false,
                collapsed: false,
            };
            const result = await hiderifyMeasure(question);
            expect(result.hiderCloser).toBe(true);
        });

        it("sets hiderCloser to false if hider is outside the buffer", async () => {
            vi.mocked(hiderMode.get).mockReturnValue({
                latitude: 51.2,
                longitude: -114.2,
            });
            vi.mocked(mapGeoJSON.get).mockReturnValue({} as any);
            const question: MeasureQuestion = {
                id: "measure",
                type: "rail-measure",
                lat: 51.06,
                lng: -114.06,
                hiderCloser: true,
                locked: false,
                collapsed: false,
            };
            const result = await hiderifyMeasure(question);
            expect(result.hiderCloser).toBe(false);
        });
    });

    describe("measurePlanningPolygon", () => {
        it("returns LineString representation of the buffer", async () => {
            const question: MeasureQuestion = {
                type: "rail-measure",
                lat: 51.07,
                lng: -114.07,
            } as any;
            const result = await measurePlanningPolygon(question);
            expect(result).not.toBe(false);
            if (result !== false) {
                expect(result.type).toBe("Feature");
                expect(result.geometry.type).toBe("LineString");
            }
        });

        it("returns false on error", async () => {
            vi.mocked(arcBufferToPoint).mockRejectedValueOnce(
                new Error("Test Error"),
            );
            const question: MeasureQuestion = {
                type: "rail-measure",
                lat: 51.08,
                lng: -114.08,
            } as any;
            const result = await measurePlanningPolygon(question);
            expect(result).toBe(false);
        });
    });
});
