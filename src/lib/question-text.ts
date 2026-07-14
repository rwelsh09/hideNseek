import * as turf from "@turf/turf";
import { PLACES } from "@/maps/placesConfig";

export const getQuestionShareText = (question: any, questionData: any) => {
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
                // Round to 1 decimal place if needed, or 2
                const roundedDist = Math.round(dist * 100) / 100;
                return `We just moved ${roundedDist}km are we warmer or colder?`;
            }
            return `We just moved [distance]km are we warmer or colder?`;

        case "match": {
            const type = questionData.type;
            if (type === "same-neighbourhood") return "Are we in the same Neighbourhood?";
            if (type === "same-first-letter-neighbourhood") return "Does your Neighbourhood start with the same letter as ours ([letter])?";
            if (type === "same-train-line") return "Are you on the same Train Line as us ([line])?";
            if (type === "same-first-letter-station") return "Does your Train Station start with the same letter as ours ([letter])?";

            const label = getPlaceLabel(type);
            return `Is your closest ${label} also [answer]?`;
        }

        case "measure": {
            const type = questionData.type;
            if (type === "rail-measure") {
                return `We are [distance] from a Train Station. Are you closer or further to your nearest Train Station?`;
            }
            const label = getPlaceLabel(type);
            return `We are [distance] from a ${label}. Are you closer or further to your nearest ${label}?`;
        }

        case "closest": {
            const labelPlural = getPlaceLabel(questionData.locationType, true);
            return `Which of these ${labelPlural} is closest to you?`;
        }

        case "photo": {
            if (questionData.notes) return `Photo challenge: ${questionData.notes}`;
            return `Send us a photo of a ${questionData.type}!`;
        }

        default:
            return "Incoming question from a Seeker!";
    }
};
