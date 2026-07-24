import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    addQuestion,
    disabledStations,
    headStartMinutes,
    hidingRadius,
    hidingRadiusUnits,
    hidingZone,
    lockedActiveStationIds,
    lockedRecommendedStart,
    mapGeoLocation,
    persistentJsonAtom,
    polyGeoJSON,
    questionModified,
    questions,
    trainStations,
} from "@/lib/context";
import * as geoUtils from "@/maps/geo-utils";

vi.mock("../../src/maps/geo-utils", async (importOriginal) => {
    const actual =
        await importOriginal<typeof import("../../src/maps/geo-utils")>();
    return {
        ...actual,
        extractStationLabel: vi.fn(),
    };
});

// Avoid persisting tests across runs by mocking persistent methods
// but preserve the encoding/decoding behavior for testing
vi.mock("@nanostores/persistent", async () => {
    const { atom } = await import("nanostores");
    return {
        persistentAtom: (name: string, initialValue: any, options: any) => {
            const internalStore = atom(initialValue);
            return {
                ...internalStore,
                get: () => {
                    return internalStore.get();
                },
                set: (val: any) => {
                    if (options?.decode && val !== undefined) {
                        try {
                            if (options?.encode) {
                                // Encode then decode to test the full serialization cycle
                                options.decode(options.encode(val));
                            } else {
                                options.decode(
                                    typeof val === "object"
                                        ? JSON.stringify(val)
                                        : val,
                                );
                            }
                        } catch (e) {
                            // If it's the default empty array from init, ignore Zod schema validation
                            if (Array.isArray(val) && val.length > 0) throw e;
                        }
                    }
                    internalStore.set(val);
                },
            };
        },
    };
});

describe("context stores", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset stores
        questions.set([]);
        lockedRecommendedStart.set(null);
        lockedActiveStationIds.set(null);
        trainStations.set([]);
        mapGeoLocation.set({
            geometry: { coordinates: [-114, 51], type: "Point" },
            type: "Feature",
            properties: {
                osm_type: "R",
                osm_id: 123,
                osm_key: "place",
                countrycode: "CA",
                osm_value: "city",
                name: "Calgary",
                type: "city",
            },
        } as any);
        polyGeoJSON.set(null);
        disabledStations.set([]);
        hidingRadius.set(0.8);
        hidingRadiusUnits.set("kilometers");
        headStartMinutes.set(45);
    });

    describe("persistentJsonAtom", () => {
        it("should correctly encode and decode JSON values", () => {
            // Using a complex object to ensure encode/decode logic (JSON.stringify/parse) is actually applied
            const testObj = { nested: { array: [1, 2, 3] } };
            const testStore = persistentJsonAtom<any>("testAtom", testObj);

            // Should decode to the original object structure
            expect(testStore.get()).toEqual(testObj);

            const newObj = { foo: "bar" };
            testStore.set(newObj);
            expect(testStore.get()).toEqual(newObj);
        });
    });

    describe("addQuestion & questionModified", () => {
        it("should add a question and update the store", () => {
            const mockQuestion = {
                id: "radar",
                data: {
                    locked: false,
                    radius: 5,
                    lat: 51,
                    lng: -114,
                    isCustom: false,
                    unit: "kilometers",
                    within: false,
                    colour: "orange",
                    location: false,
                    order: 0,
                },
            } as any;

            addQuestion(mockQuestion);
            const q = questions.get();
            expect(q).toHaveLength(1);
            expect(q[0].id).toBe("radar");
        });

        it("should clear locked stores when questions become empty", () => {
            lockedRecommendedStart.set([1, 2]);
            lockedActiveStationIds.set(["station-1"]);

            // Setting a question to ensure we can clear it
            questions.set([
                {
                    id: "radar",
                    data: {
                        locked: true,
                        radius: 5,
                        location: false,
                        lat: 51,
                        lng: -114,
                    },
                } as any,
            ]);

            // Now empty it and trigger modification
            questions.set([]);
            questionModified();

            expect(lockedRecommendedStart.get()).toBeNull();
            expect(lockedActiveStationIds.get()).toBeNull();
        });

        it("should not clear locked stores when questions are modified but not empty", () => {
            lockedRecommendedStart.set([1, 2]);
            lockedActiveStationIds.set(["station-1"]);

            questions.set([
                {
                    id: "radar",
                    data: {
                        locked: true,
                        radius: 5,
                        location: false,
                        lat: 51,
                        lng: -114,
                    },
                } as any,
            ]);
            questionModified();

            expect(lockedRecommendedStart.get()).toEqual([1, 2]);
            expect(lockedActiveStationIds.get()).toEqual(["station-1"]);
        });
    });

    describe("trainStations", () => {
        it("should sort stations on set by extracted label", () => {
            vi.mocked(geoUtils.extractStationLabel).mockImplementation(
                (props) => props?.name as string,
            );

            const stationB = { properties: { name: "B Station" } } as any;
            const stationA = { properties: { name: "A Station" } } as any;
            const stationC = { properties: { name: "C Station" } } as any;

            trainStations.set([stationB, stationC, stationA]);

            const sorted = trainStations.get();
            expect(sorted[0].properties.name).toBe("A Station");
            expect(sorted[1].properties.name).toBe("B Station");
            expect(sorted[2].properties.name).toBe("C Station");
        });
    });

    describe("hidingZone", () => {
        it("should compute correctly when polyGeoJSON is null (fallback to mapGeoLocation)", () => {
            polyGeoJSON.set(null);
            disabledStations.set(["station-xyz"]);
            questions.set([
                {
                    id: "radar",
                    data: {
                        locked: true,
                        radius: 5,
                        location: false,
                        lat: 51,
                        lng: -114,
                    },
                } as any,
            ]);
            hidingRadius.set(1.5);
            hidingRadiusUnits.set("miles" as any);
            headStartMinutes.set(30);

            // Listen to computed store to evaluate it
            let currentHidingZone;
            const unsubscribe = hidingZone.subscribe((val) => {
                currentHidingZone = val;
            });

            expect(currentHidingZone).toBeDefined();
            expect(currentHidingZone?.properties.isHidingZone).toBe(true);
            expect(currentHidingZone?.properties.questions).toHaveLength(1);
            expect(currentHidingZone?.disabledStations).toEqual([
                "station-xyz",
            ]);
            expect(currentHidingZone?.hidingRadius).toBe(1.5);
            expect(currentHidingZone?.hidingRadiusUnits).toBe("miles");
            expect(currentHidingZone?.headStartMinutes).toBe(30);

            unsubscribe();
        });

        it("should compute correctly when polyGeoJSON is provided", () => {
            const mockGeo = {
                type: "FeatureCollection",
                features: [],
            } as any;

            polyGeoJSON.set(mockGeo);
            disabledStations.set(["station-abc"]);
            questions.set([]);
            hidingRadius.set(2.0);
            hidingRadiusUnits.set("kilometers");
            headStartMinutes.set(15);

            let currentHidingZone;
            const unsubscribe = hidingZone.subscribe((val) => {
                currentHidingZone = val;
            });

            expect(currentHidingZone).toBeDefined();
            expect(currentHidingZone?.type).toBe("FeatureCollection");
            expect(currentHidingZone?.questions).toEqual([]);
            expect(currentHidingZone?.disabledStations).toEqual([
                "station-abc",
            ]);
            expect(currentHidingZone?.hidingRadius).toBe(2.0);
            expect(currentHidingZone?.hidingRadiusUnits).toBe("kilometers");
            expect(currentHidingZone?.headStartMinutes).toBe(15);
            // It should not modify map location properties
            expect(currentHidingZone?.properties?.isHidingZone).toBeUndefined();

            unsubscribe();
        });
    });
});
