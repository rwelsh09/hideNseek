// Used in the `Rules` page & for `How it works` on the Question card
export const QUESTION_RULES: Record<string, string> = {
   "hot/cold":
        "Seekers travel a specific distance (e.g., 1km) providing the Hider with their starting and end point. The Hider must reveal if the Seekers are now Warmer (closer) or Colder (further) to the Hider's position.",
    radar: "Seekers select a specific distance (e.g., 5km) to project a Radar from their current location. The Hider must answer 'Yes' or 'No' to whether their location falls within that Radar.",
    match: "Seekers ask if the Hider's location shares a specific attribute with them (e.g., 'Does your station's name start with the same letter as ours?', 'Is your nearest Library the same as ours?').",
    measure:
        "Seekers ask for if the Hider is closer or further to a specific type of place (e.g. Hospitals) than they are.",
    closest:
        "Seekers select a category. The webapp mathematically divides the map into distinct regions originating from the 5 closest locations to the Seekers' marker. The Hider must reveal which 'closest' (region) contains their location.",
    photo: "Seekers request a photograph from the Hider's current perspective. The photo must accurately represent their location without being intentionally misleading. The Hider may edit the photo to blackout words.",
};
