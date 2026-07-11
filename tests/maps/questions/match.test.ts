import * as turf from "@turf/turf";
import osmtogeojson from "osmtogeojson";
import { toast } from "react-toastify";
import { beforeEach,describe, expect, it, vi } from "vitest";

import { findPlacesInZone } from "@/maps/api";
import { determineMatchBoundary,findMatchPlaces } from "@/maps/questions/match";

vi.mock("@/maps/api", async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...(actual as any),
        findPlacesInZone: vi.fn(),
    };
});

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn() },
}));

vi.mock("osmtogeojson");

describe("Match Questions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("findMatchPlaces", () => {
        it("returns mapped points for valid places", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({
                elements: [
                    { lat: 51.0, lon: -114.0 },
                    { center: { lat: 51.1, lon: -114.1 } }
                ]
            });
            const result = await findMatchPlaces({ type: "museum" } as any);
            expect(result.features).toHaveLength(2);
            expect(result.features[0].geometry.coordinates).toEqual([-114.0, 51.0]);
            expect(result.features[1].geometry.coordinates).toEqual([-114.1, 51.1]);
        });

        it("returns empty FeatureCollection and toasts error if too many elements are found", async () => {
            vi.mocked(findPlacesInZone).mockResolvedValueOnce({ elements: new Array(5000).fill({}) });
            const result = await findMatchPlaces({ type: "museum" } as any);
            expect(result.features).toEqual([]);
            expect(toast.error).toHaveBeenCalled();
        });
    });

    describe("determineMatchBoundary - same-neighbourhood", () => {
        it("returns the neighbourhood polygon containing the point", async () => {
            const mockPolygon = turf.polygon([[[-114.1, 51.1], [-114.1, 51.2], [-114.0, 51.2], [-114.0, 51.1], [-114.1, 51.1]]], { name: "Testhood" });
            const osmMockData = {
                elements: [
                    { type: "way", id: 1, nodes: [1, 2, 3, 4, 1], tags: { admin_level: "10" } },
                ]
            };

            vi.mocked(findPlacesInZone).mockResolvedValueOnce(osmMockData);
            vi.mocked(osmtogeojson).mockReturnValue(turf.featureCollection([mockPolygon]) as any);

            const boundary = await determineMatchBoundary({
                type: "same-neighbourhood",
                lat: 51.15,
                lng: -114.05,
            } as any);

            expect(boundary).toBeDefined();
            expect(boundary.geometry.type).toBe("Polygon");
        });
    });
});
