import { describe, it, expect } from "vitest";
import { cn } from "../src/lib/utils";

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
