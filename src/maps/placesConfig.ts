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
    { id: "dog_park", label: "Dog Park", labelPlural: "Dog Parks", icon: "Dog", tag: "leisure", type: "specific", specificLocation: '["leisure"="dog_park"]' },
    { id: "pizza", label: "Pizza Place", labelPlural: "Pizza Places", icon: "Pizza", tag: "cuisine", type: "specific", specificLocation: '["cuisine"="pizza"]' },
    { id: "subway", label: "Subway", labelPlural: "Subways", icon: "Sandwich", tag: "amenity", type: "specific", specificLocation: '["brand:wikidata"="Q248556"]' },
    { id: "starbucks", label: "Starbucks", labelPlural: "Starbucks", icon: "Coffee", tag: "amenity", type: "specific", specificLocation: '["brand:wikidata"="Q37158"]' },
    { id: "fountain", label: "Fountain", labelPlural: "Fountains", icon: "Waves", tag: "amenity", type: "specific", specificLocation: '["amenity"="fountain"]' },
    { id: "toilet", label: "Public Toilet", labelPlural: "Public Toilets", icon: "Toilet", tag: "amenity", type: "specific", specificLocation: '["amenity"="toilets"]' },
] as const;

export type PlaceId = typeof PLACES[number]["id"];
