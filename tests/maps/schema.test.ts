import { describe, expect, test } from "vitest";
import { z } from "zod";

import {
    getSchemaOptions,
    closestQuestionSchema,
    matchQuestionSchema,
    measureQuestionSchema,
    questionSchema,
    questionsSchema,
} from "../../src/maps/schema";

describe("schema", () => {
    describe("getSchemaOptions", () => {
        test("should extract options from z.union of literals", () => {
            const schema = z.union([z.literal("a"), z.literal("b")]);
            expect(getSchemaOptions(schema)).toEqual({
                a: "a",
                b: "b",
            });
        });

        test("should extract options with description", () => {
            const schema = z.union([
                z.literal("a").describe("Option A"),
                z.literal("b").describe("Option B"),
            ]);
            expect(getSchemaOptions(schema)).toEqual({
                a: "Option A",
                b: "Option B",
            });
        });

        test("should extract options from z.literal", () => {
            const schema = z.literal("a").describe("Option A");
            expect(getSchemaOptions(schema)).toEqual({
                a: "Option A",
            });
        });

        test("should extract options from z.default", () => {
            const schema = z.union([
                z.literal("a").describe("Option A"),
                z.literal("b").describe("Option B"),
            ]).default("a");
            expect(getSchemaOptions(schema)).toEqual({
                a: "Option A",
                b: "Option B",
            });
        });

        test("should extract options from z.effects", () => {
            const schema = z.union([
                z.literal("a").describe("Option A"),
                z.literal("b").describe("Option B"),
            ]).refine((val) => val === "a");
            expect(getSchemaOptions(schema)).toEqual({
                a: "Option A",
                b: "Option B",
            });
        });

        test("should return empty object for unsupported schemas", () => {
            const schema = z.string();
            // Zod doesn't export ZodEffects to instance of properly in this environment.
            // Using a plain object to pass typescript tests for invalid schema.
            // @ts-expect-error Testing invalid input
            expect(getSchemaOptions(schema as any)).toEqual({});
        });
    });

    describe("closestQuestionSchema", () => {
        test("should parse valid input", () => {
            const result = closestQuestionSchema.safeParse({
                lat: 51,
                lng: -114,
                locationType: "mcdonalds",
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.radius).toBe(2);
                expect(result.data.unit).toBe("kilometers");
                expect(result.data.colour).toBe("violet");
                expect(result.data.location).toBe(false);
                expect(result.data.locked).toBe(false);
                expect(result.data.doubledPenalty).toBe(false);
            }
        });

        test("should reject invalid locationType", () => {
            const result = closestQuestionSchema.safeParse({
                lat: 51,
                lng: -114,
                locationType: "invalid",
            });
            expect(result.success).toBe(false);
        });

        test("should parse valid input with location Feature", () => {
            const result = closestQuestionSchema.safeParse({
                lat: 51,
                lng: -114,
                locationType: "mcdonalds",
                location: {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [-114, 51],
                    },
                    properties: {
                        name: "McDonald's",
                    },
                },
            });
            expect(result.success).toBe(true);
        });
    });

    describe("matchQuestionSchema", () => {
        test("should parse valid input with default values", () => {
            const result = matchQuestionSchema.safeParse({
                lat: 51,
                lng: -114,
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.type).toBe("museum");
                expect(result.data.same).toBe(true);
                expect(result.data.colour).toBe("red");
            }
        });

        test("should parse valid input with specified type", () => {
            const result = matchQuestionSchema.safeParse({
                lat: 51,
                lng: -114,
                type: "same-first-letter-station",
                same: false,
                lengthComparison: "longer",
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.type).toBe("same-first-letter-station");
                expect(result.data.same).toBe(false);
                expect(result.data.lengthComparison).toBe("longer");
            }
        });
    });

    describe("measureQuestionSchema", () => {
        test("should parse valid input with default values", () => {
            const result = measureQuestionSchema.safeParse({
                lat: 51,
                lng: -114,
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.type).toBe("museum");
                expect(result.data.hiderCloser).toBe(true);
                expect(result.data.colour).toBe("green");
            }
        });

        test("should parse valid input with specified type", () => {
            const result = measureQuestionSchema.safeParse({
                lat: 51,
                lng: -114,
                type: "rail-measure",
                hiderCloser: false,
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.type).toBe("rail-measure");
                expect(result.data.hiderCloser).toBe(false);
            }
        });
    });

    describe("questionSchema", () => {
        test("should parse photo question", () => {
            const result = questionSchema.safeParse({
                id: "photo",
                data: {
                    lat: 51,
                    lng: -114,
                },
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.id).toBe("photo");
                expect(result.data.data.notes).toBe("");
                expect(result.data.data.type).toBe("camera");
                expect(result.data.data.colour).toBe("blue");
            }
        });

        test("should parse radar question", () => {
            const result = questionSchema.safeParse({
                id: "radar",
                data: {
                    lat: 51,
                    lng: -114,
                },
            });
            expect(result.success).toBe(true);
            if (result.success && result.data.id === "radar") {
                expect(result.data.data.radius).toBe(50);
                expect(result.data.data.isCustom).toBe(false);
                expect(result.data.data.within).toBe(true);
                expect(result.data.data.colour).toBe("orange");
            }
        });

        test("should parse hot/cold question", () => {
            const result = questionSchema.safeParse({
                id: "hot/cold",
                data: {
                    latA: 51,
                    lngA: -114,
                    latB: 51.1,
                    lngB: -114.1,
                },
            });
            expect(result.success).toBe(true);
            if (result.success && result.data.id === "hot/cold") {
                expect(result.data.data.warmer).toBe(true);
                expect(result.data.data.colourA).toBe("blue");
                expect(result.data.data.colourB).toBe("red");
            }
        });

        test("should enforce latitude constraints", () => {
            const result = questionSchema.safeParse({
                id: "radar",
                data: {
                    lat: 100, // Invalid latitude
                    lng: -114,
                },
            });
            expect(result.success).toBe(false);
        });

        test("should enforce longitude constraints", () => {
            const result = questionSchema.safeParse({
                id: "radar",
                data: {
                    lat: 51,
                    lng: 200, // Invalid longitude
                },
            });
            expect(result.success).toBe(false);
        });

        test("should enforce hot/cold bounds", () => {
            const result = questionSchema.safeParse({
                id: "hot/cold",
                data: {
                    latA: 100, // Invalid
                    lngA: -114,
                    latB: 51.1,
                    lngB: -114.1,
                },
            });
            expect(result.success).toBe(false);
        });
    });

    describe("questionsSchema", () => {
        test("should parse array of valid questions", () => {
            const result = questionsSchema.safeParse([
                {
                    id: "photo",
                    data: {
                        lat: 51,
                        lng: -114,
                    },
                },
                {
                    id: "measure",
                    data: {
                        lat: 51,
                        lng: -114,
                    },
                },
            ]);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.length).toBe(2);
            }
        });

        test("should reject array with invalid questions", () => {
            const result = questionsSchema.safeParse([
                {
                    id: "photo",
                    data: {
                        lat: 51,
                        lng: -114,
                    },
                },
                {
                    id: "invalid_id",
                    data: {
                        lat: 51,
                        lng: -114,
                    },
                },
            ]);
            expect(result.success).toBe(false);
        });
    });
});
