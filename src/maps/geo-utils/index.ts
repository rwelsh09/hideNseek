export * from "./operators";
export * from "./special";

export const getFeatureCoords = (feature: any) => {
    let coords = null;
    if (feature?.geometry?.type === 'Polygon' || feature?.geometry?.type === 'MultiPolygon') {
        coords = [feature.properties?.lon ?? feature.center?.lon, feature.properties?.lat ?? feature.center?.lat];
    } else {
        coords = feature?.geometry?.coordinates ?? (feature?.properties?.lon && feature?.properties?.lat ? [feature.properties.lon, feature.properties.lat] : null);
    }

    if (coords && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        return coords;
    }
    return null;
}

export const fastDistance = (c1: [number, number], c2: [number, number], units: "kilometers" | "miles" | "meters"): number => {
    const DEG_TO_RAD = Math.PI / 180;
    const EARTH_RADIUS = units === "miles" ? 3958.7613 : (units === "meters" ? 6371008.8 : 6371.0088);

    const lat1 = c1[1] * DEG_TO_RAD;
    const lon1 = c1[0] * DEG_TO_RAD;
    const lat2 = c2[1] * DEG_TO_RAD;
    const lon2 = c2[0] * DEG_TO_RAD;

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS * c;
};
