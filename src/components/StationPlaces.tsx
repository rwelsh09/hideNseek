import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import React, { useMemo } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";

import { questionFinishedMapData, trainStations } from "@/lib/context";
import { extractStationLabel } from "@/maps/geo-utils";

export const StationPlaces = () => {
    const stations = useStore(trainStations);
    const $questionFinishedMapData = useStore(questionFinishedMapData);

    const stationElements = useMemo(() => {
        if (!stations || stations.length === 0) return null;

        return stations.map((station, i) => {
            const coords = station.geometry.coordinates as [number, number];
            const name =
                extractStationLabel(station.properties) || "Unknown Station";

            const transitType = station.properties?.transit_type;

            let color = "blue";
            if (transitType === "CTrain Station") {
                color = "red";
            } else if (transitType === "MAX Station") {
                color = "blue";
            } else if (transitType === "CTrain & MAX Hub") {
                color = "purple";
            } else {
                color = "green";
            }

            let isEliminated = false;

            if ($questionFinishedMapData) {
                const point = turf.point(coords);
                let inside = false;

                const features = $questionFinishedMapData.features || [
                    $questionFinishedMapData,
                ];

                for (const feature of features) {
                    if (
                        feature.geometry.type === "Polygon" ||
                        feature.geometry.type === "MultiPolygon"
                    ) {
                        if (turf.booleanPointInPolygon(point, feature as any)) {
                            inside = true;
                            break;
                        }
                    }
                }

                isEliminated = !inside;
            }

            const opacity = isEliminated ? 0.2 : 1;
            const fillOpacity = isEliminated ? 0.2 : 0.8;

            return (
                <CircleMarker
                    key={i}
                    center={[coords[1], coords[0]]}
                    radius={5}
                    pathOptions={{
                        color: color,
                        fillColor: color,
                        opacity: opacity,
                        fillOpacity: fillOpacity,
                    }}
                >
                    <Tooltip direction="top" offset={[0, -10]}>
                        {name}
                    </Tooltip>
                </CircleMarker>
            );
        });
    }, [stations, $questionFinishedMapData]);

    return <>{stationElements}</>;
};
