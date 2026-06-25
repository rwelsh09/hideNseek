export const QUESTION_RULES: Record<string, string> = {
    photo: "Seekers request a photograph from the Hider's current perspective. The photo must accurately represent their location without being intentionally misleading.",
    radius: "Seekers select a transit station and a specific distance (e.g., 3km). The Hider must answer 'Yes' or 'No' to whether their Anchor Station falls within that radius.",
    thermometer:
        "Seekers select two different transit stations. The Hider must reveal which of the two stations is geographically closer to their Anchor Station.",
    tentacles:
        "Seekers select multiple transit stations. The webapp mathematically divides the entire game map into distinct regions (Voronoi polygons) originating from those stations. The Hider must reveal which 'tentacle' (region) contains their Anchor Station.",
    measuring:
        "Seekers ask for the exact distance between a specific transit station and the Hider's Anchor Station.",
    matching:
        "Seekers ask an attribute-based question about the Hider's Anchor Station (e.g., 'Does your station's name start with a vowel?', 'Is your station on the Red Line?').",
};
