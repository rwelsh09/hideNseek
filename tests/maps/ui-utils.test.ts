// @vitest-environment jsdom
import * as L from "leaflet";
import { describe, expect, it, vi } from "vitest";

import { flyToWithOffset } from "@/maps/ui-utils";

describe("flyToWithOffset", () => {
    it("should fly to the default offset [0, 150]", () => {
        const mockProject = vi.fn().mockReturnValue(L.point(100, 200));
        const mockUnproject = vi.fn().mockReturnValue(L.latLng(51.0, -114.0));
        const mockFlyTo = vi.fn();

        const mockMap = {
            project: mockProject,
            unproject: mockUnproject,
            flyTo: mockFlyTo,
        } as unknown as L.Map;

        const targetLatLng = L.latLng(51.05, -114.05);
        const zoom = 13;

        flyToWithOffset(mockMap, targetLatLng, zoom);

        expect(mockProject).toHaveBeenCalledWith(targetLatLng, zoom);
        // The mock returned L.point(100, 200).
        // Default offset is [0, 150].
        // x = 100 + 0 = 100, y = 200 + 150 = 350.
        // Wait, Leaflet Points mutate or create new? The implementation modifies targetPoint directly.
        expect(mockUnproject).toHaveBeenCalledWith(
            expect.objectContaining({ x: 100, y: 350 }),
            zoom,
        );
        expect(mockFlyTo).toHaveBeenCalledWith(L.latLng(51.0, -114.0), zoom);
    });

    it("should fly to a custom offset", () => {
        const mockProject = vi.fn().mockReturnValue(L.point(500, 500));
        const mockUnproject = vi.fn().mockReturnValue(L.latLng(40.0, -74.0));
        const mockFlyTo = vi.fn();

        const mockMap = {
            project: mockProject,
            unproject: mockUnproject,
            flyTo: mockFlyTo,
        } as unknown as L.Map;

        const targetLatLng = L.latLng(40.71, -74.01);
        const zoom = 10;
        const customOffset: [number, number] = [100, -50];

        flyToWithOffset(mockMap, targetLatLng, zoom, customOffset);

        expect(mockProject).toHaveBeenCalledWith(targetLatLng, zoom);
        // x = 500 + 100 = 600, y = 500 - 50 = 450
        expect(mockUnproject).toHaveBeenCalledWith(
            expect.objectContaining({ x: 600, y: 450 }),
            zoom,
        );
        expect(mockFlyTo).toHaveBeenCalledWith(L.latLng(40.0, -74.0), zoom);
    });
});
