import { describe, expect, it, vi, beforeEach } from "vitest";
import { getQuestionShareText } from "@/lib/question-text";
import { determineMatchBoundary } from "@/maps/questions/match";
import { calculateMeasureDistance } from "@/maps/questions/measure";

// Mock dependencies
vi.mock("@/maps/questions/match", () => ({
    determineMatchBoundary: vi.fn(),
}));

vi.mock("@/maps/questions/measure", () => ({
    calculateMeasureDistance: vi.fn(),
}));

describe("getQuestionShareText", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return fallback text if question is falsy", async () => {
        expect(await getQuestionShareText(null, {})).toBe("Incoming question from a Seeker!");
        expect(await getQuestionShareText(undefined, {})).toBe("Incoming question from a Seeker!");
    });

    it("should return fallback text for unrecognized question id", async () => {
        expect(await getQuestionShareText({ id: "unknown" }, {})).toBe("Incoming question from a Seeker!");
    });

    describe("radar", () => {
        it("should format radar question in kilometers", async () => {
            const result = await getQuestionShareText(
                { id: "radar" },
                { radius: 5, unit: "kilometers" }
            );
            expect(result).toBe("Are you within 5km of us?");
        });

        it("should format radar question in meters", async () => {
            const result = await getQuestionShareText(
                { id: "radar" },
                { radius: 500, unit: "meters" }
            );
            expect(result).toBe("Are you within 500m of us?");
        });
    });

    describe("hot/cold", () => {
        it("should format hot/cold question with calculated distance", async () => {
            // Because 0 evaluates to false in if(questionData.latA ...), we use non-zero coordinates
            const result = await getQuestionShareText(
                { id: "hot/cold" },
                { latA: 0.01, lngA: 0.01, latB: 0.02, lngB: 0.01 } // approximately 1.11km
            );
            expect(result).toMatch(/We just moved \d+(\.\d+)?km are we warmer or colder\?/);
        });

        it("should fallback to [distance] if coordinates are missing", async () => {
            const result = await getQuestionShareText(
                { id: "hot/cold" },
                { latA: 0, lngA: 0 } // Missing B coordinates
            );
            expect(result).toBe("We just moved [distance]km are we warmer or colder?");
        });
    });

    describe("match", () => {
        it("should format same-neighbourhood with boundary name", async () => {
            vi.mocked(determineMatchBoundary).mockResolvedValueOnce({
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: { name: "Downtown" }
            });
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-neighbourhood" }
            );
            expect(result).toBe("Are we in the same Neighbourhood (Downtown)?");
        });

        it("should format same-neighbourhood fallback when determineMatchBoundary fails", async () => {
            vi.mocked(determineMatchBoundary).mockRejectedValueOnce(new Error("Network error"));
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-neighbourhood" }
            );
            expect(result).toBe("Are we in the same Neighbourhood?");
        });

        it("should format same-first-letter-neighbourhood with boundary name", async () => {
            vi.mocked(determineMatchBoundary).mockResolvedValueOnce({
                type: "Feature",
                geometry: { type: "Point", coordinates: [0, 0] },
                properties: { name: "Beltline" }
            });
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-first-letter-neighbourhood" }
            );
            expect(result).toBe("Does your Neighbourhood start with the same letter as ours (B)?");
        });

        it("should format same-first-letter-neighbourhood fallback when determineMatchBoundary fails", async () => {
            vi.mocked(determineMatchBoundary).mockRejectedValueOnce(new Error("Network error"));
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-first-letter-neighbourhood" }
            );
            expect(result).toBe("Does your Neighbourhood start with the same letter as ours?");
        });

        it("should format same-train-line", async () => {
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-train-line" }
            );
            expect(result).toBe("Are you on the same Line as us?");
        });

        it("should format same-length-station", async () => {
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-length-station" }
            );
            expect(result).toBe("Does your Station/Stop have the same length as ours?");
        });

        it("should format same-first-letter-station", async () => {
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "same-first-letter-station" }
            );
            expect(result).toBe("Does your Station/Stop start with the same letter as ours?");
        });

        it("should format generic place from PLACES config", async () => {
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "museum" }
            );
            expect(result).toBe("Are you near the same Museum as us?");
        });

        it("should format generic place not in PLACES config using id", async () => {
            const result = await getQuestionShareText(
                { id: "match" },
                { type: "unknown-place" }
            );
            expect(result).toBe("Are you near the same unknown-place as us?");
        });
    });

    describe("measure", () => {
        it("should format rail-measure with calculated distance", async () => {
            vi.mocked(calculateMeasureDistance).mockResolvedValueOnce(1.23456);
            const result = await getQuestionShareText(
                { id: "measure" },
                { type: "rail-measure" }
            );
            expect(result).toBe("We are 1.235km from a Train Station. Are you closer or further to your nearest Train Station?");
        });

        it("should format rail-measure fallback when calculation fails", async () => {
            vi.mocked(calculateMeasureDistance).mockRejectedValueOnce(new Error("Error"));
            const result = await getQuestionShareText(
                { id: "measure" },
                { type: "rail-measure" }
            );
            expect(result).toBe("We are [distance] from a Train Station. Are you closer or further to your nearest Train Station?");
        });

        it("should format rail-measure fallback when calculation is null", async () => {
            vi.mocked(calculateMeasureDistance).mockResolvedValueOnce(null);
            const result = await getQuestionShareText(
                { id: "measure" },
                { type: "rail-measure" }
            );
            expect(result).toBe("We are [distance] from a Train Station. Are you closer or further to your nearest Train Station?");
        });

        it("should format generic place with calculated distance", async () => {
            vi.mocked(calculateMeasureDistance).mockResolvedValueOnce(0.5);
            const result = await getQuestionShareText(
                { id: "measure" },
                { type: "hospital" }
            );
            expect(result).toBe("We are 0.5km from a Hospital. Are you closer or further to your nearest Hospital?");
        });
    });

    describe("closest", () => {
        it("should format closest question with plural label", async () => {
            const result = await getQuestionShareText(
                { id: "closest" },
                { locationType: "library" }
            );
            expect(result).toBe("Which of these Libraries is closest to you?");
        });

        it("should format closest question with id if place not found", async () => {
            const result = await getQuestionShareText(
                { id: "closest" },
                { locationType: "unknown-place" }
            );
            expect(result).toBe("Which of these unknown-place is closest to you?");
        });
    });

    describe("photo", () => {
        it("should prioritize notes if present", async () => {
            const result = await getQuestionShareText(
                { id: "photo" },
                { notes: "Take a picture of a red car" }
            );
            expect(result).toBe("Photo challenge: Take a picture of a red car");
        });

        it("should use description for known type if notes are missing", async () => {
            const result = await getQuestionShareText(
                { id: "photo" },
                { type: "tree" }
            );
            // using exact string from PHOTO_DESCRIPTIONS
            expect(result).toBe("Find and photograph the most unique or distinctive tree in your immediate vicinity.");
        });

        it("should fallback to generic description if type is unknown and notes are missing", async () => {
            const result = await getQuestionShareText(
                { id: "photo" },
                { type: "dragon" }
            );
            expect(result).toBe("Send us a photo of a dragon!");
        });
    });
});
