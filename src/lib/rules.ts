export const QUESTION_RULES: Record<string, string> = {
    photo: "The Hider takes a photo of their surroundings and provides it as a clue. The Seeker must identify the location shown in the photo.",
    radius: "The Seeker places a circle on the map. The Hider must answer whether their actual location is inside or outside of this circle.",
    thermometer:
        "The Seeker places two markers. The Hider must reveal which of the two markers they are closer to (often used to see if the Seeker is getting 'Warmer').",
    tentacles:
        "Creates circles ('tentacles') around all locations of a specific category (e.g., all hospitals). The Hider reveals if they are inside any of these circles.",
    measuring:
        "The Seeker places a marker. The Hider compares their distance to a specific type of feature (e.g., nearest library) against the marker's distance, answering if they are 'Closer' or 'Further'.",
    matching:
        "The Seeker and Hider compare a specific attribute of their locations (e.g., same neighbourhood, same train line). The Hider reveals if the attributes match ('Same') or not ('Different').",
};
