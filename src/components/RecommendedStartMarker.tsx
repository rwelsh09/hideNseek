import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import L from "leaflet";
import React, { useMemo } from "react";
import { Marker, Tooltip } from "react-leaflet";

import {
    disabledStations,
    lockedRecommendedStart,
    showRecommendedStart,
    trainStations,
} from "@/lib/context";
import { extractStationId } from "@/maps/geo-utils";

const TOOLTIP_OFFSET: [number, number] = [0, -10];

// Create a custom icon for the recommended start point
const startIcon = L.icon({
    iconUrl:
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
            <path d="m12 10 2 2"></path>
            <path d="m12 10-2-2"></path>
        </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    tooltipAnchor: [0, -32],
});

export const RecommendedStartMarker: React.FC = () => {
    const $showRecommendedStart = useStore(showRecommendedStart);
    const $lockedRecommendedStart = useStore(lockedRecommendedStart);
    const $trainStations = useStore(trainStations);
    const $disabledStations = useStore(disabledStations);

    const centerPoint = useMemo(() => {
        if (!$showRecommendedStart || $trainStations.length === 0) return null;

        // If it's already locked, return the locked coordinates
        if ($lockedRecommendedStart) {
            return turf.point($lockedRecommendedStart as [number, number]);
        }

        // Filter out disabled stations
        const activeStations = $trainStations.filter((station) => {
            const id = extractStationId(station);
            return id && !$disabledStations.includes(id);
        });

        if (activeStations.length === 0) return null;

        // Create a FeatureCollection of active station points
        const points = activeStations
            .filter(
                (station) =>
                    station.properties?.geometry &&
                    station.properties.geometry.type === "Point",
            )
            .map((station) => {
                return turf.point(
                    station.properties.geometry.coordinates as [number, number],
                );
            });

        if (points.length === 0) return null;

        const featureCollection = turf.featureCollection(points);
        const centroid = turf.centroid(featureCollection);

        return centroid;
    }, [$showRecommendedStart, $trainStations, $disabledStations, $lockedRecommendedStart]);

    if (!centerPoint) return null;

    const [lng, lat] = centerPoint.geometry.coordinates;

    // Memoize the position array to prevent React-Leaflet from unnecessary re-renders
    const positionArray = useMemo(() => [lat, lng] as [number, number], [lat, lng]);

    return (
        <Marker position={positionArray} icon={startIcon}>
            <Tooltip
                direction="top"
                offset={TOOLTIP_OFFSET}
                opacity={0.9}
                permanent
                className="font-bold shadow-md bg-primary text-primary-foreground border-none px-3 py-1.5"
            >
                Recommended Starting Point
            </Tooltip>
        </Marker>
    );
};
