import { describe, expect, it, beforeEach, vi } from "vitest";
import * as turf from "@turf/turf";
import {
    adjustPerRadius,
    hiderifyRadius,
    radiusPlanningPolygon,
} from "@/maps/questions/radius";
import type { RadiusQuestion } from "@/maps/schema";
import { hiderMode } from "@/lib/context";
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";

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

    const question: RadiusQuestion = {
        lat: 51.0447,
        lng: -114.0719,
        radius: 10,
        unit: "kilometers",
        within: true,
        drag: true,
        color: "blue",
        collapsed: false,
    };

    describe("adjustPerRadius", () => {
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

            const result = await adjustPerRadius(question, mapData);
            expect(result).toBeDefined();
            expect(result?.type).toBe("Feature");
            expect(result?.geometry.type).toMatch(/Polygon/);
        });

        it("should return difference geometry when within is false", async () => {
            const questionOutside: RadiusQuestion = {
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

            const result = await adjustPerRadius(questionOutside, mapData);
            expect(result).toBeDefined();
            expect(result?.type).toBe("Feature");
            expect(result?.geometry.type).toMatch(/Polygon/);
        });

        it("should return undefined if mapData is null", async () => {
            const result = await adjustPerRadius(question, null);
            expect(result).toBeUndefined();
        });
    });

    describe("hiderifyRadius", () => {
        it("should return the question unmodified if hiderMode is false", () => {
            const result = hiderifyRadius(question);
            expect(result).toEqual(question);
        });

        it("should set within to true if hider is inside the radius", () => {
            hiderMode.set({ latitude: 51.0447, longitude: -114.0719 }); // exact same coords

            const q = { ...question, within: false };
            const result = hiderifyRadius(q);

            expect(result.within).toBe(true);
        });

        it("should set within to false if hider is outside the radius", () => {
            hiderMode.set({ latitude: 52.0, longitude: -114.0719 }); // far away

            const q = { ...question, within: true };
            const result = hiderifyRadius(q);

            expect(result.within).toBe(false);
        });
    });

    describe("radiusPlanningPolygon", () => {
        it("should return a LineString representing the buffer", async () => {
            const result = await radiusPlanningPolygon(question);
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
