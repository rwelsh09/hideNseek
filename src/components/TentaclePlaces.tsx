import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import React, { useEffect, useState } from "react";
import { CircleMarker, Tooltip } from "react-leaflet";
import { Popup } from "react-leaflet";

import { hiderMode, questionModified, questions } from "@/lib/context";
import { findTentacleLocations } from "@/maps/api";

import { Button } from "./ui/button";

export const TentaclePlaces = () => {
    const $questions = useStore(questions);

    const draggingTentacles = $questions.filter(
        (q) => q.id === "tentacles" && q.data.drag,
    );

    return (
        <>
            {draggingTentacles.map((q) => (
                <TentaclePlacesForQuestion key={q.key} question={q as any} />
            ))}
        </>
    );
};

const TentaclePlacesForQuestion = ({ question }: { question: any }) => {
    const [places, setPlaces] = useState<any[]>([]);
    const $hiderMode = useStore(hiderMode);

    useEffect(() => {
        let isMounted = true;
        if (question.data.locationType === "custom") {
            setPlaces(question.data.places || []);
        } else {
            findTentacleLocations(question.data).then((res) => {
                if (isMounted) {
                    setPlaces(res.features);
                }
            });
        }
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

    if ($hiderMode) return null;

    const center = turf.point([question.data.lng, question.data.lat]);
    const filteredPlaces = places.filter((f) => {
        const coords =
            f?.geometry?.coordinates ??
            (f?.properties?.lon && f?.properties?.lat
                ? [f.properties.lon, f.properties.lat]
                : null);
        if (!coords) return false;
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
                        ? [f.properties.lon, f.properties.lat]
                        : null);
                if (!coords) return null;

                const isSelected =
                    question.data.location &&
                    question.data.location.properties?.id === f.properties?.id;

                return (
                    <TentaclePlaceMarker
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

// Performance Optimization: Cache path options to prevent react-leaflet
// from re-triggering layer styling methods due to unstable object references on every render.
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

const TentaclePlaceMarker = ({
    f,
    coords,
    isSelected,
    question,
}: {
    f: any;
    coords: number[];
    isSelected: boolean | "" | 0 | null | undefined;
    question: any;
}) => {
    // Performance Optimization: Memoize eventHandlers so the object reference remains stable.
    // react-leaflet checks object equality for eventHandlers, and re-binds DOM events
    // if the reference changes, causing massive slowdowns when rendering many markers.
    const eventHandlers = React.useMemo(
        () => ({
            click: () => {
                question.data.location = f;
                questionModified();
            },
        }),
        [f, question],
    );

    return (
        <CircleMarker
            center={[coords[1], coords[0]]}
            radius={8}
            pathOptions={
                isSelected ? PATH_OPTIONS_SELECTED : PATH_OPTIONS_UNSELECTED
            }
            eventHandlers={eventHandlers}
        >
            {question.data.showLabels && (
                <Tooltip direction="top" offset={[0, -10]} permanent>
                    {f.properties?.name || "Unknown Location"}
                </Tooltip>
            )}
            {!question.data.showLabels && (
                <Tooltip direction="top" offset={[0, -10]}>
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
