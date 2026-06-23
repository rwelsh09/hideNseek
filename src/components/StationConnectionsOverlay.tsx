import { useStore } from "@nanostores/react";
import type { FeatureCollection } from "geojson";
import React from "react";
import { GeoJSON } from "react-leaflet";

import stationConnectionsData from "@/data/calgary_station_connections.json";
import { displayStationConnections } from "@/lib/context";

const styleFeature = (feature: any) => {
    return {
        color: feature?.properties?.color || "#000000",
        weight: 3,
        opacity: 0.6,
        dashArray: "10, 10", // Make it a dashed line to distinguish from the actual transit lines overlay
    };
};

export const StationConnectionsOverlay = () => {
    const $displayStationConnections = useStore(displayStationConnections);

    if (!$displayStationConnections) {
        return null;
    }

    return (
        <GeoJSON
            data={stationConnectionsData as FeatureCollection}
            style={styleFeature}
        />
    );
};
