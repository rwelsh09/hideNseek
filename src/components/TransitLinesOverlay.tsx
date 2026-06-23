import { useStore } from "@nanostores/react";
import type { FeatureCollection } from "geojson";
import React from "react";
import { GeoJSON } from "react-leaflet";

import transitLinesData from "@/data/calgary_transit_lines_clean.json";
import { displayTransitLines } from "@/lib/context";

const styleFeature = (feature: any) => {
    return {
        color: feature?.properties?.color || "#e11d48", // fallback to a red if not specified
        weight: 5,
        opacity: 0.8,
    };
};

export const TransitLinesOverlay = () => {
    const $displayTransitLines = useStore(displayTransitLines);

    if (!$displayTransitLines) {
        return null;
    }

    return (
        <GeoJSON
            data={transitLinesData as FeatureCollection}
            style={styleFeature}
        />
    );
};
