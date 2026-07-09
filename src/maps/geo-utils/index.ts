import * as turf from "@turf/turf";
export * from "./operators";
export * from "./special";

export const getFeatureCoords = (feature: any) => {
    let coords = null;
    if (feature?.geometry?.type === 'Polygon' || feature?.geometry?.type === 'MultiPolygon' || feature?.geometry?.type === 'LineString' || feature?.geometry?.type === 'MultiLineString') {
        coords = [
            feature.properties?.lon ?? feature.properties?.center?.lon ?? feature.center?.lon,
            feature.properties?.lat ?? feature.properties?.center?.lat ?? feature.center?.lat
        ];
        if (coords[0] == null || coords[1] == null) {
            // First check if bounds are available as they often represent the center bounding box in Overpass
            if (feature.properties?.bounds) {
                const b = feature.properties.bounds;
                coords = [(b.minlon + b.maxlon) / 2, (b.minlat + b.maxlat) / 2];
            } else {
                const center = turf.center(feature);
                if (center?.geometry?.coordinates) {
                    coords = center.geometry.coordinates;
                }
            }
        }
    } else {
        coords = feature?.geometry?.coordinates ?? (feature?.properties?.lon && feature?.properties?.lat ? [feature.properties.lon, feature.properties.lat] : null);
    }

    if (coords && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        return coords;
    }
    return null;
}
