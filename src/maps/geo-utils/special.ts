export const lngLatToText = (coordinates: [number, number]) => {
    /**
     * @param coordinates - Should be in longitude, latitude order
     */
    return `${Math.abs(coordinates[1])}°${coordinates[1] >= 0 ? "N" : "S"}, ${Math.abs(coordinates[0])}°${coordinates[0] >= 0 ? "E" : "W"}`;
};

export const getFeatureProperties = (feature: any): Record<string, any> => {
    if (!feature) return {};

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
    return Array.isArray(props.lines) ? props.lines : [];
};

export const extractStationId = (stationPlace: any): string => {
    const props = getFeatureProperties(stationPlace);
    return props.id;
};
