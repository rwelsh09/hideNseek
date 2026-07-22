import { describe, expect, it } from "vitest";

import {
    fastDistance,
    getFeatureCoords,
} from "../../../src/maps/geo-utils/index";

describe("getFeatureCoords", () => {
    it("should return coordinates for a Polygon using properties", () => {
        const feature = {
            geometry: { type: "Polygon" },
            properties: { lon: -114.07, lat: 51.05 },
        };
        expect(getFeatureCoords(feature)).toEqual([-114.07, 51.05]);
    });

    it("should return coordinates for a Polygon using center fallback", () => {
        const feature = {
            geometry: { type: "Polygon" },
            center: { lon: -114.05, lat: 51.04 },
        };
        expect(getFeatureCoords(feature)).toEqual([-114.05, 51.04]);
    });

    it("should return coordinates for a MultiPolygon using properties", () => {
        const feature = {
            geometry: { type: "MultiPolygon" },
            properties: { lon: -114.06, lat: 51.06 },
        };
        expect(getFeatureCoords(feature)).toEqual([-114.06, 51.06]);
    });

    it("should return coordinates for a Point using geometry coordinates", () => {
        const feature = {
            geometry: { type: "Point", coordinates: [-114.08, 51.08] },
        };
        expect(getFeatureCoords(feature)).toEqual([-114.08, 51.08]);
    });

    it("should return coordinates for a Point using properties fallback", () => {
        const feature = {
            geometry: { type: "Point" },
            properties: { lon: -114.09, lat: 51.09 },
        };
        expect(getFeatureCoords(feature)).toEqual([-114.09, 51.09]);
    });

    it("should return null when feature is null or undefined", () => {
        expect(getFeatureCoords(null)).toBeNull();
        expect(getFeatureCoords(undefined)).toBeNull();
    });

    it("should return null for Polygon lacking properties and center lon/lat", () => {
        const feature = { geometry: { type: "Polygon" } };
        expect(getFeatureCoords(feature)).toBeNull();

        const feature2 = {
            geometry: { type: "Polygon" },
            properties: { name: "test" },
        };
        expect(getFeatureCoords(feature2)).toBeNull();
    });

    it("should return null for Point lacking geometry coordinates and properties lon/lat", () => {
        const feature = { geometry: { type: "Point" } };
        expect(getFeatureCoords(feature)).toBeNull();

        const feature2 = { properties: { name: "test" } };
        expect(getFeatureCoords(feature2)).toBeNull();
    });

    it("should return null when extracted coordinates contain non-numbers", () => {
        const feature1 = {
            geometry: { type: "Polygon" },
            properties: { lon: "not a number", lat: 51.05 },
        };
        expect(getFeatureCoords(feature1)).toBeNull();

        const feature2 = {
            geometry: { type: "Point", coordinates: [-114.08, "51.08"] },
        };
        expect(getFeatureCoords(feature2)).toBeNull();

        const feature3 = {
            geometry: { type: "Point", coordinates: [undefined, 51.08] },
        };
        expect(getFeatureCoords(feature3)).toBeNull();
    });
});

describe("fastDistance", () => {
    it("should return 0 when the coordinates are identical", () => {
        expect(fastDistance([0, 0], [0, 0], "kilometers")).toBe(0);
        expect(fastDistance([10, 10], [10, 10], "miles")).toBe(0);
        expect(fastDistance([-50.5, 45.2], [-50.5, 45.2], "kilometers")).toBe(
            0,
        );
    });

    it("should calculate distance correctly in kilometers", () => {
        // Equator: 0,0 to 0,1
        expect(fastDistance([0, 0], [0, 1], "kilometers")).toBeCloseTo(
            111.1950802335329,
            5,
        );

        // London (-0.1278, 51.5074) to Paris (2.3522, 48.8566)
        expect(
            fastDistance([-0.1278, 51.5074], [2.3522, 48.8566], "kilometers"),
        ).toBeCloseTo(343.5565348808832, 5);
    });

    it("should calculate distance correctly in miles", () => {
        // Equator: 0,0 to 0,1
        expect(fastDistance([0, 0], [0, 1], "miles")).toBeCloseTo(
            69.093418985531,
            5,
        );

        // New York (-74.0060, 40.7128) to Los Angeles (-118.2437, 34.0522)
        expect(
            fastDistance([-74.006, 40.7128], [-118.2437, 34.0522], "miles"),
        ).toBeCloseTo(2445.5626996341102, 5);
    });

    it("should be symmetrical", () => {
        const c1: [number, number] = [-74.006, 40.7128];
        const c2: [number, number] = [-118.2437, 34.0522];

        expect(fastDistance(c1, c2, "kilometers")).toBe(
            fastDistance(c2, c1, "kilometers"),
        );
        expect(fastDistance(c1, c2, "miles")).toBe(
            fastDistance(c2, c1, "miles"),
        );
    });

    it("should handle equator and prime meridian crossings correctly", () => {
        // Northwest (negative lon, positive lat) to Southeast (positive lon, negative lat)
        const nw: [number, number] = [-10, 10];
        const se: [number, number] = [10, -10];

        expect(fastDistance(nw, se, "kilometers")).toBeCloseTo(
            3137.045446662887,
            5,
        );
        expect(fastDistance(se, nw, "kilometers")).toBeCloseTo(
            3137.045446662887,
            5,
        );

        // Southwest to Northeast
        const sw: [number, number] = [-10, -10];
        const ne: [number, number] = [10, 10];

        expect(fastDistance(sw, ne, "kilometers")).toBeCloseTo(
            3137.045446662887,
            5,
        );
    });
});
