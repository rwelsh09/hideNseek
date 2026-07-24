import { getFeatureCoords } from "./index";

export const lngLatToText = (coordinates: [number, number]) => {
    /**
     * @param coordinates - Should be in longitude, latitude order
     */
    return `${Math.abs(coordinates[1])}°${coordinates[1] >= 0 ? "N" : "S"}, ${Math.abs(coordinates[0])}°${coordinates[0] >= 0 ? "E" : "W"}`;
};

export const getFeatureProperties = (feature: any): Record<string, any> => {
    if (!feature) return {};

    if (feature.properties?.tags) {
        return feature.properties.tags;
    }

    if (feature.properties?.properties) {
        return {
            ...feature.properties,
            ...feature.properties.properties
        };
    }

    if (feature.properties) {
        return feature.properties;
    }

    return feature;
};

export const extractStationName = (stationPlace: any) => {
    const props = getFeatureProperties(stationPlace);
    return props["name:en"] || props.name;
};

export const extractStationLabel = (stationPlace: any) =>
    extractStationName(stationPlace) ||
    lngLatToText(stationPlace.geometry.coordinates);

export const extractStationLines = (stationPlace: any): string[] => {
    const props = getFeatureProperties(stationPlace);
    if (Array.isArray(props.lines)) {
        return props.lines;
    }
    return (props.route_ref || props.ref || "").split(/[;,]/).map((r: string) => r.trim()).filter(Boolean);
};

export const extractStationId = (stationPlace: any): string | undefined => {
    const props = getFeatureProperties(stationPlace);

    const explicitId = props["@id"] || props.id || stationPlace.id;
    if (explicitId) return explicitId as string;

    const coords = getFeatureCoords(stationPlace);
    if (coords && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        return `${coords[1]},${coords[0]}`;
    }

    // Try to handle nested feature structures (e.g. Turf circle enclosing original Point feature)
    if (props.geometry?.coordinates) {
        const nestedCoords = props.geometry.coordinates;
        if (nestedCoords && typeof nestedCoords[0] === 'number' && typeof nestedCoords[1] === 'number') {
            return `${nestedCoords[1]},${nestedCoords[0]}`;
        }
    }

    return undefined;
};
