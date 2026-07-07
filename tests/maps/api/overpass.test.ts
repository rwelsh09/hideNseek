import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import { getOverpassData } from "../../../src/maps/api/overpass";
import { cacheFetch, determineCache } from "../../../src/maps/api/cache";
import {
    OVERPASS_API,
    OVERPASS_API_FALLBACK,
} from "../../../src/maps/api/constants";

vi.mock("../../../src/maps/api/cache", () => ({
    cacheFetch: vi.fn(),
    determineCache: vi.fn(),
}));

vi.mock("react-toastify", () => ({
    toast: {
        error: vi.fn(),
        loading: vi.fn(),
        dismiss: vi.fn(),
        update: vi.fn(),
        isActive: vi.fn().mockReturnValue(false),
    },
}));

describe("getOverpassData", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockQuery = "[out:json];node(1);out;";
    const encodedQuery = encodeURIComponent(mockQuery);
    const primaryUrl = `${OVERPASS_API}?data=${encodedQuery}`;
    const fallbackUrl = `${OVERPASS_API_FALLBACK}?data=${encodedQuery}`;

    it("should return data from primary URL if successful", async () => {
        const mockResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ elements: [{ id: 1 }] }),
        };
        vi.mocked(cacheFetch).mockResolvedValue(mockResponse as any);

        const result = await getOverpassData(mockQuery);

        expect(cacheFetch).toHaveBeenCalledTimes(1);
        expect(cacheFetch).toHaveBeenCalledWith(
            primaryUrl,
            undefined,
            "hide-and-seek-cache",
        );
        expect(result).toEqual({ elements: [{ id: 1 }] });
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("should use fallback URL if primary URL returns !ok and cache the fallback response", async () => {
        const mockPrimaryResponse = {
            ok: false,
            status: 504,
            statusText: "Gateway Timeout",
        };
        const mockFallbackResponse = {
            ok: true,
            json: vi.fn().mockResolvedValue({ elements: [{ id: 2 }] }),
            clone: vi.fn().mockReturnValue("cloned-response"),
        };

        vi.mocked(cacheFetch)
            .mockResolvedValueOnce(mockPrimaryResponse as any)
            .mockResolvedValueOnce(mockFallbackResponse as any);

        const mockCache = {
            put: vi.fn().mockResolvedValue(undefined),
        };
        vi.mocked(determineCache).mockResolvedValue(mockCache as any);

        const result = await getOverpassData(mockQuery);

        expect(cacheFetch).toHaveBeenCalledTimes(2);
        expect(cacheFetch).toHaveBeenNthCalledWith(
            1,
            primaryUrl,
            undefined,
            "hide-and-seek-cache",
        );
        expect(cacheFetch).toHaveBeenNthCalledWith(
            2,
            fallbackUrl,
            undefined,
            "hide-and-seek-cache",
        );

        expect(determineCache).toHaveBeenCalledWith("hide-and-seek-cache");
        expect(mockCache.put).toHaveBeenCalledWith(
            primaryUrl,
            "cloned-response",
        );

        expect(result).toEqual({ elements: [{ id: 2 }] });
        expect(toast.error).not.toHaveBeenCalled();
    });

    it("should return empty elements and show toast error if fallback throws an error", async () => {
        const mockPrimaryResponse = {
            ok: false,
            status: 504,
            statusText: "Gateway Timeout",
        };

        // Needs to mock across the 3 attempts (initial + 2 retries) each doing a primary and fallback check
        vi.mocked(cacheFetch)
            .mockResolvedValueOnce(mockPrimaryResponse as any)
            .mockRejectedValueOnce(new Error("Network failure"))
            .mockResolvedValueOnce(mockPrimaryResponse as any)
            .mockRejectedValueOnce(new Error("Network failure"))
            .mockResolvedValueOnce(mockPrimaryResponse as any)
            .mockRejectedValueOnce(new Error("Network failure"));

        const result = await getOverpassData(mockQuery);

        // 3 attempts * 2 checks (primary + fallback) = 6 calls to cacheFetch
        expect(cacheFetch).toHaveBeenCalledTimes(6);
        expect(toast.error).toHaveBeenCalledWith(
            "Unable to connect to the map server. Please check your internet connection.",
            { toastId: "overpass-error" },
        );
        expect(result).toEqual({ elements: [], _failed: true });
    });

    it("should return empty elements and show toast error if fallback returns !ok", async () => {
        const mockPrimaryResponse = {
            ok: false,
            status: 504,
            statusText: "Gateway Timeout",
        };
        const mockFallbackResponse = {
            ok: false,
            status: 429,
            statusText: "Too Many Requests",
        };

        vi.mocked(cacheFetch)
            .mockResolvedValueOnce(mockPrimaryResponse as any)
            .mockResolvedValueOnce(mockFallbackResponse as any)
            .mockResolvedValueOnce(mockPrimaryResponse as any)
            .mockResolvedValueOnce(mockFallbackResponse as any)
            .mockResolvedValueOnce(mockPrimaryResponse as any)
            .mockResolvedValueOnce(mockFallbackResponse as any);

        const result = await getOverpassData(mockQuery);

        expect(cacheFetch).toHaveBeenCalledTimes(6);
        expect(toast.error).toHaveBeenCalledWith(
            "The server is busy. Try clicking Offline Mode at the bottom of the Options menu.",
            { toastId: "overpass-error" },
        );
        expect(result).toEqual({ elements: [], _failed: true });
    });
});
