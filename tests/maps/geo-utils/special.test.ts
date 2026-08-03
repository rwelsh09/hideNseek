import { describe, expect, it } from "vitest";

import {
    extractStationId,
    extractStationLabel,
    extractStationLines,
    extractStationName,
    getFeatureProperties,
    lngLatToText,
} from "@/maps/geo-utils/special";

describe("geo-utils/special", () => {
    describe("lngLatToText", () => {
        it("formats northern and eastern coordinates correctly", () => {
            expect(lngLatToText([114.0719, 51.0447])).toBe(
                "51.0447°N, 114.0719°E",
            );
        });
        it("formats southern and western coordinates correctly", () => {
            expect(lngLatToText([-114.0719, -51.0447])).toBe(
                "51.0447°S, 114.0719°W",
            );
        });
        it("formats zero coordinates correctly", () => {
            expect(lngLatToText([0, 0])).toBe("0°N, 0°E");
        });
    });

    describe("getFeatureProperties", () => {
        it("returns empty object for falsy input", () => {
            expect(getFeatureProperties(null)).toEqual({});
            expect(getFeatureProperties(undefined)).toEqual({});
        });

        it("returns tags if properties.tags exists", () => {
            const feature = {
                properties: { tags: { foo: "bar" }, other: "ignored" },
            };
            expect(getFeatureProperties(feature)).toEqual({ foo: "bar" });
        });

        it("merges properties and properties.properties if properties.properties exists", () => {
            const feature = {
                properties: { properties: { inner: "val1" }, outer: "val2" },
            };
            expect(getFeatureProperties(feature)).toEqual({
                inner: "val1",
                outer: "val2",
                properties: { inner: "val1" },
            });
        });

        it("returns properties if no nested structures exist", () => {
            const feature = { properties: { foo: "bar" } };
            expect(getFeatureProperties(feature)).toEqual({ foo: "bar" });
        });

        it("returns feature itself if no properties field exists", () => {
            const feature = { foo: "bar" };
            expect(getFeatureProperties(feature)).toEqual({ foo: "bar" });
        });
    });

    describe("extractStationName", () => {
        it("returns name:en if available", () => {
            expect(
                extractStationName({
                    properties: { "name:en": "English Name", name: "Local Name" },
                }),
            ).toBe("English Name");
        });

        it("falls back to name if name:en is missing", () => {
            expect(
                extractStationName({ properties: { name: "Local Name" } }),
            ).toBe("Local Name");
        });

        it("returns undefined if neither name exists", () => {
            expect(extractStationName({ properties: { foo: "bar" } })).toBeUndefined();
        });
    });

    describe("extractStationLabel", () => {
        it("returns station name if available", () => {
            const feature = {
                properties: { name: "Station A" },
                geometry: { coordinates: [10, 20] },
            };
            expect(extractStationLabel(feature)).toBe("Station A");
        });

        it("falls back to formatted coordinates if name is missing", () => {
            const feature = {
                properties: {},
                geometry: { coordinates: [-114.0, 51.0] },
            };
            expect(extractStationLabel(feature)).toBe("51°N, 114°W");
        });
    });

    describe("extractStationLines", () => {
        it("returns lines array if it exists", () => {
            expect(
                extractStationLines({ properties: { lines: ["Red", "Blue"] } }),
            ).toEqual(["Red", "Blue"]);
        });

        it("splits route_ref by comma and semicolon, trimming whitespace", () => {
            expect(
                extractStationLines({
                    properties: { route_ref: "Red; Blue, Green ; Yellow" },
                }),
            ).toEqual(["Red", "Blue", "Green", "Yellow"]);
        });

        it("falls back to ref if route_ref is missing", () => {
            expect(
                extractStationLines({
                    properties: { ref: "Line 1, Line 2" },
                }),
            ).toEqual(["Line 1", "Line 2"]);
        });

        it("returns empty array if no line info exists", () => {
            expect(extractStationLines({ properties: {} })).toEqual([]);
        });
    });

    describe("extractStationId", () => {
        it("returns explicit @id", () => {
            expect(extractStationId({ properties: { "@id": "node/123" } })).toBe(
                "node/123",
            );
        });

        it("returns explicit id from properties", () => {
            expect(extractStationId({ properties: { id: "station_456" } })).toBe(
                "station_456",
            );
        });

        it("returns explicit id from feature root", () => {
            expect(extractStationId({ id: "station_789", properties: {} })).toBe(
                "station_789",
            );
        });

        it("derives id from geometry coordinates", () => {
            const feature = {
                geometry: { coordinates: [-114.07, 51.04] },
                properties: {},
            };
            expect(extractStationId(feature)).toBe("51.04,-114.07");
        });

        it("derives id from nested geometry coordinates (Turf circle enclosing Point)", () => {
            const feature = {
                properties: { geometry: { coordinates: [-100.5, 45.2] } },
            };
            expect(extractStationId(feature)).toBe("45.2,-100.5");
        });

        it("returns undefined if no id or valid coordinates can be found", () => {
            expect(extractStationId({ properties: {} })).toBeUndefined();
            expect(
                extractStationId({
                    properties: { geometry: { coordinates: ["invalid", "coords"] } },
                }),
            ).toBeUndefined();
        });
    });
});
