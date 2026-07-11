import { describe, expect,it } from "vitest";

import { cn, mapToObj } from "@/lib/utils";

describe("cn", () => {
    it("merges basic classes", () => {
        expect(cn("a", "b", "c")).toBe("a b c");
    });

    it("handles conditional classes", () => {
        expect(cn("a", { b: true, c: false })).toBe("a b");
    });

    it("resolves tailwind class conflicts", () => {
        expect(cn("px-2 py-1", "p-4")).toBe("p-4");
        expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    });

    it("handles arrays and falsy values", () => {
        expect(cn(["a", "b"], null, undefined, "c", false, "")).toBe("a b c");
    });

    it("handles nested arrays", () => {
        expect(cn(["a", ["b", "c"]])).toBe("a b c");
    });
});

describe("mapToObj", () => {
    it("returns an empty object for an empty array", () => {
        expect(mapToObj([], (item) => [String(item), item])).toEqual({});
    });

    it("maps an array of primitives correctly", () => {
        const arr = ["a", "b", "c"];
        expect(mapToObj(arr, (item) => [item, item.toUpperCase()])).toEqual({
            a: "A",
            b: "B",
            c: "C",
        });
    });

    it("maps an array of objects correctly", () => {
        const arr = [
            { id: "1", name: "Alice" },
            { id: "2", name: "Bob" },
        ];
        expect(mapToObj(arr, (item) => [item.id, item.name])).toEqual({
            "1": "Alice",
            "2": "Bob",
        });
    });

    it("overwrites duplicate keys with the last mapped value", () => {
        const arr = [
            { id: "1", name: "Alice" },
            { id: "1", name: "Alice Updated" },
        ];
        expect(mapToObj(arr, (item) => [item.id, item.name])).toEqual({
            "1": "Alice Updated",
        });
    });
});
