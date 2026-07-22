import { describe, expect, it, vi, beforeEach } from "vitest";

import {
    checkFilters,
    findPlacesInZone,
    determineMapBoundaries,
} from "@/maps/api/places";
import { polyGeoJSON, mapGeoJSON } from "@/lib/context";

// Mock boundaries
vi.mock("@/data/calgary_boundary.json", () => ({
    default: [
        {
            type: "Feature",
            geometry: {
                type: "MultiPolygon",
                coordinates: [
                    [
                        [
                            [-114.1, 51.0],
                            [-114.1, 51.1],
                            [-114.0, 51.1],
                            [-114.0, 51.0],
                            [-114.1, 51.0],
                        ],
                    ],
                ],
            },
            properties: {},
        },
    ],
}));

// Use hoisted vi.mock for context
vi.mock("@/lib/context", () => ({
    polyGeoJSON: {
        get: vi.fn(),
        set: vi.fn(),
    },
    mapGeoJSON: {
        set: vi.fn(),
    },
}));

vi.mock("@/data/offline_places.json", () => ({
    default: {
        elements: [
            {
                type: "node",
                id: 1,
                lat: 51.05,
                lon: -114.05,
                tags: { amenity: "cafe", name: "Central Cafe" },
            },
            {
                type: "way",
                id: 2,
                center: { lat: 51.06, lon: -114.06 },
                tags: { amenity: "fast_food", name: "Burger Place" },
            },
            {
                type: "node",
                id: 3,
                lat: 51.5, // Outside boundary
                lon: -114.5,
                tags: { amenity: "cafe", name: "Faraway Cafe" },
            },
            {
                type: "relation",
                id: 4,
                bounds: {
                    minlat: 51.04,
                    minlon: -114.04,
                    maxlat: 51.045,
                    maxlon: -114.035,
                },
                tags: { shop: "convenience", name: "Corner Store" },
            },
            {
                type: "way",
                id: 5,
                geometry: [{ lat: 51.07, lon: -114.07 }], // Test fallback to geometry
                tags: { leisure: "park", name: "City Park" },
            },
            {
                type: "relation",
                id: 6,
                members: [
                    {
                        type: "way",
                        ref: 10,
                        geometry: [{ lat: 51.08, lon: -114.08 }],
                    },
                ],
                tags: { leisure: "park", name: "Another Park" },
            },
            {
                type: "node",
                id: 7,
                // Missing location entirely
                tags: { amenity: "cafe", name: "Nowhere Cafe" },
            },
        ],
    },
}));

describe("checkFilters", () => {
    it("returns true when filtersToMatch is empty", () => {
        const filters: any[] = [];
        const tags = { amenity: "cafe" };
        expect(checkFilters(filters, tags)).toBe(true);
    });

    it("returns false if a requested tag is missing", () => {
        const filters = [{ key: "cuisine", op: "=", val: "coffee_shop" }];
        const tags = { amenity: "cafe" }; // missing 'cuisine'
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns true for exact match (=) when tags match", () => {
        const filters = [{ key: "amenity", op: "=", val: "cafe" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(true);
    });

    it("returns false for exact match (=) when tags do not match", () => {
        const filters = [{ key: "amenity", op: "=", val: "restaurant" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns true for regex match (~) when tags match", () => {
        const filters = [{ key: "name", op: "~", val: "^Star.*" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(true);
    });

    it("returns false for regex match (~) when tags do not match", () => {
        const filters = [{ key: "name", op: "~", val: "^Mc.*" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns false for regex match (~) when regex is invalid", () => {
        // an invalid regex pattern (e.g. unclosed parenthesis) will throw an error in RegExp constructor
        const filters = [{ key: "name", op: "~", val: "^Star(" }];
        const tags = { amenity: "cafe", name: "Starbucks" };
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns false for unsupported operators", () => {
        const filters = [{ key: "amenity", op: ">", val: "cafe" }];
        const tags = { amenity: "cafe" };
        expect(checkFilters(filters, tags)).toBe(false);
    });

    it("returns true only if all filters match (AND logic)", () => {
        const filters = [
            { key: "amenity", op: "=", val: "cafe" },
            { key: "name", op: "~", val: "Star.*" },
        ];
        const tagsMatch = { amenity: "cafe", name: "Starbucks" };
        const tagsFail = { amenity: "cafe", name: "Tim Hortons" };
        expect(checkFilters(filters, tagsMatch)).toBe(true);
        expect(checkFilters(filters, tagsFail)).toBe(false);
    });
});

describe("determineMapBoundaries", () => {
    it("returns a FeatureCollection containing the boundary polygon", async () => {
        const result = await determineMapBoundaries();
        expect(result.type).toBe("FeatureCollection");
        expect(result.features).toHaveLength(1);
        expect(result.features[0].geometry.type).toBe("MultiPolygon");
    });
});

describe("findPlacesInZone", () => {
    beforeEach(() => {
        (polyGeoJSON.get as any).mockReturnValue(null);
    });

    it("initializes boundaries if polyGeoJSON store is empty", async () => {
        const data = await findPlacesInZone('["amenity"="cafe"]');
        expect(polyGeoJSON.set).toHaveBeenCalled();
        expect(mapGeoJSON.set).toHaveBeenCalled();
    });

    it("uses cached boundaries if polyGeoJSON store has them", async () => {
        (polyGeoJSON.set as any).mockClear();
        (mapGeoJSON.set as any).mockClear();
        (polyGeoJSON.get as any).mockReturnValue({
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "MultiPolygon",
                        coordinates: [
                            [
                                [
                                    [-114.1, 51.0],
                                    [-114.1, 51.1],
                                    [-114.0, 51.1],
                                    [-114.0, 51.0],
                                    [-114.1, 51.0],
                                ],
                            ],
                        ],
                    },
                    properties: {},
                },
            ],
        });

        const data = await findPlacesInZone('["amenity"="cafe"]');
        expect(polyGeoJSON.set).not.toHaveBeenCalled();
        expect(mapGeoJSON.set).not.toHaveBeenCalled();
    });

    it("filters offline places by primary filter and applies ensureElementCenter", async () => {
        const data = await findPlacesInZone('["amenity"="fast_food"]');

        expect(data.elements).toHaveLength(1);
        const el = data.elements[0];
        expect(el.id).toBe(2);

        // ensureElementCenter logic should have populated el.center based on way fallback
        expect(el.center).toEqual({ lat: 51.06, lon: -114.06 });
    });

    it("filters offline places and includes those matching alternative filters", async () => {
        const data = await findPlacesInZone(
            '["amenity"="fast_food"]',
            undefined,
            ['["shop"="convenience"]'],
        );

        expect(data.elements).toHaveLength(2);
        const ids = data.elements.map((el: any) => el.id).sort();
        expect(ids).toEqual([2, 4]); // Burger Place, Corner Store
    });

    it("filters out elements that fall outside the boundary polygon", async () => {
        // "Faraway Cafe" has amenity=cafe but is outside boundary
        const data = await findPlacesInZone('["amenity"="cafe"]');

        expect(data.elements).toHaveLength(1);
        expect(data.elements[0].id).toBe(1); // Central Cafe is inside, Faraway Cafe is outside
    });

    it("calculates center from geometry bounds correctly", async () => {
        const data = await findPlacesInZone('["shop"="convenience"]');
        expect(data.elements).toHaveLength(1);
        expect(data.elements[0].center).toEqual({ lat: 51.04, lon: -114.04 }); // from minlat/minlon bounds
    });

    it("calculates center from relation member geometries", async () => {
        const data = await findPlacesInZone('["name"="Another Park"]');
        expect(data.elements).toHaveLength(1);
        expect(data.elements[0].center).toEqual({ lat: 51.08, lon: -114.08 });
    });

    it("calculates center from way geometries directly", async () => {
        const data = await findPlacesInZone('["name"="City Park"]');
        expect(data.elements).toHaveLength(1);
        expect(data.elements[0].center).toEqual({ lat: 51.07, lon: -114.07 });
    });

    it("filters out elements that lack valid coordinates entirely", async () => {
        const data = await findPlacesInZone('["name"="Nowhere Cafe"]');
        expect(data.elements).toHaveLength(0); // Should be filtered out because no coordinates
    });
});
