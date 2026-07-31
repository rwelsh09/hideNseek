import * as turf from "@turf/turf";
import osm2geojson from "osm2geojson-lite";
import { toast } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { findPlacesInZone } from "@/maps/api";
import {
    determineMatchBoundary,
    findMatchPlaces,
} from "@/maps/questions/match";

import {
    adjustPerMatch,
    hiderifyMatch,
    matchPlanningPolygon,
    isMatchLocked,
    createMatchDraft,
    getMatchPlaceName,
} from "@/maps/questions/match";
import {
    hiderMode,
    mapGeoJSON,
    polyGeoJSON,
    mapGeoLocation,
} from "@/lib/context";

vi.mock("@/maps/api", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        findPlacesInZone: vi.fn(),
    };
});

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn() },
}));

vi.mock("osm2geojson-lite");

vi.mock("@/lib/context", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        hiderMode: { get: vi.fn() },
        mapGeoJSON: { get: vi.fn() },
        polyGeoJSON: { get: vi.fn() },
        mapGeoLocation: { get: vi.fn() },
    };
});

describe("Match Questions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findMatchPlaces", () => {
        it("returns mapped points for valid places", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [
                    { lat: 51.0, lon: -114.0 },
                    { center: { lat: 51.1, lon: -114.1 } },
                ],
            });
            const result = await findMatchPlaces({ type: "museum" } as any);
            expect(result.features).toHaveLength(2);
            expect(result.features[0].geometry.coordinates).toEqual([
                -114.0, 51.0,
            ]);
            expect(result.features[1].geometry.coordinates).toEqual([
                -114.1, 51.1,
            ]);
        });

        it("returns empty FeatureCollection and toasts error if too many elements are found", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: new Array(5000).fill({}),
            });
            const result = await findMatchPlaces({ type: "museum" } as any);
            expect(result.features).toEqual([]);
            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe("determineMatchBoundary - same-neighbourhood", () => {
        it("returns the neighbourhood polygon containing the point", async () => {
            const mockPolygon = turf.polygon(
                [
                    [
                        [-114.1, 51.1],
                        [-114.1, 51.2],
                        [-114.0, 51.2],
                        [-114.0, 51.1],
                        [-114.1, 51.1],
                    ],
                ],
                { name: "Testhood" },
            );
            const osmMockData = {
                elements: [
                    {
                        type: "way",
                        id: 1,
                        nodes: [1, 2, 3, 4, 1],
                        tags: { admin_level: "10" },
                    },
                ],
            };

            vi.mocked(findPlacesInZone).mockResolvedValueOnce(osmMockData);
            vi.mocked(osm2geojson).mockReturnValue(
                turf.featureCollection([mockPolygon]) as any,
            );

            const boundary = await determineMatchBoundary({
                type: "same-neighbourhood",
                lat: 51.15,
                lng: -114.05,
            } as any);

            expect(boundary).toBeDefined();
            expect(boundary.geometry.type).toBe("Polygon");
        });
    });

    describe("determineMatchBoundary - PLACES", () => {
        it("returns boundary based on voronoi for PLACES", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [
                    { lat: 51.0, lon: -114.0 },
                    { lat: 51.1, lon: -114.1 },
                ],
            });

            const boundary = await determineMatchBoundary({
                type: "museum",
                lat: 51.01,
                lng: -114.01,
            } as any);

            expect(boundary).toBeDefined();
            expect(boundary.geometry.type).toBe("Polygon");
        });
    });

    describe("isMatchLocked", () => {
        it("returns true if type matches detail", () => {
            expect(isMatchLocked({ type: "museum" }, "museum")).toBe(true);
            expect(isMatchLocked({ type: "park" }, "museum")).toBe(false);
            expect(isMatchLocked({ type: "museum" })).toBe(true);
        });
    });

    describe("createMatchDraft", () => {
        it("creates draft object", () => {
            const draft = createMatchDraft(
                { lat: 51, lng: -114 },
                "park",
                true,
            );
            expect(draft).toEqual({
                lat: 51,
                lng: -114,
                locked: false,
                doubledPenalty: true,
                type: "park",
                same: true,
                colour: "red",
            });
        });
    });

    describe("adjustPerMatch", () => {
        it("returns early if mapData is null", async () => {
            expect(await adjustPerMatch({} as any, null)).toBeUndefined();
        });

        it("returns mapData if boundary is false", async () => {
            const result = await adjustPerMatch(
                { type: "same-train-line" } as any,
                { mock: "data" },
            );
            expect(result).toEqual({ mock: "data" });
        });
    });

    describe("hiderifyMatch", () => {
        it("returns question if hiderMode is false", async () => {
            vi.mocked(hiderMode.get).mockReturnValue(false);
            const question = { type: "museum" };
            const result = await hiderifyMatch(question as any);
            expect(result).toEqual(question);
        });

        it("returns question if mapGeoJSON is null", async () => {
            vi.mocked(hiderMode.get).mockReturnValue({
                latitude: 51,
                longitude: -114,
            } as any);
            vi.mocked(mapGeoJSON.get).mockReturnValue(null);
            const question = { type: "museum" };
            const result = await hiderifyMatch(question as any);
            expect(result).toEqual(question);
        });

        it("handles station questions correctly", async () => {
            vi.mocked(hiderMode.get).mockReturnValue({
                latitude: 51.0478,
                longitude: -114.0593,
            } as any); // City Hall
            vi.mocked(mapGeoJSON.get).mockReturnValue({
                type: "FeatureCollection",
                features: [],
            } as any);

            // seeker is at Victoria Park
            const question = {
                type: "same-first-letter-station",
                lat: 51.0378,
                lng: -114.0593,
            } as any;
            const result = await hiderifyMatch(question);
            expect(result.same).toBe(false);
        });

        it("handles length station questions", async () => {
            vi.mocked(hiderMode.get).mockReturnValue({
                latitude: 51.0478,
                longitude: -114.0593,
            } as any); // City Hall
            vi.mocked(mapGeoJSON.get).mockReturnValue({
                type: "FeatureCollection",
                features: [],
            } as any);

            const question = {
                type: "same-length-station",
                lengthComparison: "shorter",
                lat: 51.0378,
                lng: -114.0593,
            } as any;
            const result = await hiderifyMatch(question);
            expect(result.same).toBe(false);
        });

        it("handles train line station questions", async () => {
            vi.mocked(hiderMode.get).mockReturnValue({
                latitude: 51.0478,
                longitude: -114.0593,
            } as any); // City Hall
            vi.mocked(mapGeoJSON.get).mockReturnValue({
                type: "FeatureCollection",
                features: [],
            } as any);

            const question = {
                type: "same-train-line",
                lat: 51.0378,
                lng: -114.0593,
            } as any;
            const result = await hiderifyMatch(question);
            expect(result.same).toBe(true);
        });

        it("handles boundary check when not a station question", async () => {
            vi.mocked(hiderMode.get).mockReturnValue({
                latitude: 51.15,
                longitude: -114.05,
            } as any);
            vi.mocked(mapGeoJSON.get).mockReturnValue({
                type: "FeatureCollection",
                features: [],
            } as any);

            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [
                    {
                        type: "way",
                        id: 1,
                        nodes: [1, 2, 3, 4, 1],
                        tags: { admin_level: "10" },
                    },
                ],
            });
            const mockPolygon = turf.polygon(
                [
                    [
                        [-114.1, 51.1],
                        [-114.1, 51.2],
                        [-114.0, 51.2],
                        [-114.0, 51.1],
                        [-114.1, 51.1],
                    ],
                ],
                { name: "Testhood" },
            );
            vi.mocked(osm2geojson).mockReturnValue(
                turf.featureCollection([mockPolygon]) as any,
            );

            const result = await hiderifyMatch({
                type: "same-neighbourhood",
                lat: 51.15,
                lng: -114.05,
            } as any);
            expect(result.same).toBe(true);
        });
    });

    describe("matchPlanningPolygon", () => {
        it("returns line representation of boundary", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [
                    {
                        type: "way",
                        id: 1,
                        nodes: [1, 2, 3, 4, 1],
                        tags: { admin_level: "10" },
                    },
                ],
            });
            const mockPolygon = turf.polygon(
                [
                    [
                        [-114.1, 51.1],
                        [-114.1, 51.2],
                        [-114.0, 51.2],
                        [-114.0, 51.1],
                        [-114.1, 51.1],
                    ],
                ],
                { name: "Testhood" },
            );
            vi.mocked(osm2geojson).mockReturnValue(
                turf.featureCollection([mockPolygon]) as any,
            );

            const result = await matchPlanningPolygon({
                type: "same-neighbourhood",
                lat: 51.15,
                lng: -114.05,
            } as any);
            expect(result).toBeDefined();
            expect((result as any).geometry.type).toBe("LineString");
        });

        it("returns false if determineMatchBoundary fails or is false", async () => {
            const result = await matchPlanningPolygon({
                type: "same-train-line",
            } as any);
            expect(result).toBe(false);
        });
    });

    describe("getMatchPlaceName", () => {
        it("handles station questions", async () => {
            const name = await getMatchPlaceName({
                type: "same-train-line",
                lat: 51.0478,
                lng: -114.0593,
            } as any);
            expect(name).toContain("Centre Street");
        });

        it("handles other questions", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [
                    {
                        type: "way",
                        id: 1,
                        nodes: [1, 2, 3, 4, 1],
                        tags: { admin_level: "10" },
                    },
                ],
            });
            const mockPolygon = turf.polygon(
                [
                    [
                        [-114.1, 51.1],
                        [-114.1, 51.2],
                        [-114.0, 51.2],
                        [-114.0, 51.1],
                        [-114.1, 51.1],
                    ],
                ],
                { name: "Testhood" },
            );
            vi.mocked(osm2geojson).mockReturnValue(
                turf.featureCollection([mockPolygon]) as any,
            );

            const name = await getMatchPlaceName({
                type: "same-neighbourhood",
                lat: 51.15,
                lng: -114.05,
            } as any);
            expect(name).toBe("Testhood");
        });
    });
});
