import { describe, expect, it } from "vitest";

import {
    extractStationLabel,
    extractStationLines,
    extractStationName,
    lngLatToText,
} from "@/maps/geo-utils/special";

describe("lngLatToText", () => {
    it("should format positive coordinates as N/E", () => {
        expect(lngLatToText([10.5, 20.5])).toBe("20.5°N, 10.5°E");
    });

    it("should format negative coordinates as S/W", () => {
        expect(lngLatToText([-10.5, -20.5])).toBe("20.5°S, 10.5°W");
    });

    it("should format exactly 0 latitude as N and 0 longitude as E", () => {
        expect(lngLatToText([0, 0])).toBe("0°N, 0°E");
    });

    it("should handle mixed positive/negative coordinates", () => {
        expect(lngLatToText([-10.5, 20.5])).toBe("20.5°N, 10.5°W");
        expect(lngLatToText([10.5, -20.5])).toBe("20.5°S, 10.5°E");
    });
});

describe("extractStationName", () => {
    it("should return name:en if present", () => {
        const place = {
            properties: { "name:en": "English Name", name: "Local Name" },
        };
        expect(extractStationName(place)).toBe("English Name");
    });

    it("should return name if name:en is missing", () => {
        const place = { properties: { name: "Local Name" } };
        expect(extractStationName(place)).toBe("Local Name");
    });

    it("should return undefined if both are missing", () => {
        const place = { properties: {} };
        expect(extractStationName(place)).toBeUndefined();
    });
});

describe("extractStationLabel", () => {
    it("should return the station name if available", () => {
        const place = {
            properties: { name: "Station Alpha" },
            geometry: { coordinates: [10, 20] },
        };
        expect(extractStationLabel(place)).toBe("Station Alpha");
    });

    it("should fallback to coordinate text if name is missing", () => {
        const place = { properties: {}, geometry: { coordinates: [10, 20] } };
        expect(extractStationLabel(place)).toBe("20°N, 10°E");
    });
});

describe("extractStationLines", () => {
    it("should extract lines from route_ref separated by commas", () => {
        const place = { properties: { route_ref: "Blue Line, Red Line" } };
        expect(extractStationLines(place)).toEqual(["Blue Line", "Red Line"]);
    });

    it("should extract lines from route_ref separated by semicolons", () => {
        const place = { properties: { route_ref: "Blue Line;Red Line" } };
        expect(extractStationLines(place)).toEqual(["Blue Line", "Red Line"]);
    });

    it("should fallback to ref if route_ref is missing", () => {
        const place = { properties: { ref: "Green Line, Orange Line" } };
        expect(extractStationLines(place)).toEqual(["Green Line", "Orange Line"]);
    });

    it("should trim whitespace from extracted lines", () => {
        const place = { properties: { route_ref: "  Blue Line  ,   Red Line   " } };
        expect(extractStationLines(place)).toEqual(["Blue Line", "Red Line"]);
    });

    it("should filter out empty strings", () => {
        const place = { properties: { route_ref: "Blue Line,,;Red Line;" } };
        expect(extractStationLines(place)).toEqual(["Blue Line", "Red Line"]);
    });

    it("should return an empty array if both route_ref and ref are missing", () => {
        const place = { properties: { name: "Station Alpha" } };
        expect(extractStationLines(place)).toEqual([]);
    });

    it("should work with nested properties.properties structure", () => {
        const place = {
            properties: {
                properties: { route_ref: "Blue Line, Red Line" }
            }
        };
        expect(extractStationLines(place)).toEqual(["Blue Line", "Red Line"]);
    });
});
