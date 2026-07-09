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
