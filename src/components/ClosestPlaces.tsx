import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import type { Feature, Point } from "geojson";
import React, { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import { Popup } from "react-leaflet";

import {
    hiderMode,
    liveUpdateMapEnabled,
    questionModified,
    questions,
} from "@/lib/context";
import { findClosestLocations } from "@/maps/api";
import type { Question } from "@/maps/schema";

import { Button } from "./ui/button";

export const ClosestPlaces = () => {
    const $questions = useStore(questions);

    const draggingClosest = $questions.filter(
        (q) => q.id === "closest" && q.data.drag,
    );

    return (
        <>
            {draggingClosest.map((q) => (
                <ClosestPlacesForQuestion key={q.key} question={q as any} />
            ))}
        </>
    );
};

const ClosestPlacesForQuestion = ({
    question,
}: {
    question: Extract<Question, { id: "closest" }>;
}) => {
    const [places, setPlaces] = useState<Feature<Point, any>[]>([]);
    const $hiderMode = useStore(hiderMode);

    useEffect(() => {
        let isMounted = true;
        findClosestLocations(question.data)
            .then((res) => {
                if (isMounted) {
                    setPlaces(res.features);
                }
            })
            .catch(() => {});
        return () => {
            isMounted = false;
        };
    }, [
        question.data.locationType,
        question.data.lat,
        question.data.lng,
        question.data.radius,
        question.data.unit,
        question.data.places,
    ]);

    const $liveUpdateMapEnabled = useStore(liveUpdateMapEnabled);

    if ($hiderMode && $liveUpdateMapEnabled) return null;

    const center = turf.point([question.data.lng, question.data.lat]);
    const filteredPlaces = places.filter((f) => {
        const coords =
            f?.geometry?.coordinates ??
            (f?.properties?.lon && f?.properties?.lat
                ? [f.properties?.lon, f.properties?.lat]
                : null);
        if (!coords) return false;
        if (!$liveUpdateMapEnabled) return true; // Show all places in playtest mode
        return (
            turf.distance(center, turf.point(coords), {
                units: question.data.unit,
            }) <= question.data.radius
        );
    });

    return (
        <>
            {filteredPlaces.map((f, i) => {
                const coords =
                    f?.geometry?.coordinates ??
                    (f?.properties?.lon && f?.properties?.lat
                        ? [f.properties?.lon, f.properties?.lat]
                        : null);
                if (!coords) return null;

                const isSelected =
                    question.data.location &&
                    question.data.location.properties?.id === f.properties?.id;

                return (
                    <ClosestPlaceMarker
                        key={i}
                        f={f}
                        coords={coords}
                        isSelected={isSelected}
                        question={question}
                    />
                );
            })}
        </>
    );
};

const PATH_OPTIONS_SELECTED = {
    color: "red",
    fillColor: "red",
    fillOpacity: 0.7,
};

const PATH_OPTIONS_UNSELECTED = {
    color: "blue",
    fillColor: "blue",
    fillOpacity: 0.7,
};

const TOOLTIP_OFFSET: [number, number] = [0, -10];

const ClosestPlaceMarker = ({
    f,
    coords,
    isSelected,
    question,
}: {
    f: Feature<Point, any>;
    coords: number[];
    isSelected: boolean | "" | 0 | null | undefined;
    question: Extract<Question, { id: "closest" }>;
}) => {
    const eventHandlers = React.useMemo(
        () => ({
            click: () => {
                question.data.location = f;
                questionModified();
            },
        }),
        [f, question],
    );

    const centerArray = React.useMemo(
        () => [coords[1], coords[0]] as [number, number],
        [coords[1], coords[0]],
    );

    return (
        <CircleMarker
            center={centerArray}
            radius={8}
            pathOptions={
                isSelected ? PATH_OPTIONS_SELECTED : PATH_OPTIONS_UNSELECTED
            }
            eventHandlers={eventHandlers}
        >
            {question.data.showLabels && (
                <Tooltip direction="top" offset={TOOLTIP_OFFSET} permanent>
                    {f.properties?.name || "Unknown Location"}
                </Tooltip>
            )}
            {!question.data.showLabels && (
                <Tooltip direction="top" offset={TOOLTIP_OFFSET}>
                    {f.properties?.name || "Unknown Location"}
                </Tooltip>
            )}
            <Popup>
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-sm">
                        {f.properties?.name || "Unknown Location"}
                    </span>
                    <Button
                        size="sm"
                        onClick={() => {
                            question.data.location = f;
                            questionModified();
                        }}
                        variant={isSelected ? "secondary" : "default"}
                    >
                        {isSelected ? "Selected" : "Select Location"}
                    </Button>
                </div>
            </Popup>
        </CircleMarker>
    );
};
