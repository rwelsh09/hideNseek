import { describe, it, expect, vi, beforeEach } from "vitest";
import * as turf from "@turf/turf";
import { getQuestionShareText } from "@/lib/question-text";
import { determineMatchBoundary } from "@/maps/questions/match";
import { calculateMeasureDistance } from "@/maps/questions/measure";
import { extractStationName } from "@/maps/geo-utils";

// Mock dependencies
vi.mock("@turf/turf", () => ({
    distance: vi.fn(),
}));

vi.mock("@/maps/placesConfig", () => ({
    PLACES: [
        { id: "park", label: "Park", labelPlural: "Parks" },
        { id: "hospital", label: "Hospital" }, // missing plural for test case
    ],
}));

vi.mock("@/maps/questions/match", () => ({
    determineMatchBoundary: vi.fn(),
}));

vi.mock("@/maps/questions/measure", () => ({
    calculateMeasureDistance: vi.fn(),
}));

vi.mock("@/maps/geo-utils", () => ({
    extractStationName: vi.fn(),
}));

vi.mock("@/components/cards/photo", () => ({
    PHOTO_DESCRIPTIONS: {
        bench: "Find a bench!",
    },
}));

describe("getQuestionShareText", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns default text if question is missing", async () => {
        expect(await getQuestionShareText(null, {})).toBe(
            "Incoming question from a Seeker!",
        );
    });

    it("returns default text for unknown question type", async () => {
        expect(await getQuestionShareText({ id: "unknown" }, {})).toBe(
            "Incoming question from a Seeker!",
        );
    });

    describe("radar", () => {
        it("formats correctly for meters", async () => {
            const result = await getQuestionShareText(
                { id: "radar" },
                { radius: 500, unit: "meters" },
            );
            expect(result).toBe("Are you within 500m of us?");
        });

        it("formats correctly for kilometers", async () => {
            const result = await getQuestionShareText(
                { id: "radar" },
                { radius: 5, unit: "kilometers" },
            );
            expect(result).toBe("Are you within 5km of us?");
        });
    });

    describe("hot/cold", () => {
        it("calculates distance when all coordinates are present", async () => {
            vi.mocked(turf.distance).mockReturnValue(2.3456);
            const result = await getQuestionShareText(
                { id: "hot/cold" },
                { latA: 1, lngA: 2, latB: 3, lngB: 4 },
            );
            expect(result).toBe(
                "We just moved 2.35km are we warmer or colder?",
            );
            expect(turf.distance).toHaveBeenCalledWith([2, 1], [4, 3], {
                units: "kilometers",
            });
        });

        it("uses fallback text when coordinates are missing", async () => {
            const result = await getQuestionShareText(
                { id: "hot/cold" },
                { latA: 1, lngA: 2 }, // Missing latB, lngB
            );
            expect(result).toBe(
                "We just moved [distance]km are we warmer or colder?",
            );
        });
    });

    describe("match", () => {
        it("handles same-neighbourhood with boundary name", async () => {
            vi.mocked(determineMatchBoundary).mockResolvedValue({} as any);
            vi.mocked(extractStationName).mockReturnValue("Downtown");
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-neighbourhood" },
            );
            expect(result).toBe("Are we in the same Neighbourhood (Downtown)?");
        });

        it("handles same-first-letter-neighbourhood with boundary name", async () => {
            vi.mocked(determineMatchBoundary).mockResolvedValue({} as any);
            vi.mocked(extractStationName).mockReturnValue("Downtown");
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-first-letter-neighbourhood" },
            );
            expect(result).toBe(
                "Does your Neighbourhood start with the same letter as ours (D)?",
            );
        });

        it("handles neighbourhood fallbacks when boundary errors", async () => {
            vi.mocked(determineMatchBoundary).mockRejectedValue(
                new Error("Failed"),
            );
            const result1 = await getQuestionShareText(
                { id: "match" },
                { type: "same-neighbourhood" },
            );
            expect(result1).toBe("Are we in the same Neighbourhood?");

            const result2 = await getQuestionShareText(
                { id: "match" },
                { type: "same-first-letter-neighbourhood" },
            );
            expect(result2).toBe(
                "Does your Neighbourhood start with the same letter as ours?",
            );
        });

        it("handles other specific match types", async () => {
            expect(
                await getQuestionShareText(
                    { id: "match" },
                    { type: "same-train-line" },
                ),
            ).toBe("Are you on the same Line as us?");
            expect(
                await getQuestionShareText(
                    { id: "match" },
                    { type: "same-length-station" },
                ),
            ).toBe("Does your Station/Stop have the same length as ours?");
            expect(
                await getQuestionShareText(
                    { id: "match" },
                    { type: "same-first-letter-station" },
                ),
            ).toBe(
                "Does your Station/Stop start with the same letter as ours?",
            );
        });

        it("handles generic place match", async () => {
            expect(
                await getQuestionShareText({ id: "match" }, { type: "park" }),
            ).toBe("Are you near the same Park as us?");
            // Unknown place fallback
            expect(
                await getQuestionShareText(
                    { id: "match" },
                    { type: "unknown_place" },
                ),
            ).toBe("Are you near the same unknown_place as us?");
        });
    });

    describe("measure", () => {
        it("calculates distance and formats for rail-measure", async () => {
            vi.mocked(calculateMeasureDistance).mockResolvedValue(1.2345);
            const result = await getQuestionShareText(
                { id: "measure" },
                { type: "rail-measure" },
            );
            expect(result).toBe(
                "We are 1.235km from a Train Station. Are you closer to or further from your nearest Train Station?",
            );
        });

        it("calculates distance and formats for generic place", async () => {
            vi.mocked(calculateMeasureDistance).mockResolvedValue(0.5);
            const result = await getQuestionShareText(
                { id: "measure" },
                { type: "park" },
            );
            expect(result).toBe(
                "We are 0.5km from a Park. Are you closer to or further from your nearest Park?",
            );
        });

        it("uses fallback text when distance calculation fails", async () => {
            vi.mocked(calculateMeasureDistance).mockRejectedValue(
                new Error("Failed"),
            );
            const result = await getQuestionShareText(
                { id: "measure" },
                { type: "hospital" },
            );
            expect(result).toBe(
                "We are [distance] from a Hospital. Are you closer to or further from your nearest Hospital?",
            );
        });
    });

    describe("closest", () => {
        it("uses plural label if available", async () => {
            const result = await getQuestionShareText(
                { id: "closest" },
                { locationType: "park" },
            );
            expect(result).toBe("Which of these Parks is closest to you?");
        });

        it("uses singular label if plural is missing", async () => {
            const result = await getQuestionShareText(
                { id: "closest" },
                { locationType: "hospital" },
            );
            expect(result).toBe("Which of these Hospital is closest to you?");
        });
    });

    describe("photo", () => {
        it("uses custom notes if provided", async () => {
            const result = await getQuestionShareText(
                { id: "photo" },
                { notes: "A green door" },
            );
            expect(result).toBe("Photo challenge: A green door");
        });

        it("uses predefined description if available", async () => {
            const result = await getQuestionShareText(
                { id: "photo" },
                { type: "bench" },
            );
            expect(result).toBe("Find a bench!");
        });

        it("uses fallback text if description missing", async () => {
            const result = await getQuestionShareText(
                { id: "photo" },
                { type: "fountain" },
            );
            expect(result).toBe("Send us a photo of a fountain!");
        });
    });
});
