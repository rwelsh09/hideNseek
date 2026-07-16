import { describe, expect, it } from "vitest";

import {
    extractStationLabel,
    extractStationLines,
    extractStationName,
    getFeatureProperties,
    lngLatToText,
} from "@/maps/geo-utils/special";

describe("getFeatureProperties", () => {
    it("should return an empty object for null or undefined input", () => {
        expect(getFeatureProperties(null)).toEqual({});
        expect(getFeatureProperties(undefined)).toEqual({});
    });

    it("should return feature.properties.tags if it exists", () => {
        const feature = {
            properties: {
                tags: {
                    name: "Test Tag",
                    amenity: "cafe"
                }
            }
        };

        expect(getFeatureProperties(feature)).toEqual({
            name: "Test Tag",
            amenity: "cafe"
        });
    });

    it("should merge and flatten properties if feature.properties.properties exists", () => {
        const feature = {
            properties: {
                baseProp: "base",
                properties: {
                    nestedProp: "nested"
                }
            }
        };

        const result = getFeatureProperties(feature);

        expect(result).toEqual({
            baseProp: "base",
            properties: {
                nestedProp: "nested"
            },
            nestedProp: "nested"
        });
    });

    it("should return feature.properties if it exists but tags or nested properties do not", () => {
        const feature = {
            properties: {
                a: 1,
                b: 2
            }
        };

        expect(getFeatureProperties(feature)).toEqual({
            a: 1,
            b: 2
        });
    });

    it("should return the feature itself if feature.properties does not exist", () => {
        const feature = {
            id: 123,
            type: "Feature"
        };

        expect(getFeatureProperties(feature)).toEqual({
            id: 123,
            type: "Feature"
        });
    });
});

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
