import * as turf from "@turf/turf";
import { PLACES } from "@/maps/placesConfig";
import { determineMatchBoundary } from "@/maps/questions/match";
import { calculateMeasureDistance } from "@/maps/questions/measure";
import { extractStationName } from "@/maps/geo-utils";
import { PHOTO_DESCRIPTIONS } from "@/components/cards/photo";

export const getQuestionShareText = async (question: any, questionData: any): Promise<string> => {
    if (!question) return "Incoming question from a Seeker!";

    const getPlaceLabel = (id: string, plural = false) => {
        const place = PLACES.find((p) => p.id === id);
        if (!place) return id;
        return plural && place.labelPlural ? place.labelPlural : place.label;
    };

    switch (question.id) {
        case "radar":
            return `Are you within ${questionData.radius}${questionData.unit === "kilometers" ? "km" : "m"} of us?`;

        case "hot/cold":
            if (questionData.latA && questionData.lngA && questionData.latB && questionData.lngB) {
                const dist = turf.distance(
                    [questionData.lngA, questionData.latA],
                    [questionData.lngB, questionData.latB],
                    { units: "kilometers" }
                );
                const roundedDist = Math.round(dist * 100) / 100;
                return `We just moved ${roundedDist}km are we warmer or colder?`;
            }
            return `We just moved [distance]km are we warmer or colder?`;

        case "match": {
            const type = questionData.type;

            if (type === "same-neighbourhood" || type === "same-first-letter-neighbourhood") {
                try {
                    const boundary = await determineMatchBoundary(questionData);
                    const name = extractStationName(boundary);
                    if (name) {
                        if (type === "same-neighbourhood") return `Are we in the same Neighbourhood (${name})?`;
                        return `Does your Neighbourhood start with the same letter as ours (${name[0].toUpperCase()})?`;
                    }
                } catch (e) {
                    // Fallback
                }
                if (type === "same-neighbourhood") return "Are we in the same Neighbourhood?";
                return "Does your Neighbourhood start with the same letter as ours?";
            }

            if (type === "same-train-line") return "Are you on the same Line as us?";
            if (type === "same-length-station") return "Does your Station/Stop have the same length as ours?";
            if (type === "same-first-letter-station") return "Does your Station/Stop start with the same letter as ours?";

            const label = getPlaceLabel(type);
            return `Are you near the same ${label} as us?`;
        }

        case "measure": {
            const type = questionData.type;
            let distanceStr = "[distance]";

            try {
                const distance = await calculateMeasureDistance(questionData);
                if (distance !== null) {
                    // Round to 3 decimal places
                    const rounded = Math.round(distance * 1000) / 1000;
                    distanceStr = `${rounded}km`;
                }
            } catch (e) {
                // Ignore and use fallback
            }

            if (type === "rail-measure") {
                return `We are ${distanceStr} from a Train Station. Are you closer or further to your nearest Train Station?`;
            }
            const label = getPlaceLabel(type);
            return `We are ${distanceStr} from a ${label}. Are you closer or further to your nearest ${label}?`;
        }

        case "closest": {
            const labelPlural = getPlaceLabel(questionData.locationType, true);
            return `Which of these ${labelPlural} is closest to you?`;
        }

        case "photo": {
            if (questionData.notes) return `Photo challenge: ${questionData.notes}`;
            return PHOTO_DESCRIPTIONS[questionData.type] || `Send us a photo of a ${questionData.type}!`;
        }

        default:
            return "Incoming question from a Seeker!";
    }
};
