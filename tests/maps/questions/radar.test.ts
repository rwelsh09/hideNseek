import * as turf from "@turf/turf";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { hiderMode } from "@/lib/context";
import {
    adjustPerRadar,
    hiderifyRadar,
    radarPlanningPolygon,
} from "@/maps/questions/radar";
import type { RadarQuestion } from "@/maps/schema";

vi.mock("@/maps/geo-utils", async (importOriginal) => {
    const actual = await importOriginal<any>();
    const turf = await import("@turf/turf");
    return {
        ...actual,
        arcBuffer: vi
            .fn()
            .mockImplementation(
                async (
                    geometry: FeatureCollection,
                    radius: number,
                    units: turf.Units,
                ) => {
                    // Simplified mock using turf.buffer instead of arcgis to avoid WebAssembly require() errors in vitest
                    const buffer = turf.buffer(geometry, radius, { units });
                    // Ensure we return a single polygon or multipolygon as expected by the actual arcBuffer
                    if (
                        buffer &&
                        buffer.type === "FeatureCollection" &&
                        buffer.features.length > 0
                    ) {
                        return buffer.features[0];
                    }
                    return buffer;
                },
            ),
    };
});

describe("radius", () => {
    beforeEach(() => {
        hiderMode.set(false);
    });

    const question: RadarQuestion = {
        lat: 51.0447,
        lng: -114.0719,
        radius: 10,
        unit: "kilometers",
        within: true,
        drag: true,
        color: "blue",
        collapsed: false,
    };

    describe("adjustPerRadar", () => {
        it("should return intersected geometry when within is true", async () => {
            const mapData = turf.featureCollection([
                turf.polygon([
                    [
                        [-114.1, 51.0],
                        [-114.1, 51.1],
                        [-114.0, 51.1],
                        [-114.0, 51.0],
                        [-114.1, 51.0],
                    ],
                ]),
            ]) as FeatureCollection<Polygon | MultiPolygon>;

            const result = await adjustPerRadar(question, mapData);
            expect(result).toBeDefined();
            expect(result?.type).toBe("Feature");
            expect(result?.geometry.type).toMatch(/Polygon/);

            // Assert modified geometry is bounded by the original mapData and circle
            const bbox = turf.bbox(result!);
            expect(bbox[0]).toBeGreaterThanOrEqual(-114.2);
            expect(bbox[1]).toBeGreaterThanOrEqual(50.9);
            expect(bbox[2]).toBeLessThanOrEqual(-113.9);
            expect(bbox[3]).toBeLessThanOrEqual(51.2);
        });

        it("should return difference geometry when within is false", async () => {
            const questionOutside: RadarQuestion = {
                ...question,
                within: false,
            };
            // Make map data much larger than the buffer to ensure difference works
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
            ]) as FeatureCollection<Polygon | MultiPolygon>;

            const result = await adjustPerRadar(questionOutside, mapData);
            expect(result).toBeDefined();
            expect(result?.type).toBe("Feature");
            expect(result?.geometry.type).toMatch(/Polygon/);

            // The original area should be larger than the subtracted area
            const originalArea = turf.area(mapData);
            const newArea = turf.area(result!);
            expect(newArea).toBeLessThan(originalArea);
            expect(newArea).toBeGreaterThan(0);
        });

        it("should return undefined if mapData is null", async () => {
            const result = await adjustPerRadar(question, null);
            expect(result).toBeUndefined();
        });
    });

    describe("hiderifyRadar", () => {
        it("should return the question unmodified if hiderMode is false", () => {
            const result = hiderifyRadar(question);
            expect(result).toEqual(question);
        });

        it("should set within to true if hider is inside the radius", () => {
            hiderMode.set({ latitude: 51.0447, longitude: -114.0719 }); // exact same coords

            const q = { ...question, within: false };
            const result = hiderifyRadar(q);

            expect(result.within).toBe(true);
        });

        it("should set within to false if hider is outside the radius", () => {
            hiderMode.set({ latitude: 52.0, longitude: -114.0719 }); // far away

            const q = { ...question, within: true };
            const result = hiderifyRadar(q);

            expect(result.within).toBe(false);
        });
    });

    describe("radarPlanningPolygon", () => {
        it("should return a LineString representing the buffer", async () => {
            const result = await radarPlanningPolygon(question);
            expect(result).toBeDefined();
            expect(result.type).toBe("Feature");
            if ("geometry" in result) {
                expect(result.geometry.type).toBe("LineString");
                expect(result.geometry.coordinates.length).toBeGreaterThan(0);
            } else {
                expect.unreachable(
                    "Result must be a Feature, not a FeatureCollection",
                );
            }
        });
    });
});
