import { cn, mapToObj, compress, decompress, shareOrFallback, encodeDisabledStations, decodeDisabledStations, STATION_IDS_INDEX } from "../src/lib/utils";
import { expect, describe, test, vi, afterEach } from "vitest";

describe("utils", () => {
    test("cn", () => {
        expect(cn("a", "b")).toBe("a b");
        expect(cn("a", undefined, "b", null)).toBe("a b");
    });

    test("mapToObj", () => {
        const arr = ["a", "b"];
        const fn = (item: string) => [item, item.toUpperCase()] as [string, string];
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
            const testStations = [STATION_IDS_INDEX[0], STATION_IDS_INDEX[10], STATION_IDS_INDEX[50], STATION_IDS_INDEX[115]];
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
});
