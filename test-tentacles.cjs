const turf = require("@turf/turf");

const centerPoint = turf.point([-114.0719, 51.0447]);
const radiusInMeters = 2000;

// Assume we have elements far away
const elements = [
    { lon: -114.0719, lat: 51.0447, tags: { name: "A" } }, // 0m
    { lon: -114.0819, lat: 51.0447, tags: { name: "B" } }, // ~700m
    { lon: -114.1719, lat: 51.0447, tags: { name: "C" } }, // ~7000m (outside)
];

const response = turf.featureCollection([]);
elements.forEach((element) => {
    if (!element.tags || !element.tags.name) return;
    const pt = turf.point([element.lon, element.lat]);
    const distance = turf.distance(centerPoint, pt, { units: "meters" });
    if (distance <= radiusInMeters) {
        response.features.push(turf.point([element.lon, element.lat], { name: element.tags.name }));
    }
});

console.log("Filtered points count:", response.features.length);
