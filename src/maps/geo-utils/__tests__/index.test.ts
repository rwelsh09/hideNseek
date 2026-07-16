import { describe, expect, it } from "vitest";

import { fastDistance } from "../index";

describe("fastDistance", () => {
    it("should return 0 when the coordinates are identical", () => {
        expect(fastDistance([0, 0], [0, 0], "kilometers")).toBe(0);
        expect(fastDistance([10, 10], [10, 10], "miles")).toBe(0);
        expect(fastDistance([-50.5, 45.2], [-50.5, 45.2], "kilometers")).toBe(0);
    });

    it("should calculate distance correctly in kilometers", () => {
        // Equator: 0,0 to 0,1
        expect(fastDistance([0, 0], [0, 1], "kilometers")).toBeCloseTo(111.19492664455873, 5);

        // London (-0.1278, 51.5074) to Paris (2.3522, 48.8566)
        expect(fastDistance([-0.1278, 51.5074], [2.3522, 48.8566], "kilometers")).toBeCloseTo(343.55606034104164, 5);
    });

    it("should calculate distance correctly in miles", () => {
        // Equator: 0,0 to 0,1
        expect(fastDistance([0, 0], [0, 1], "miles")).toBeCloseTo(69.09758508645551, 5);

        // New York (-74.0060, 40.7128) to Los Angeles (-118.2437, 34.0522)
        expect(fastDistance([-74.0060, 40.7128], [-118.2437, 34.0522], "miles")).toBeCloseTo(2445.710158844748, 5);
    });

    it("should be symmetrical", () => {
        const c1: [number, number] = [-74.0060, 40.7128];
        const c2: [number, number] = [-118.2437, 34.0522];

        expect(fastDistance(c1, c2, "kilometers")).toBe(fastDistance(c2, c1, "kilometers"));
        expect(fastDistance(c1, c2, "miles")).toBe(fastDistance(c2, c1, "miles"));
    });

    it("should handle equator and prime meridian crossings correctly", () => {
        // Northwest (negative lon, positive lat) to Southeast (positive lon, negative lat)
        const nw: [number, number] = [-10, 10];
        const se: [number, number] = [10, -10];

        expect(fastDistance(nw, se, "kilometers")).toBeCloseTo(3137.041113597152, 5);
        expect(fastDistance(se, nw, "kilometers")).toBeCloseTo(3137.041113597152, 5);

        // Southwest to Northeast
        const sw: [number, number] = [-10, -10];
        const ne: [number, number] = [10, 10];

        expect(fastDistance(sw, ne, "kilometers")).toBeCloseTo(3137.041113597152, 5);
    });
});
