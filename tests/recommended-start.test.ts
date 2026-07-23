import { describe, expect, test, beforeEach } from "vitest";
import { getRecommendedStartCoords, lockRecommendedStartIfNeeded } from "../src/lib/recommended-start";
import { trainStations, disabledStations, lockedRecommendedStart, lockedActiveStationIds } from "../src/lib/context";

// Helper function to create mock stations
const createMockStation = (id: string, lon: number, lat: number, isPoint: boolean = true): any => {
    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: []
        },
        properties: {
            id,
            name: id,
            geometry: isPoint ? {
                type: "Point",
                coordinates: [lon, lat]
            } : {
                type: "Polygon",
                coordinates: []
            }
        }
    };
};

describe("recommended-start", () => {
    beforeEach(() => {
        trainStations.set([]);
        disabledStations.set([]);
        lockedRecommendedStart.set(null);
        lockedActiveStationIds.set(null);
    });

    describe("getRecommendedStartCoords", () => {
        test("returns null when no stations are available", () => {
            expect(getRecommendedStartCoords()).toBeNull();
        });

        test("returns null when all stations are disabled", () => {
            trainStations.set([
                createMockStation("station1", -114.0, 51.0),
            ]);
            disabledStations.set(["station1"]);
            expect(getRecommendedStartCoords()).toBeNull();
        });

        test("returns null when stations do not have Point geometry", () => {
            trainStations.set([
                createMockStation("station1", -114.0, 51.0, false),
            ]);
            expect(getRecommendedStartCoords()).toBeNull();
        });

        test("calculates centroid of active stations", () => {
            trainStations.set([
                createMockStation("station1", -114.0, 51.0),
                createMockStation("station2", -114.0, 51.2),
            ]);

            const centroid = getRecommendedStartCoords();
            expect(centroid).toEqual([-114.0, 51.1]);
        });

        test("ignores disabled stations in centroid calculation", () => {
            trainStations.set([
                createMockStation("station1", -114.0, 51.0),
                createMockStation("station2", -114.0, 51.2),
                createMockStation("station3", -115.0, 52.0), // outlier
            ]);
            disabledStations.set(["station3"]);

            const centroid = getRecommendedStartCoords();
            expect(centroid).toEqual([-114.0, 51.1]);
        });
    });

    describe("lockRecommendedStartIfNeeded", () => {
        test("locks coords and active stations if not already locked", () => {
            trainStations.set([
                createMockStation("station1", -114.0, 51.0),
                createMockStation("station2", -114.0, 51.2),
                createMockStation("station3", -115.0, 52.0),
            ]);
            disabledStations.set(["station3"]);

            lockRecommendedStartIfNeeded();

            expect(lockedRecommendedStart.get()).toEqual([-114.0, 51.1]);
            expect(lockedActiveStationIds.get()).toEqual(["station1", "station2"]);
        });

        test("does not overwrite if already locked", () => {
            lockedRecommendedStart.set([-114.5, 51.5]);
            lockedActiveStationIds.set(["station3"]);

            trainStations.set([
                createMockStation("station1", -114.0, 51.0),
                createMockStation("station2", -114.0, 51.2),
            ]);

            lockRecommendedStartIfNeeded();

            expect(lockedRecommendedStart.get()).toEqual([-114.5, 51.5]);
            expect(lockedActiveStationIds.get()).toEqual(["station3"]);
        });

        test("does not lock if getRecommendedStartCoords returns null", () => {
            trainStations.set([]);

            lockRecommendedStartIfNeeded();

            expect(lockedRecommendedStart.get()).toBeNull();
            expect(lockedActiveStationIds.get()).toBeNull();
        });
    });
});
