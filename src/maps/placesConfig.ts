export const PLACES = [
    { id: "museum", label: "Museum", labelPlural: "Museums", icon: "Palette", tag: "tourism", type: "generic" },
    { id: "hospital", label: "Hospital", labelPlural: "Hospitals", icon: "Hospital", tag: "amenity", type: "generic" },
    { id: "cinema", label: "Cinema", labelPlural: "Movie Theaters", icon: "Film", tag: "amenity", type: "generic" },
    { id: "library", label: "Library", labelPlural: "Libraries", icon: "Library", tag: "amenity", type: "generic" },
    { id: "fire_station", label: "Fire Station", labelPlural: "Fire Stations", icon: "Flame", tag: "amenity", type: "generic" },
    { id: "school", label: "School", labelPlural: "Schools", icon: "School", tag: "amenity", type: "generic" },
    { id: "mcdonalds", label: "McDonald's", labelPlural: "McDonald's", icon: "Hamburger", tag: "amenity", type: "specific", specificLocation: '["brand:wikidata"="Q38076"]' },
    { id: "seven11", label: "7-Eleven", labelPlural: "7-Elevens", icon: "Store", tag: "amenity", type: "specific", specificLocation: '["brand:wikidata"="Q259340"]' },
    { id: "timhortons", label: "Tim Hortons", labelPlural: "Tim Hortons", icon: "Coffee", tag: "amenity", type: "specific", specificLocation: '["brand:wikidata"="Q175106"]' },
    { id: "pub", label: "Pub / Bar", labelPlural: "Pubs / Bars", icon: "Beer", tag: "amenity", type: "specific", specificLocation: '["amenity"~"^(pub|bar)$"]' },
    { id: "pizza", label: "Pizza Place", labelPlural: "Pizza Places", icon: "Pizza", tag: "cuisine", type: "specific", specificLocation: '["cuisine"="pizza"]' },
] as const;
