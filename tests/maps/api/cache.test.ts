import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { toast } from "react-toastify";
import { determineCache, cacheFetch, clearCache } from "@/maps/api/cache";
import { CacheType } from "@/maps/api/types";

vi.mock("lodash", () => ({
    default: {
        memoize: (fn: any) => fn,
    },
}));

vi.mock("react-toastify", () => ({
    toast: {
        loading: vi.fn(),
        dismiss: vi.fn(),
    },
}));

describe("cache.ts", () => {
    let mockCache: {
        match: ReturnType<typeof vi.fn>;
        put: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        keys: ReturnType<typeof vi.fn>;
    };

    let mockCaches: {
        open: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockCache = {
            match: vi.fn(),
            put: vi.fn(),
            delete: vi.fn(),
            keys: vi.fn(),
        };

        mockCaches = {
            open: vi.fn().mockResolvedValue(mockCache as unknown as Cache),
        };

        vi.stubGlobal("caches", mockCaches);
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    describe("determineCache", () => {
        it("should return the default CACHE when requested", async () => {
            const cache = await determineCache(CacheType.CACHE);
            expect(mockCaches.open).toHaveBeenCalledWith(CacheType.CACHE);
            expect(cache).toBe(mockCache);
        });

        it("should return ZONE_CACHE when requested", async () => {
            const cache = await determineCache(CacheType.ZONE_CACHE);
            expect(mockCaches.open).toHaveBeenCalledWith(CacheType.ZONE_CACHE);
            expect(cache).toBe(mockCache);
        });

        it("should return PERMANENT_CACHE when requested", async () => {
            const cache = await determineCache(CacheType.PERMANENT_CACHE);
            expect(mockCaches.open).toHaveBeenCalledWith(
                CacheType.PERMANENT_CACHE,
            );
            expect(cache).toBe(mockCache);
        });
    });

    describe("cacheFetch", () => {
        const url = "https://example.com/api";

        it("should return cached response if it exists and is ok", async () => {
            const cachedResponse = {
                ok: true,
                clone: vi.fn().mockReturnValue("cloned-response"),
            };
            mockCache.match.mockResolvedValue(cachedResponse);

            const result = await cacheFetch(url);

            expect(mockCache.match).toHaveBeenCalledWith(url);
            expect(cachedResponse.clone).toHaveBeenCalled();
            expect(result).toBe("cloned-response");
            expect(globalThis.fetch).not.toHaveBeenCalled();
        });

        it("should delete cached response if it exists but is not ok, then fetch", async () => {
            const cachedResponse = {
                ok: false,
            };
            mockCache.match.mockResolvedValue(cachedResponse);

            const fetchResponse = {
                ok: true,
                clone: vi.fn().mockReturnValue("new-cloned-response"),
            };
            vi.mocked(globalThis.fetch).mockResolvedValue(
                fetchResponse as unknown as Response,
            );

            const result = await cacheFetch(url);

            expect(mockCache.match).toHaveBeenCalledWith(url);
            expect(mockCache.delete).toHaveBeenCalledWith(url);
            expect(globalThis.fetch).toHaveBeenCalledWith(url);
            expect(mockCache.put).toHaveBeenCalledWith(
                url,
                "new-cloned-response",
            );
            expect(result).toBe("new-cloned-response");
        });

        it("should fetch and cache a successful response if not cached", async () => {
            mockCache.match.mockResolvedValue(undefined);

            const fetchResponse = {
                ok: true,
                clone: vi.fn().mockReturnValue("new-cloned-response"),
            };
            vi.mocked(globalThis.fetch).mockResolvedValue(
                fetchResponse as unknown as Response,
            );

            const result = await cacheFetch(url);

            expect(mockCache.match).toHaveBeenCalledWith(url);
            expect(globalThis.fetch).toHaveBeenCalledWith(url);
            expect(mockCache.put).toHaveBeenCalledWith(
                url,
                "new-cloned-response",
            );
            expect(result).toBe("new-cloned-response");
        });

        it("should fetch and delete from cache if the newly fetched response is not ok", async () => {
            mockCache.match.mockResolvedValue(undefined);

            const fetchResponse = {
                ok: false,
                clone: vi.fn().mockReturnValue("failed-cloned-response"),
            };
            vi.mocked(globalThis.fetch).mockResolvedValue(
                fetchResponse as unknown as Response,
            );

            const result = await cacheFetch(url);

            expect(globalThis.fetch).toHaveBeenCalledWith(url);
            expect(mockCache.put).not.toHaveBeenCalled();
            expect(mockCache.delete).toHaveBeenCalledWith(url);
            expect(result).toBe("failed-cloned-response");
        });

        it("should display and dismiss a toast if loadingText is provided", async () => {
            mockCache.match.mockResolvedValue(undefined);

            const fetchResponse = {
                ok: true,
                clone: vi.fn().mockReturnValue("response"),
            };
            vi.mocked(globalThis.fetch).mockResolvedValue(
                fetchResponse as unknown as Response,
            );

            vi.mocked(toast.loading).mockReturnValue("toast-id");

            await cacheFetch(url, "Loading...");

            expect(toast.loading).toHaveBeenCalledWith("Loading...");
            expect(toast.dismiss).toHaveBeenCalledWith("toast-id");
        });

        it("should deduplicate concurrent requests for the same URL and cache type", async () => {
            mockCache.match.mockResolvedValue(undefined);

            let resolveFetch: (value: any) => void;
            const fetchPromise = new Promise((resolve) => {
                resolveFetch = resolve;
            });

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            vi.mocked(globalThis.fetch).mockImplementation(() => fetchPromise as Promise<Response>);

            // Start first fetch
            const fetch1 = cacheFetch(url);

            // Start second fetch synchronously
            const fetch2 = cacheFetch(url);

            // Now resolve the fetch
            const fetchResponse = {
                ok: true,
                clone: vi.fn().mockReturnValue("shared-response"),
            };
            resolveFetch!(fetchResponse);

            const [res1, res2] = await Promise.all([fetch1, fetch2]);

            // Fetch should only be called once
            expect(globalThis.fetch).toHaveBeenCalledTimes(1);
            expect(res1).toBe("shared-response");
            expect(res2).toBe("shared-response");
            expect(fetchResponse.clone).toHaveBeenCalledTimes(3); // 1 for cache.put, 2 for returning to callers
        });

        it("should fallback to direct fetch if an error occurs in caching logic", async () => {
            // Force determineCache to throw an error
            mockCaches.open.mockRejectedValue(new Error("Caches not supported"));

            const fallbackResponse = {
                ok: true,
                clone: vi.fn().mockReturnValue("fallback"),
            };
            vi.mocked(globalThis.fetch).mockResolvedValue(
                fallbackResponse as unknown as Response,
            );

            const result = await cacheFetch(url);

            expect(globalThis.fetch).toHaveBeenCalledWith(url);
            expect(result).toBe(fallbackResponse as unknown as Response);
        });
    });

    describe("clearCache", () => {
        it("should fetch all keys from the cache and call delete on each", async () => {
            const keys = ["url1", "url2"];
            mockCache.keys.mockResolvedValue(keys);

            await clearCache(CacheType.CACHE);

            expect(mockCaches.open).toHaveBeenCalledWith(CacheType.CACHE);
            expect(mockCache.keys).toHaveBeenCalled();
            expect(mockCache.delete).toHaveBeenCalledWith("url1");
            expect(mockCache.delete).toHaveBeenCalledWith("url2");
            expect(mockCache.delete).toHaveBeenCalledTimes(2);
        });

        it("should silently ignore errors", async () => {
            mockCaches.open.mockRejectedValue(new Error("Caches not supported"));

            // This should not throw
            await expect(clearCache(CacheType.CACHE)).resolves.not.toThrow();
        });
    });
});
