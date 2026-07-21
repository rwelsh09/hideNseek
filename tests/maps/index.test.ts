import { describe, expect, it, vi, beforeEach } from "vitest";
import { applyQuestionsToMapGeoData, hiderifyQuestion } from "@/maps/index";
import type { Question } from "@/maps/schema";
import * as radarModule from "@/maps/questions/radar";
import * as closestModule from "@/maps/questions/closest";
import * as hotColdModule from "@/maps/questions/hot-cold";
import * as matchModule from "@/maps/questions/match";
import * as measureModule from "@/maps/questions/measure";

vi.mock("@/maps/questions/radar", () => ({
    adjustPerRadar: vi.fn(),
    hiderifyRadar: vi.fn(),
    radarPlanningPolygon: vi.fn(),
}));

vi.mock("@/maps/questions/closest", () => ({
    adjustPerClosest: vi.fn(),
    hiderifyClosest: vi.fn(),
    closestPlanningPolygon: vi.fn(),
}));

vi.mock("@/maps/questions/hot-cold", () => ({
    adjustPerHotCold: vi.fn(),
    hiderifyHotCold: vi.fn(),
    hotColdPlanningPolygon: vi.fn(),
}));

vi.mock("@/maps/questions/match", () => ({
    adjustPerMatch: vi.fn(),
    hiderifyMatch: vi.fn(),
    matchPlanningPolygon: vi.fn(),
}));

vi.mock("@/maps/questions/measure", () => ({
    adjustPerMeasure: vi.fn(),
    hiderifyMeasure: vi.fn(),
    measurePlanningPolygon: vi.fn(),
}));

describe("maps/index dispatcher", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("hiderifyQuestion", () => {
        it("should return the question unmodified if it is already locked", async () => {
            const question: Question = {
                id: "radar",
                data: { locked: true } as any,
            };
            const result = await hiderifyQuestion(question);
            expect(result).toBe(question);
            expect(radarModule.hiderifyRadar).not.toHaveBeenCalled();
        });

        it("should call the appropriate handler if unlocked", async () => {
            const question: Question = {
                id: "radar",
                data: { locked: false, radius: 5 } as any,
            };

            const originalData = { ...question.data };

            vi.mocked(radarModule.hiderifyRadar).mockResolvedValue({
                locked: false,
                radius: 5,
                within: true
            } as any);

            const result = await hiderifyQuestion(question);

            expect(radarModule.hiderifyRadar).toHaveBeenCalledWith(originalData);
            expect(result.data.within).toBe(true);
        });

        it("should return the question unmodified if handler is missing", async () => {
            const question: Question = {
                id: "unknown-type" as any,
                data: { locked: false } as any,
            };
            const result = await hiderifyQuestion(question);
            expect(result).toBe(question);
        });
    });

    describe("applyQuestionsToMapGeoData", () => {
        const initialMapData = {
            type: "FeatureCollection",
            features: [{ type: "Feature", properties: { initial: true } }],
        };

        it("should skip questions that are not locked", async () => {
            const questions: Question[] = [
                { id: "radar", data: { locked: false } as any },
            ];
            const result = await applyQuestionsToMapGeoData(questions, initialMapData);
            expect(result).toBe(initialMapData);
            expect(radarModule.adjustPerRadar).not.toHaveBeenCalled();
        });

        it("should adjust mapData sequentially for locked questions", async () => {
            const questions: Question[] = [
                { id: "radar", data: { locked: true, order: 1 } as any },
                { id: "match", data: { locked: true, order: 2 } as any },
            ];

            const radarMapData = {
                type: "FeatureCollection",
                features: [{ type: "Feature", properties: { radar: true } }],
            };

            const matchMapData = {
                type: "FeatureCollection",
                features: [{ type: "Feature", properties: { match: true } }],
            };

            vi.mocked(radarModule.adjustPerRadar).mockResolvedValue(radarMapData as any);
            vi.mocked(matchModule.adjustPerMatch).mockResolvedValue(matchMapData as any);

            const result = await applyQuestionsToMapGeoData(questions, initialMapData);

            expect(radarModule.adjustPerRadar).toHaveBeenCalledWith(questions[0].data, initialMapData);
            expect(matchModule.adjustPerMatch).toHaveBeenCalledWith(questions[1].data, radarMapData);
            expect(result).toBe(matchMapData);
        });

        it("should wrap raw Features into a FeatureCollection", async () => {
            const questions: Question[] = [
                { id: "radar", data: { locked: true } as any },
            ];

            const rawFeature = { type: "Feature", properties: { raw: true } };
            vi.mocked(radarModule.adjustPerRadar).mockResolvedValue(rawFeature as any);

            const result = await applyQuestionsToMapGeoData(questions, initialMapData);

            expect(result.type).toBe("FeatureCollection");
            expect(result.features[0]).toBe(rawFeature);
        });

        it("should return the current mapGeoData if a handler throws an error", async () => {
            const questions: Question[] = [
                { id: "radar", data: { locked: true } as any },
            ];

            vi.mocked(radarModule.adjustPerRadar).mockRejectedValue(new Error("Test Error"));

            const result = await applyQuestionsToMapGeoData(questions, initialMapData);

            expect(result).toBe(initialMapData); // Remains unchanged
        });

        it("should return the current mapGeoData if a handler is missing", async () => {
             const questions: Question[] = [
                { id: "unknown-type" as any, data: { locked: true } as any },
            ];

            const result = await applyQuestionsToMapGeoData(questions, initialMapData);
            expect(result).toBe(initialMapData);
        });

        describe("special closest adjust logic", () => {
            // closest has custom adjust wrapper in index.ts
            it("should route closest question to adjustPerRadar if location is false", async () => {
                 const questions: Question[] = [
                    { id: "closest", data: { locked: true, location: false, radius: 10 } as any },
                ];

                const expectedMapData = { type: "FeatureCollection", features: [] };
                vi.mocked(radarModule.adjustPerRadar).mockResolvedValue(expectedMapData as any);

                const result = await applyQuestionsToMapGeoData(questions, initialMapData);

                expect(closestModule.adjustPerClosest).not.toHaveBeenCalled();
                expect(radarModule.adjustPerRadar).toHaveBeenCalledWith(
                    expect.objectContaining({ location: false, radius: 10, within: false }),
                    initialMapData
                );
                expect(result).toBe(expectedMapData);
            });

            it("should route closest question to adjustPerClosest if location is truthy", async () => {
                 const questions: Question[] = [
                    { id: "closest", data: { locked: true, location: { properties: {} } } as any },
                ];

                const expectedMapData = { type: "FeatureCollection", features: [] };
                vi.mocked(closestModule.adjustPerClosest).mockResolvedValue(expectedMapData as any);

                const result = await applyQuestionsToMapGeoData(questions, initialMapData);

                expect(radarModule.adjustPerRadar).not.toHaveBeenCalled();
                expect(closestModule.adjustPerClosest).toHaveBeenCalledWith(questions[0].data, initialMapData);
                expect(result).toBe(expectedMapData);
            });
        });

        describe("planningModeCallback", () => {
            it("should invoke planningModeCallback for unlocked questions with their planningPolygon", async () => {
                const questions: Question[] = [
                    { id: "radar", data: { locked: false } as any },
                    { id: "closest", data: { locked: true } as any }, // Will be skipped by determinePlanningPolygon
                ];

                const radarPolygon = { type: "Polygon", coordinates: [] };
                vi.mocked(radarModule.radarPlanningPolygon).mockResolvedValue(radarPolygon as any);

                const callback = vi.fn();
                await applyQuestionsToMapGeoData(questions, initialMapData, callback);

                expect(radarModule.radarPlanningPolygon).toHaveBeenCalledWith(questions[0].data);
                expect(callback).toHaveBeenCalledTimes(1);
                expect(callback).toHaveBeenCalledWith(radarPolygon, questions[0]);
            });

            it("should ignore missing handlers or falsy planning polygons", async () => {
                 const questions: Question[] = [
                    { id: "radar", data: { locked: false } as any },
                ];

                // mock returning false/undefined
                vi.mocked(radarModule.radarPlanningPolygon).mockResolvedValue(undefined as any);

                const callback = vi.fn();
                await applyQuestionsToMapGeoData(questions, initialMapData, callback);

                expect(callback).not.toHaveBeenCalled();
            });
        });
    });
});
