import { describe, it, expect } from "vitest";
import { z } from "zod";
import { getSchemaOptions } from "../../src/maps/schema";

describe("getSchemaOptions", () => {
    it("should extract options from a simple union of literals", () => {
        const schema = z.union([z.literal("a"), z.literal("b")]);
        expect(getSchemaOptions(schema)).toEqual({
            a: "a",
            b: "b"
        });
    });

    it("should use the description if provided on literals", () => {
        const schema = z.union([
            z.literal("a").describe("Letter A"),
            z.literal("b").describe("Letter B")
        ]);
        expect(getSchemaOptions(schema)).toEqual({
            a: "Letter A",
            b: "Letter B"
        });
    });

    it("should handle nested unions", () => {
        const schema = z.union([
            z.union([z.literal("a"), z.literal("b")]),
            z.literal("c")
        ]);
        expect(getSchemaOptions(schema)).toEqual({
            a: "a",
            b: "b",
            c: "c"
        });
    });

    it("should handle ZodDefault", () => {
        const schema = z.union([
            z.literal("a"),
            z.literal("b")
        ]).default("a");
        expect(getSchemaOptions(schema)).toEqual({
            a: "a",
            b: "b"
        });
    });
});
