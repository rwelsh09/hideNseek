import { useStore } from "@nanostores/react";
import type { Feature, Point } from "geojson";
import React, { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";

import { questionModified, questions } from "@/lib/context";
import { findClosestLocations } from "@/maps/api";
import { getFeatureCoords } from "@/maps/geo-utils";
import type { Question } from "@/maps/schema";

export const ClosestPlaces = () => {
    const $questions = useStore(questions);

    const draggingClosest = $questions.filter(
        (q) => q.id === "closest" && !q.data.locked,
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

    const filteredPlaces = places.filter((f) => {
        const coords = getFeatureCoords(f);
        if (!coords) return false;
        return true; // Show all places in playtest mode
    });

    return (
        <>
            {filteredPlaces.map((f, i) => {
                const coords = getFeatureCoords(f);
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
            <Tooltip direction="top" offset={TOOLTIP_OFFSET}>
                {f.properties?.name || "Unknown Location"}
            </Tooltip>
        </CircleMarker>
    );
};
