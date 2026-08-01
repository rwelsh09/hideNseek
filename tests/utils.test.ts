import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
    cn,
    compress,
    decodeBase64Unicode,
    decodeDisabledStations,
    decompress,
    encodeBase64Unicode,
    encodeDisabledStations,
    mapToObj,
    shareOrFallback,
    STATION_IDS_INDEX,
} from "@/lib/utils";

describe("utils", () => {
    describe("cn", () => {
        test("merges strings", () => {
            expect(cn("a", "b")).toBe("a b");
            expect(cn("a", undefined, "b", null)).toBe("a b");
        });

        test("handles conditional objects", () => {
            expect(cn({ a: true, b: false, c: true })).toBe("a c");
        });

        test("handles arrays", () => {
            expect(cn(["a", "b"])).toBe("a b");
            expect(cn(["a", { b: true, c: false }])).toBe("a b");
        });

        test("merges tailwind classes", () => {
            expect(cn("p-4 p-2")).toBe("p-2");
            expect(cn("p-4", "p-2")).toBe("p-2");
            expect(cn("px-4 py-2", "p-2")).toBe("p-2");
            expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
            expect(cn("text-sm", "text-lg")).toBe("text-lg");
            expect(cn("hover:bg-red-500", "hover:bg-blue-500")).toBe(
                "hover:bg-blue-500",
            );
        });

        test("handles complex merges with tailwind classes", () => {
            expect(
                cn("p-4 bg-red-500", { "p-2": true, "bg-blue-500": false }),
            ).toBe("bg-red-500 p-2");
            expect(
                cn(["p-4", "bg-red-500"], { "p-2": true, "bg-blue-500": true }),
            ).toBe("p-2 bg-blue-500");
        });
    });

    test("mapToObj", () => {
        const arr = ["a", "b"];
        const fn = (item: string) =>
            [item, item.toUpperCase()] as [string, string];
        const obj = mapToObj(arr, fn);
        expect(obj).toEqual({ a: "A", b: "B" });
    });

    test("compress/decompress", async () => {
        const str = "hello world";
        const compressed = await compress(str);
        expect(compressed).not.toBe(str);
        const decompressed = await decompress(compressed);
        expect(decompressed).toBe(str);
    });

    describe("encodeDisabledStations / decodeDisabledStations", () => {
        test("should encode and decode disabled stations successfully", () => {
            const testStations = [
                STATION_IDS_INDEX[0],
                STATION_IDS_INDEX[10],
                STATION_IDS_INDEX[50],
                STATION_IDS_INDEX[115],
            ];
            const encoded = encodeDisabledStations(testStations);
            const decoded = decodeDisabledStations(encoded);
            expect(decoded).toEqual(testStations.sort());
        });

        test("should handle empty stations array", () => {
            const encoded = encodeDisabledStations([]);
            expect(encoded).toBe("0");
            const decoded = decodeDisabledStations(encoded);
            expect(decoded).toEqual([]);
        });

        test("should ignore unknown stations", () => {
            const testStations = [STATION_IDS_INDEX[10], "unknown_station_123"];
            const encoded = encodeDisabledStations(testStations);
            const decoded = decodeDisabledStations(encoded);
            expect(decoded).toEqual([STATION_IDS_INDEX[10]]);
        });

        test("should return empty array for invalid base64 string", () => {
            const decoded = decodeDisabledStations("invalid!!!base64");
            expect(decoded).toEqual([]);
        });
    });

    describe("Base64 Unicode Encoding", () => {
        test("should encode and decode standard text", () => {
            const original = "Hello World!";
            const encoded = encodeBase64Unicode(original);
            expect(encoded).not.toBe(original);
            const decoded = decodeBase64Unicode(encoded);
            expect(decoded).toBe(original);
        });

        test("should encode and decode emojis and unicode characters", () => {
            const original = "Hello 🌍! 🚀 Café ñ";
            const encoded = encodeBase64Unicode(original);
            expect(encoded).not.toBe(original);
            const decoded = decodeBase64Unicode(encoded);
            expect(decoded).toBe(original);
        });
    });

    describe("shareOrFallback", () => {
        let originalShare: any;
        let originalClipboard: any;

        beforeEach(() => {
            originalShare = navigator.share;
            originalClipboard = navigator.clipboard;
        });

        afterEach(() => {
            Object.defineProperty(navigator, "share", {
                value: originalShare,
                writable: true,
                configurable: true,
            });
            Object.defineProperty(navigator, "clipboard", {
                value: originalClipboard,
                writable: true,
                configurable: true,
            });
            vi.restoreAllMocks();
        });

        test("should use native share if available and user doesn't force clipboard", async () => {
            const shareMock = vi.fn().mockResolvedValue(undefined);
            Object.defineProperty(navigator, "share", {
                value: shareMock,
                writable: true,
                configurable: true,
            });

            const result = await shareOrFallback({
                url: "https://example.com",
                title: "Test",
            });

            expect(shareMock).toHaveBeenCalledWith({
                url: "https://example.com",
                title: "Test",
            });
            expect(result).toBe(true);
        });

        test("should fallback to clipboard if share rejects", async () => {
            const shareMock = vi
                .fn()
                .mockRejectedValue(new Error("Share failed"));
            Object.defineProperty(navigator, "share", {
                value: shareMock,
                writable: true,
                configurable: true,
            });

            Object.defineProperty(navigator, "clipboard", {
                value: { writeText: vi.fn() },
                writable: true,
                configurable: true,
            });

            const result = await shareOrFallback("https://example.com");

            expect(shareMock).toHaveBeenCalled();
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                "https://example.com",
            );
            expect(result).toBe("clipboard");
        });

        test("should use clipboard directly if share is not supported", async () => {
            Object.defineProperty(navigator, "share", {
                value: undefined,
                writable: true,
                configurable: true,
            });
            Object.defineProperty(navigator, "clipboard", {
                value: { writeText: vi.fn() },
                writable: true,
                configurable: true,
            });

            const result = await shareOrFallback("https://example.com");

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                "https://example.com",
            );
            expect(result).toBe("clipboard");
        });

        test("should force clipboard when forced", async () => {
            const shareMock = vi.fn();
            Object.defineProperty(navigator, "share", {
                value: shareMock,
                writable: true,
                configurable: true,
            });

            Object.defineProperty(navigator, "clipboard", {
                value: { writeText: vi.fn() },
                writable: true,
                configurable: true,
            });

            const result = await shareOrFallback("https://example.com", true);

            expect(shareMock).not.toHaveBeenCalled();
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                "https://example.com",
            );
            expect(result).toBe("clipboard");
        });

        test("should return false if neither share nor clipboard is supported", async () => {
            Object.defineProperty(navigator, "share", {
                value: undefined,
                writable: true,
                configurable: true,
            });
            Object.defineProperty(navigator, "clipboard", {
                value: undefined,
                writable: true,
                configurable: true,
            });

            const result = await shareOrFallback("https://example.com");

            expect(result).toBe(false);
        });

        test("should format clipboard content with text and url if provided", async () => {
            Object.defineProperty(navigator, "share", {
                value: undefined,
                writable: true,
                configurable: true,
            });
            Object.defineProperty(navigator, "clipboard", {
                value: { writeText: vi.fn() },
                writable: true,
                configurable: true,
            });

            await shareOrFallback({
                url: "https://test.com",
                text: "Look at this",
            });

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
                "Look at this\nhttps://test.com",
            );
        });
    });
});
