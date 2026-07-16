import { describe, expect, it } from "vitest";

import { checkFilters } from "@/maps/api/places";

describe("checkFilters", () => {
    it("returns true when filtersToMatch is empty", () => {
        const filters: any[] = [];
        const tags = { amenity: "cafe" };
        expect(checkFilters(filters, tags)).toBe(true);
    });

    it("returns false if a requested tag is missing", () => {
        const filters = [{ key: "cuisine", op: "=", val: "coffee_shop" }];
        const tags = { amenity: "cafe" }; // missing 'cuisine'
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns true for exact match (=) when tags match", () => {
        const filters = [{ key: "amenity", op: "=", val: "cafe" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(true);
    });

    it("returns false for exact match (=) when tags do not match", () => {
        const filters = [{ key: "amenity", op: "=", val: "restaurant" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns true for regex match (~) when tags match", () => {
        const filters = [{ key: "name", op: "~", val: "^Star.*" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(true);
    });

    it("returns false for regex match (~) when tags do not match", () => {
        const filters = [{ key: "name", op: "~", val: "^Mc.*" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns false for regex match (~) when regex is invalid", () => {
        // an invalid regex pattern (e.g. unclosed parenthesis) will throw an error in RegExp constructor
        const filters = [{ key: "name", op: "~", val: "^Star(" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns false for unsupported operators", () => {
        const filters = [{ key: "amenity", op: ">", val: "cafe" }];
        const tags = { amenity: "cafe" };
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns true only if all filters match (AND logic)", () => {
        const filters = [
            { key: "amenity", op: "=", val: "cafe" },
            { key: "name", op: "~", val: "Star.*" },
        ];
        const tagsMatch = { amenity: "cafe", name: "Starbucks" };
        const tagsFail = { amenity: "cafe", name: "Tim Hortons" };
        expect(checkFilters(filters, tagsMatch)).toBe(true);
        expect(checkFilters(filters, tagsFail)).toBe(false);
    });
});
