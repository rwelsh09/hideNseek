import * as turf from "@turf/turf";

import {
    disabledStations,
    lockedActiveStationIds,
    lockedRecommendedStart,
    trainStations,
} from "@/lib/context";
import { extractStationId } from "@/maps/geo-utils";

export const getRecommendedStartCoords = (): [number, number] | null => {
    const $trainStations = trainStations.get();
    const $disabledStations = disabledStations.get();

    const activeStations = $trainStations.filter((station) => {
        const id = extractStationId(station);
        return id && !$disabledStations.includes(id);
    });

    if (activeStations.length === 0) return null;

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

    return centroid.geometry.coordinates as [number, number];
};

export const lockRecommendedStartIfNeeded = () => {
    if (!lockedRecommendedStart.get()) {
        const coords = getRecommendedStartCoords();
        if (coords) {
            lockedRecommendedStart.set(coords);

            const activeStations = trainStations.get().filter((station) => {
                const id = extractStationId(station);
                return id && !disabledStations.get().includes(id);
            });
            lockedActiveStationIds.set(
                activeStations.map((s) => extractStationId(s) as string),
            );
        }
    }
};
