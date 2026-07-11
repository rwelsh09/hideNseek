import { afterEach,beforeEach, describe, expect, it, vi } from "vitest";

import { GEOCODER_API } from "@/maps/api/constants";
import { geocode } from "@/maps/api/geocode";

describe("geocode", () => {
    beforeEach(() => {
        vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("fetches and parses geocode data correctly", async () => {
        const mockFeatures = [
            {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [100.0, 50.0], // [lng, lat]
                },
                properties: {
                    osm_type: "R",
                    osm_id: "123",
                    extent: [1, 2, 3, 4],
                },
            },
            {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [101.0, 51.0],
                },
                properties: {
                    osm_type: "W",
                    osm_id: "456",
                },
            },
        ];

        vi.mocked(fetch).mockResolvedValueOnce({
            json: async () => ({ features: mockFeatures }),
        } as unknown as Response);

        const result = await geocode("calgary", "en", true);

        expect(fetch).toHaveBeenCalledWith(`${GEOCODER_API}?lang=en&q=calgary`);

        // Check if filter worked (only osm_type === "R" should be kept)
        expect(result.length).toBe(1);

        // Coordinates should be inverted to [lat, lng]
        expect(result[0].geometry.coordinates).toEqual([50.0, 100.0]);

        // Extent should be rearranged
        expect(result[0].properties.extent).toEqual([2, 1, 4, 3]);
    });

    it("throws an error if fetch fails", async () => {
        vi.mocked(fetch).mockRejectedValueOnce(new Error("Network Error"));

        await expect(geocode("calgary", "en")).rejects.toThrow("Network Error");
    });

    it("throws an error if response is not valid JSON", async () => {
        vi.mocked(fetch).mockResolvedValueOnce({
            json: async () => {
                throw new Error("Invalid JSON");
            },
        } as unknown as Response);

        await expect(geocode("calgary", "en")).rejects.toThrow("Invalid JSON");
    });
});
