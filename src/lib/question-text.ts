import * as turf from "@turf/turf";

import { PHOTO_DESCRIPTIONS } from "@/components/cards/photo";
import { extractStationName } from "@/maps/geo-utils";
import { PLACES } from "@/maps/placesConfig";
import { determineMatchBoundary } from "@/maps/questions/match";
import { calculateMeasureDistance } from "@/maps/questions/measure";

export const TYPE_MAPPINGS: Record<string, string> = {
    ...Object.fromEntries(PLACES.map((p) => [p.id, p.label])),
    "same-neighbourhood": "Neighbourhood (Same As Me)",
    "same-first-letter-neighbourhood": "Neighbourhood (Same First Letter)",
    "same-first-letter-station": "Station Starts With Same Letter",
    "same-length-station": "Station Has Same Length",
    "same-train-line": "Station On Same Train Line",
    "rail-measure": "Train Station",
};

export const getPlaceLabel = (id: string, plural = false) => {
    const place = PLACES.find((p) => p.id === id);
    if (!place) return id;
    return plural && place.labelPlural ? place.labelPlural : place.label;
};

export interface QuestionTextHandler {
    getResultStr: (questionData: any) => string;
    getLockedLabel: (questionData: any, resultStr: string) => string;
    getShareText: (questionData: any) => Promise<string>;
}

export const QUESTION_TEXT_HANDLERS: Record<string, QuestionTextHandler> = {
    radar: {
        getResultStr: (data) => (data.within ? "Inside" : "Outside"),
        getLockedLabel: (data, result) =>
            `Radar - ${data.radius}${data.unit === "kilometers" ? "km" : "m"} - ${result}`,
        getShareText: async (data) =>
            `Are you within ${data.radius}${data.unit === "kilometers" ? "km" : "m"} of us?`,
    },
    "hot/cold": {
        getResultStr: (data) => (data.warmer ? "Warmer" : "Colder"),
        getLockedLabel: (data, result) => `Hot/Cold - ${result}`,
        getShareText: async (data) => {
            if (data.latA && data.lngA && data.latB && data.lngB) {
                const dist = turf.distance(
                    [data.lngA, data.latA],
                    [data.lngB, data.latB],
                    { units: "kilometers" },
                );
                const roundedDist = Math.round(dist * 100) / 100;
                return `We just moved ${roundedDist}km are we warmer or colder?`;
            }
            return `We just moved [distance]km are we warmer or colder?`;
        },
    },
    match: {
        getResultStr: (data) => {
            if (data.type === "same-length-station") {
                return data.lengthComparison === "shorter"
                    ? "Shorter"
                    : data.lengthComparison === "longer"
                      ? "Longer"
                      : "Same";
            }
            return data.same ? "Same" : "Different";
        },
        getLockedLabel: (data, result) => {
            const typeStr = TYPE_MAPPINGS[data.type] || data.type;
            return `Match - ${typeStr} - ${result}`;
        },
        getShareText: async (data) => {
            const type = data.type;

            if (
                type === "same-neighbourhood" ||
                type === "same-first-letter-neighbourhood"
            ) {
                try {
                    const boundary = await determineMatchBoundary(data);
                    const name = extractStationName(boundary);
                    if (name) {
                        if (type === "same-neighbourhood")
                            return `Are we in the same Neighbourhood (${name})?`;
                        return `Does your Neighbourhood start with the same letter as ours (${name[0].toUpperCase()})?`;
                    }
                } catch {
                    // Fallback
                }
                if (type === "same-neighbourhood")
                    return "Are we in the same Neighbourhood?";
                return "Does your Neighbourhood start with the same letter as ours?";
            }

            if (type === "same-train-line")
                return "Are you on the same Line as us?";
            if (type === "same-length-station")
                return "Does your Station/Stop have the same length as ours?";
            if (type === "same-first-letter-station")
                return "Does your Station/Stop start with the same letter as ours?";

            const label = getPlaceLabel(type);
            return `Are you near the same ${label} as us?`;
        },
    },
    measure: {
        getResultStr: (data) =>
            data.hiderCloser ? "Hider Closer" : "Hider Farther",
        getLockedLabel: (data, result) => {
            const typeStr = TYPE_MAPPINGS[data.type] || data.type;
            return `Measure - ${typeStr} - ${result}`;
        },
        getShareText: async (data) => {
            const type = data.type;
            let distanceStr = "[distance]";

            try {
                const distance = await calculateMeasureDistance(data);
                if (distance !== null) {
                    const rounded = Math.round(distance * 1000) / 1000;
                    distanceStr = `${rounded}km`;
                }
            } catch {
                // Ignore and use fallback
            }

            if (type === "rail-measure") {
                return `We are ${distanceStr} from a Train Station. Are you closer to or farther from your nearest Train Station?`;
            }
            const label = getPlaceLabel(type);
            return `We are ${distanceStr} from a ${label}. Are you closer to or farther from your nearest ${label}?`;
        },
    },
    closest: {
        getResultStr: (data) =>
            data.location ? data.location.properties?.name : "None",
        getLockedLabel: (data, result) => {
            const typeStr =
                TYPE_MAPPINGS[data.locationType] || data.locationType;
            return `Closest - ${typeStr} - ${result}`;
        },
        getShareText: async (data) => {
            const labelPlural = getPlaceLabel(data.locationType, true);
            return `Which of these ${labelPlural} is closest to you?`;
        },
    },
    photo: {
        getResultStr: () => "",
        getLockedLabel: () => "Photo", // Overridden in base.tsx with notes/label logic
        getShareText: async (data) => {
            if (data.notes) return `Photo challenge: ${data.notes}`;
            return (
                PHOTO_DESCRIPTIONS[data.type] ||
                `Send us a photo of a ${data.type}!`
            );
        },
    },
};

export const getQuestionShareText = async (
    question: any,
    questionData: any,
): Promise<string> => {
    if (!question) return "Incoming question from a Seeker!";

    const handler = QUESTION_TEXT_HANDLERS[question.id];
    if (handler) {
        return handler.getShareText(questionData);
    }

    return "Incoming question from a Seeker!";
};
