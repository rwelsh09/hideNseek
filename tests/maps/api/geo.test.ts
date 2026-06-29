import { describe, expect, it } from "vitest";

import { convertToLatLong, convertToLongLat, determineName, prettifyLocation } from "../../../src/maps/api/geo";
import type { OpenStreetMap } from "../../../src/maps/api/types";

describe("convertToLongLat", () => {
    it("should convert [lat, long] to [long, lat]", () => {
        expect(convertToLongLat([51.0, -114.0])).toEqual([-114.0, 51.0]);
    });
});

describe("convertToLatLong", () => {
    it("should convert [long, lat] to [lat, long]", () => {
        expect(convertToLatLong([-114.0, 51.0])).toEqual([51.0, -114.0]);
    });
});

describe("prettifyLocation", () => {
    it("should prettify specific locations (singular)", () => {
        expect(prettifyLocation("hospital" as any)).toBe("Hospital");
        expect(prettifyLocation("museum" as any)).toBe("Museum");
        expect(prettifyLocation("cinema" as any)).toBe("Cinema");
        expect(prettifyLocation("library" as any)).toBe("Library");
        expect(prettifyLocation("golf_course" as any)).toBe("Golf Course");
        expect(prettifyLocation("mcdonalds" as any)).toBe("McDonald's");
        expect(prettifyLocation("seven11" as any)).toBe("7-Eleven");
        expect(prettifyLocation("timhortons" as any)).toBe("Tim Hortons");
        expect(prettifyLocation("pub" as any)).toBe("Pub / Bar");
    });

    it("should prettify specific locations (plural)", () => {
        expect(prettifyLocation("library" as any, true)).toBe("Libraries");
        expect(prettifyLocation("pub" as any, true)).toBe("Pubs / Bars");
    });

    it("should fallback to singular + 's' for other locations (plural)", () => {
        expect(prettifyLocation("hospital" as any, true)).toBe("Hospitals");
        expect(prettifyLocation("cinema" as any, true)).toBe("Cinemas");
        expect(prettifyLocation("mcdonalds" as any, true)).toBe("McDonald'ss");
    });
});

describe("determineName", () => {
    describe("when osm_type is 'R'", () => {
        it("should join name, state, and country when all are present", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "R",
                    name: "Central Park",
                    state: "New York",
                    country: "USA",
                    osm_id: 1,
                    osm_key: "leisure",
                    countrycode: "us",
                    osm_value: "park",
                    type: "park",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe("Central Park, New York, USA");
        });

        it("should filter out undefined properties and join the rest", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "R",
                    name: "Central Park",
                    country: "USA",
                    osm_id: 1,
                    osm_key: "leisure",
                    countrycode: "us",
                    osm_value: "park",
                    type: "park",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe("Central Park, USA");
        });

        it("should handle empty strings correctly", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "R",
                    name: "Central Park",
                    state: "",
                    country: "USA",
                    osm_id: 1,
                    osm_key: "leisure",
                    countrycode: "us",
                    osm_value: "park",
                    type: "park",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe("Central Park, USA");
        });

        it("should return empty string when no fields are present", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "R",
                    osm_id: 1,
                    osm_key: "leisure",
                    countrycode: "us",
                    osm_value: "park",
                    type: "park",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe("");
        });
    });

    describe("when osm_type is not 'R'", () => {
        it("should join housenumber, street, city, county, state, and country when all are present", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "N",
                    housenumber: "123",
                    street: "Main St",
                    city: "Springfield",
                    county: "Shelby",
                    state: "IL",
                    country: "USA",
                    osm_id: 1,
                    osm_key: "amenity",
                    countrycode: "us",
                    osm_value: "cafe",
                    name: "Joe's Cafe",
                    type: "cafe",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe(
                "123 Main St, Springfield, Shelby, IL, USA",
            );
        });

        it("should not include housenumber if it's missing", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "W",
                    street: "Main St",
                    city: "Springfield",
                    state: "IL",
                    country: "USA",
                    osm_id: 1,
                    osm_key: "highway",
                    countrycode: "us",
                    osm_value: "residential",
                    name: "Main St",
                    type: "road",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe(
                "Main St, Springfield, IL, USA",
            );
        });

        it("should format string correctly if housenumber is present but street is missing", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "W",
                    housenumber: "123",
                    city: "Springfield",
                    state: "IL",
                    country: "USA",
                    osm_id: 1,
                    osm_key: "highway",
                    countrycode: "us",
                    osm_value: "residential",
                    name: "Main St",
                    type: "road",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe(
                "123 undefined, Springfield, IL, USA",
            );
        });

        it("should work if housenumber and street are both missing", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "N",
                    city: "Springfield",
                    state: "IL",
                    country: "USA",
                    osm_id: 1,
                    osm_key: "place",
                    countrycode: "us",
                    osm_value: "city",
                    name: "Springfield",
                    type: "city",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe("Springfield, IL, USA");
        });

        it("should handle sparsely populated fields", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "W",
                    city: "Springfield",
                    country: "USA",
                    osm_id: 1,
                    osm_key: "amenity",
                    countrycode: "us",
                    osm_value: "hospital",
                    name: "General Hospital",
                    type: "hospital",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe("Springfield, USA");
        });

        it("should return empty string when no fields are present", () => {
            const feature = {
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: {
                    osm_type: "N",
                    osm_id: 1,
                    osm_key: "amenity",
                    countrycode: "us",
                    osm_value: "bench",
                    name: "",
                    type: "bench",
                },
            } as unknown as OpenStreetMap;

            expect(determineName(feature)).toBe("");
        });
    });
});
