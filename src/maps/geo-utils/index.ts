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

export const fastDistance = (c1: [number, number], c2: [number, number], units: "kilometers" | "miles"): number => {
    const R = units === "kilometers" ? 6371 : 3959;
    const dLat = (c2[1] - c1[1]) * Math.PI / 180;
    const dLon = (c2[0] - c1[0]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(c1[1] * Math.PI / 180) * Math.cos(c2[1] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}
