import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { cacheFetch } from "../../../src/maps/api/cache";

describe("cacheFetch", () => {
    let originalFetch: typeof globalThis.fetch;
    let originalCaches: typeof globalThis.caches;

    beforeEach(() => {
        originalFetch = globalThis.fetch;
        originalCaches = globalThis.caches;

        // Mock fetch
        globalThis.fetch = vi.fn().mockResolvedValue(new Response("ok"));
    });

    afterEach(() => {
        globalThis.fetch = originalFetch;
        globalThis.caches = originalCaches;
        vi.restoreAllMocks();
    });

    describe("error path", () => {
        it("should fallback to raw fetch if an error occurs (e.g. determineCache throws)", async () => {
            // Force determineCache to throw by making caches.open throw
            globalThis.caches = {
                open: vi.fn().mockRejectedValue(new Error("Caches not supported")),
                match: vi.fn(),
                delete: vi.fn(),
                keys: vi.fn(),
                put: vi.fn()
            } as any;

            const url = "http://example.com/test";
            await cacheFetch(url);

            expect(globalThis.fetch).toHaveBeenCalledTimes(1);
            expect(globalThis.fetch).toHaveBeenCalledWith(url);
        });
    });
});
