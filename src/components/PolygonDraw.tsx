import { useStore } from "@nanostores/react";
import _ from "lodash";
import { Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";

import {
    autoSave,
    drawingQuestionKey,
    questionModified,
    questions,
    save,
} from "@/lib/context";
import { lngLatToText } from "@/maps/geo-utils";
import type { CustomTentacleQuestion, Question } from "@/maps/schema";

import { LatitudeLongitude } from "./LatLngPicker";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import { Input } from "./ui/input";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "./ui/sidebar-l";

const TentacleMarker = ({
    point,
    onDelete,
    onDragEnd,
}: {
    point: CustomTentacleQuestion["places"][number];
    onDelete: () => void;
    onDragEnd: (lat: number, lng: number) => void;
}) => {
    const $autoSave = useStore(autoSave);
    const [open, setOpen] = useState(false);
    const markerRef = useRef<any>(null);

    const eventHandlers = useMemo(
        () => ({
            click: () => {
                setOpen(true);
            },
            dragend: () => {
                const marker = markerRef.current;
                if (marker) {
                    const { lat, lng } = marker.getLatLng();
                    onDragEnd(lat, lng);
                }
            },
        }),
        [onDragEnd],
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Marker
                ref={markerRef}
                draggable={true}
                // @ts-expect-error This is passed to options, so it is not typed
                properties={point.properties}
                position={[
                    point.geometry.coordinates[1],
                    point.geometry.coordinates[0],
                ]}
                eventHandlers={eventHandlers}
            />
            <DialogContent>
                <div className="flex flex-col gap-2">
                    <Input
                        className="text-center !text-2xl font-bold font-poppins mt-3"
                        value={point.properties?.name}
                        onChange={(e) => {
                            point.properties.name = e.target.value;
                            questionModified();
                        }}
                    />
                    <SidebarMenu>
                        <LatitudeLongitude
                            latitude={point.geometry.coordinates[1]}
                            longitude={point.geometry.coordinates[0]}
                            inlineEdit
                            onChange={(lat, lng) => {
                                if (lat) {
                                    point.geometry.coordinates[1] = lat;
                                }
                                if (lng) {
                                    point.geometry.coordinates[0] = lng;
                                }

                                questionModified();
                            }}
                        />
                        <SidebarMenuItem className="mt-2 flex gap-2">
                            {!$autoSave && (
                                <SidebarMenuButton
                                    className="bg-blue-600 p-2 rounded-md font-semibold font-poppins transition-shadow duration-500"
                                    onClick={save}
                                >
                                    Save
                                </SidebarMenuButton>
                            )}
                            <Button
                                variant="destructive"
                                className="w-full flex items-center justify-center gap-2"
                                onClick={() => {
                                    setOpen(false);
                                    onDelete();
                                }}
                            >
                                <Trash2 size={16} /> Delete Marker
                            </Button>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export const PolygonDraw = () => {
    const $drawingQuestionKey = useStore(drawingQuestionKey);
    const $questions = useStore(questions);

    let question: Question | undefined;

    if ($drawingQuestionKey !== -1) {
        question = $questions.find((q) => q.key === $drawingQuestionKey);

        if (question?.data.drag === false) {
            drawingQuestionKey.set(-1);
        }
    }

    useMapEvents({
        click(e) {
            if (
                question &&
                question.id === "tentacles" &&
                question.data.locationType === "custom"
            ) {
                const newPlace = {
                    type: "Feature" as const,
                    geometry: {
                        type: "Point" as const,
                        coordinates: [e.latlng.lng, e.latlng.lat],
                    },
                    properties: {
                        name: lngLatToText([e.latlng.lng, e.latlng.lat]),
                    },
                };

                question.data.places.push(newPlace);
                question.data.places = _.uniqBy(question.data.places, (x) =>
                    x.geometry.coordinates.join(","),
                );

                questionModified();
            }
        },
    });

    const handleDelete = (index: number) => {
        if (
            question &&
            question.id === "tentacles" &&
            question.data.locationType === "custom"
        ) {
            question.data.places.splice(index, 1);
            questionModified();
        }
    };

    const handleDragEnd = (index: number, lat: number, lng: number) => {
        if (
            question &&
            question.id === "tentacles" &&
            question.data.locationType === "custom"
        ) {
            question.data.places[index].geometry.coordinates = [lng, lat];
            questionModified();
        }
    };

    return (
        <>
            {question &&
                question.id === "tentacles" &&
                question.data.locationType === "custom" &&
                question.data.places.map((x, i) => (
                    <TentacleMarker
                        key={x.geometry.coordinates.join(",")}
                        point={x}
                        onDelete={() => handleDelete(i)}
                        onDragEnd={(lat, lng) => handleDragEnd(i, lat, lng)}
                    />
                ))}
        </>
    );
};
