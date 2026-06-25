export const QUESTION_RULES: Record<string, string> = {
    photo: "The Hider send a photo, chosen by the Seeker.",
    radius: "The Seeker places a circle on their location with a predefined radius. The Hider must answer whether their actual location is inside or outside of this circle.",
    thermometer:
        "The Seeker places one marker where they currently are then travels to where they want the second marker (at least the number of kilometers on the chosen thermometer). The Hider must reveal which if the Seeker is now Warmer (closer) or Colder (further0 from them.",
    tentacles:
        "Creates circles ('tentacles') around all locations of a specific category (e.g., all hospitals) within a set radius. The Hider reveals if they are inside the area and which place they are closest to.",
    measuring:
        "The Hider compares their distance to a specific type of feature (e.g., nearest library) against the Seeker location, answering if they are 'Closer' or 'Further'.",
    matching:
        "The Seeker and Hider compare a specific attribute of their locations (e.g., same neighbourhood, same train line). The Hider reveals if the attributes match ('Same') or not ('Different').",
};
