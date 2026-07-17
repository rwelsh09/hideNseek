import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as turf from "@turf/turf";

import { initializeHidingZonesLogic } from "@/lib/hiding-zones";
import {
    disabledStations,
    hidingRadius,
    hidingRadiusUnits,
    isLoading,
    lockedActiveStationIds,
    questionFinishedMapData,
    questions,
    trainStations,
} from "@/lib/context";
import { toast } from "react-toastify";

// Mock JSON data
// Use exact ID format for tests so it isn't parsed differently by extractStationId
vi.mock("@/data/calgary_rapid_transit_network.json", () => ({
    default: {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                id: "station-central",
                properties: {
                    name: "Central",
                    route_ref: "Red Line"
                },
                geometry: {
                    type: "Point",
                    coordinates: [-114.07, 51.05]
                }
            },
            {
                type: "Feature",
                id: "station-brentwood",
                properties: {
                    name: "Brentwood",
                    route_ref: "Red Line"
                },
                geometry: {
                    type: "Point",
                    coordinates: [-114.13, 51.08]
                }
            },
            {
                type: "Feature",
                id: "station-bridgeland",
                properties: {
                    name: "Bridgeland",
                    route_ref: "Blue Line"
                },
                geometry: {
                    type: "Point",
                    coordinates: [-114.04, 51.05]
                }
            },
            {
                type: "Feature",
                id: "station-banff-trail",
                properties: {
                    name: "Banff Trail",
                    route_ref: "Red Line"
                },
                geometry: {
                    type: "Point",
                    coordinates: [-114.11, 51.07]
                }
            }
        ]
    }
}));

// Mock geospatial utils safely according to learnings
vi.mock("@/maps/geo-utils", async (importOriginal) => {
    const actual = await importOriginal<typeof import("@/maps/geo-utils")>();
    return {
        ...actual,
        extractStationId: (place: any) => {
            // Because turf embeds place inside properties.properties if wrapped in a feature, or just properties if direct
            return place?.properties?.id || place?.properties?.properties?.id || place?.id;
        },
        extractStationName: (place: any) => {
            return place?.properties?.name || place?.properties?.properties?.name || place?.name;
        },
        extractStationLines: (place: any) => {
            const ref = place?.properties?.route_ref || place?.properties?.properties?.route_ref || "";
            return ref ? ref.split(",").map((s: string) => s.trim()) : [];
        }
    }
});

// Helper to reset module-level variables in the actual file
// We cannot easily reset `previousQuestionDisabled` inside hiding-zones.ts
// but we can ensure tests run completely independently by passing clear inputs

// Mock nanostores following journal learnings
vi.mock("@/lib/context", () => {
    let _hidingRadius = 1;
    let _hidingRadiusUnits = "kilometers";
    let _questionFinishedMapData: any = null;
    let _disabledStations: string[] = [];
    let _questions: any[] = [];
    let _lockedActiveStationIds: string[] | null = null;
    let _trainStations: any[] = [];
    let _isLoading = false;

    return {
        hidingRadius: {
            get: vi.fn(() => _hidingRadius),
            set: vi.fn((val) => { _hidingRadius = val; })
        },
        hidingRadiusUnits: {
            get: vi.fn(() => _hidingRadiusUnits),
            set: vi.fn((val) => { _hidingRadiusUnits = val; })
        },
        questionFinishedMapData: {
            get: vi.fn(() => _questionFinishedMapData),
            set: vi.fn((val) => { _questionFinishedMapData = val; })
        },
        disabledStations: {
            get: vi.fn(() => _disabledStations),
            set: vi.fn((val) => { _disabledStations = val; })
        },
        questions: {
            get: vi.fn(() => _questions),
            set: vi.fn((val) => { _questions = val; })
        },
        lockedActiveStationIds: {
            get: vi.fn(() => _lockedActiveStationIds),
            set: vi.fn((val) => { _lockedActiveStationIds = val; })
        },
        trainStations: {
            get: vi.fn(() => _trainStations),
            set: vi.fn((val) => { _trainStations = val; })
        },
        isLoading: {
            get: vi.fn(() => _isLoading),
            set: vi.fn((val) => { _isLoading = val; })
        }
    };
});

vi.mock("react-toastify", () => ({
    toast: {
        error: vi.fn()
    }
}));

describe("initializeHidingZonesLogic", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        hidingRadius.set(1);
        hidingRadiusUnits.set("kilometers");
        questionFinishedMapData.set(null);
        disabledStations.set([]);
        questions.set([]);
        lockedActiveStationIds.set(null);
        trainStations.set([]);
        isLoading.set(false);
    });

    describe("Early Returns", () => {
        it("should return immediately if questionFinishedMapData is falsy", async () => {
            questionFinishedMapData.set(null);

            // The module-level mocked set functions are recorded, we should clear them before test
            vi.mocked(isLoading.set).mockClear();
            vi.mocked(trainStations.set).mockClear();

            await initializeHidingZonesLogic();

            expect(isLoading.set).not.toHaveBeenCalledWith(true);
            expect(trainStations.set).not.toHaveBeenCalled();
        });
    });

    describe("Happy Path", () => {
        it("should create circles around stations and update disabled stations if they don't overlap with the polygon", async () => {
            // Provide a mock map polygon covering the Central station only
            // Central is at [-114.07, 51.05]
            // We need a large enough polygon so `turf.difference` results in < 1 area or no diff
            // when the circle is entirely inside the map polygon.
            // A circle around [-114.07, 51.05] with 1km radius is roughly +/- 0.01 degrees.
            const mockPolygon = turf.polygon([[
                [-114.09, 51.03],
                [-114.05, 51.03],
                [-114.05, 51.07],
                [-114.09, 51.07],
                [-114.09, 51.03]
            ]]);

            questionFinishedMapData.set(turf.featureCollection([mockPolygon]));

            await initializeHidingZonesLogic();

            expect(isLoading.set).toHaveBeenCalledWith(true);

            // Train stations should be created
            const stations = trainStations.get();
            expect(stations).toHaveLength(4);

            // Wait, the logic in hiding-zones.ts is:
            // "if (!diff || turf.area(diff) < 1) { ... newlyDisabledStations.push(id); }"
            // Meaning if the circle is entirely INSIDE the map polygon (diff area is 0), it gets DISABLED.
            // This is actually backwards from the test description, but it's what the code does (or maybe
            // "unionized" is the finished map polygon which is what they CANNOT be inside?).
            // Yes, if `unionized` is the area they have already eliminated, then they are disabled if they are inside it!

            const disabled = disabledStations.get();
            expect(disabled).toContain("station-central"); // Inside the unionized polygon = disabled
            expect(disabled).not.toContain("station-brentwood"); // Outside = not disabled
            expect(disabled).not.toContain("station-banff-trail");
            expect(disabled).not.toContain("station-bridgeland");

            expect(isLoading.set).toHaveBeenCalledWith(false);
        });

        it("should maintain manually disabled stations during recalculation", async () => {
            // Provide a map polygon that covers NO stations (so none are auto-disabled)
            // A tiny polygon far away
            const mockPolygon = turf.polygon([[
                [-110.0, 50.0],
                [-109.0, 50.0],
                [-109.0, 51.0],
                [-110.0, 51.0],
                [-110.0, 50.0]
            ]]);

            questionFinishedMapData.set(turf.featureCollection([mockPolygon]));

            // To properly mock a full fresh state, we use `disabledStations.set` and let the module-level variable act on it.
            // The module-level variable `previousQuestionDisabled` acts as a cache.
            // So if we run it once, it populates it. Let's just make sure manually disabled stations are kept.
            disabledStations.set(["station-brentwood"]);

            await initializeHidingZonesLogic();

            const disabled = disabledStations.get();
            // It should still be disabled
            expect(disabled).toContain("station-brentwood");
            // No other stations should be disabled since polygon is far away
            expect(disabled.length).toBe(1);
        });
    });

    describe("Match Question Filters", () => {
        // Shared base map for match tests that covers NO stations so none are disabled by geometry alone
        beforeEach(() => {
            const mockPolygon = turf.polygon([[
                [-110.0, 50.0],
                [-109.0, 50.0],
                [-109.0, 51.0],
                [-110.0, 51.0],
                [-110.0, 50.0]
            ]]);
            questionFinishedMapData.set(turf.featureCollection([mockPolygon]));
            lockedActiveStationIds.set(["station-central"]); // Has to be non-null to trigger locked questions restoring logic safely
        });

        it("should filter by same-train-line", async () => {
            // Suppose Seeker is closest to Central (Red Line)
            // They asked: Is the hider on the SAME train line? Yes.
            questions.set([{
                id: "match",
                data: {
                    locked: true,
                    type: "same-train-line",
                    lat: 51.05,
                    lng: -114.07, // Central
                    same: true
                }
            } as any]);

            await initializeHidingZonesLogic();

            const disabled = disabledStations.get();
            // Bridgeland is Blue Line, so it should be disabled.
            expect(disabled).toContain("station-bridgeland");
            // Central, Brentwood, Banff Trail are Red Line, so they shouldn't be disabled.
            expect(disabled).not.toContain("station-central");
            expect(disabled).not.toContain("station-brentwood");
            expect(disabled).not.toContain("station-banff-trail");
        });

        it("should filter by same-first-letter-station", async () => {
            // Suppose Seeker is closest to Brentwood (B)
            // They asked: Does the station start with the SAME letter? No.
            questions.set([{
                id: "match",
                data: {
                    locked: true,
                    type: "same-first-letter-station",
                    lat: 51.08,
                    lng: -114.13, // Brentwood
                    same: false
                }
            } as any]);

            await initializeHidingZonesLogic();

            const disabled = disabledStations.get();
            // Starts with B: Brentwood, Bridgeland, Banff Trail (These should be disabled since `same: false`)
            expect(disabled).toContain("station-brentwood");
            expect(disabled).toContain("station-bridgeland");
            expect(disabled).toContain("station-banff-trail");

            // Central starts with C (not disabled)
            expect(disabled).not.toContain("station-central");
        });

        it("should filter by same-length-station using length comparisons", async () => {
            // Let's test `longer`.
            // Seeker is at Central (length 7).
            // They asked: Is the station length LONGER? same: true (meaning yes, it is longer)
            questions.set([{
                id: "match",
                data: {
                    locked: true,
                    type: "same-length-station",
                    lat: 51.05,
                    lng: -114.07, // Central (7 chars)
                    same: true,
                    lengthComparison: "longer"
                }
            } as any]);

            await initializeHidingZonesLogic();

            let disabled = disabledStations.get();
            // Brentwood (9), Bridgeland (10), Banff Trail (11) are all > 7. So they should NOT be disabled.
            // Central (7) is NOT > 7, so it SHOULD be disabled.
            expect(disabled).toContain("station-central");
            expect(disabled).not.toContain("station-brentwood");
            expect(disabled).not.toContain("station-bridgeland");
            expect(disabled).not.toContain("station-banff-trail");

            // Let's test `shorter` with same: false (meaning it is NOT shorter).
            // Seeker is at Brentwood (length 9).
            // Stations shorter than 9: Central (7).
            // Since same is false, the ones that ARE shorter (Central) should be disabled.
            // The ones that are NOT shorter (Bridgeland(10), Banff Trail(11), Brentwood(9)) should NOT be disabled.
            disabledStations.set([]);
            questions.set([{
                id: "match",
                data: {
                    locked: true,
                    type: "same-length-station",
                    lat: 51.08,
                    lng: -114.13, // Brentwood (9 chars)
                    same: false,
                    lengthComparison: "shorter"
                }
            } as any]);

            await initializeHidingZonesLogic();

            disabled = disabledStations.get();
            expect(disabled).toContain("station-central"); // Shorter, so matches `isMatch`. But `same: false` means it should be filtered out (disabled).
            expect(disabled).not.toContain("station-brentwood");
            expect(disabled).not.toContain("station-bridgeland");
            expect(disabled).not.toContain("station-banff-trail");

            // Let's test `same` with same: true
            disabledStations.set([]);
            questions.set([{
                id: "match",
                data: {
                    locked: true,
                    type: "same-length-station",
                    lat: 51.05,
                    lng: -114.07, // Central (7 chars)
                    same: true,
                    lengthComparison: "same"
                }
            } as any]);

            await initializeHidingZonesLogic();

            disabled = disabledStations.get();
            // Central is 7 chars. Nothing else is 7 chars. So Central is kept, rest disabled.
            expect(disabled).not.toContain("station-central");
            expect(disabled).toContain("station-brentwood");
            expect(disabled).toContain("station-bridgeland");
            expect(disabled).toContain("station-banff-trail");
        });
    });
});
