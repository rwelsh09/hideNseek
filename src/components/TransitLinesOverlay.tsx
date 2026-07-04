import { useStore } from "@nanostores/react";
import type { FeatureCollection } from "geojson";
import React, { useEffect, useState } from "react";
import { GeoJSON } from "react-leaflet";

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
    const [transitLinesData, setTransitLinesData] = useState<FeatureCollection | null>(null);

    useEffect(() => {
        let mounted = true;
        if ($displayTransitLines && !transitLinesData) {
            import("@/data/calgary_transit_lines_clean.json").then((module) => {
                if (mounted) {
                    setTransitLinesData(module.default as FeatureCollection);
                }
            });
        }
        return () => {
            mounted = false;
        };
    }, [$displayTransitLines, transitLinesData]);

    if (!$displayTransitLines || !transitLinesData) {
        return null;
    }

    return (
        <GeoJSON
            data={transitLinesData}
            style={styleFeature}
        />
    );
};
