import { describe, it, expect, vi, beforeEach } from "vitest";
import { geocode } from "../../src/maps/api/geocode";
import { GEOCODER_API } from "../../src/maps/api/constants";

describe("geocode", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("should fetch data, convert coordinates, map extent and filter by osm_type R by default", async () => {
        const mockResponse = {
            features: [
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-114.0708, 51.0447] },
                    properties: {
                        osm_type: "R",
                        osm_id: 1,
                        name: "Calgary",
                        extent: [1, 2, 3, 4]
                    }
                },
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-113.0, 52.0] },
                    properties: {
                        osm_type: "N",
                        osm_id: 2,
                        name: "Calgary Something",
                        extent: [1, 2, 3, 4]
                    }
                },
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-114.0708, 51.0447] },
                    properties: {
                        osm_type: "R",
                        osm_id: 1,
                        name: "Calgary Duplicate",
                        extent: [5, 6, 7, 8]
                    }
                }
            ]
        };

        const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

        const result = await geocode("Calgary", "en");

        expect(fetchSpy).toHaveBeenCalledWith(`${GEOCODER_API}?lang=en&q=Calgary`);

        // It should filter by osm_type R (removing N), and be unique by osm_id (removing duplicate id 1)
        expect(result.length).toBe(1);

        expect(result[0].properties.osm_id).toBe(1);
        expect(result[0].geometry.coordinates).toEqual([51.0447, -114.0708]);

        // Original extent: [1, 2, 3, 4]
        // Mapped to: [extent[1], extent[0], extent[3], extent[2]] => [2, 1, 4, 3]
        expect(result[0].properties.extent).toEqual([2, 1, 4, 3]);
    });

    it("should handle missing extent property", async () => {
        const mockResponse = {
            features: [
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-114.0708, 51.0447] },
                    properties: {
                        osm_type: "R",
                        osm_id: 1,
                        name: "Calgary"
                    }
                }
            ]
        };

        vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

        const result = await geocode("Calgary", "en");
        expect(result.length).toBe(1);
        expect(result[0].properties.extent).toBeUndefined();
    });

    it("should allow turning off filtering by osm_type R", async () => {
        const mockResponse = {
            features: [
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-114.0, 51.0] },
                    properties: { osm_type: "R", osm_id: 1, name: "Calgary" }
                },
                {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: [-113.0, 52.0] },
                    properties: { osm_type: "N", osm_id: 2, name: "Calgary Node" }
                }
            ]
        };

        vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

        const result = await geocode("Calgary", "en", false);
        expect(result.length).toBe(2);
        expect(result[0].properties.osm_id).toBe(1);
        expect(result[1].properties.osm_id).toBe(2);
    });
});
