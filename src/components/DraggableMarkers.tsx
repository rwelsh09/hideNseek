import { useStore } from "@nanostores/react";
import { type DragEndEvent, Icon } from "leaflet";
import { Target, X } from "lucide-react";
import { atom } from "nanostores";
import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { createPortal } from "react-dom";
import { Marker } from "react-leaflet";

import {
    autoSave,
    hiderMode,
    questionModified,
    questions,
    save,
    triggerLocalRefresh,
} from "@/lib/context";
import type { ICON_COLORS } from "@/maps/api";

import { LatitudeLongitude } from "./LatLngPicker";
import {
    MatchingQuestionComponent,
    MeasuringQuestionComponent,
    RadiusQuestionComponent,
    TentacleQuestionComponent,
    ThermometerQuestionComponent,
} from "./QuestionCards";
import { Button } from "./ui/button";
import { SidebarMenu } from "./ui/sidebar-l";

// Global state for which marker is currently being edited
export const editingQuestionId = atom<number | null>(null);
export const draftQuestionId = atom<number | null>(null);
export const draftQuestionType = atom<string | null>(null);

let isDragging = false;

// Cache icons to prevent unnecessary re-renders in react-leaflet by avoiding new object references
const iconCache: Partial<Record<keyof typeof ICON_COLORS, Icon>> = {};

const getIcon = (color: keyof typeof ICON_COLORS) => {
    if (!iconCache[color]) {
        iconCache[color] = new Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl:
                "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
        });
    }
    return iconCache[color];
};

const ColoredMarker = ({
    latitude,
    longitude,
    color,
    onChange,
    onClick,
}: {
    onChange: (event: DragEndEvent) => void;
    onClick: () => void;
    latitude: number;
    longitude: number;
    color: keyof typeof ICON_COLORS;
}) => {
    const handlersRef = useRef({ onChange, onClick });

    // Update refs without causing re-renders
    useEffect(() => {
        handlersRef.current = { onChange, onClick };
    }, [onChange, onClick]);

    // Memoize event handlers to prevent react-leaflet from constantly re-binding events
    // which negatively impacts performance when many markers are rendered.
    const eventHandlers = useMemo(
        () => ({
            dragstart: () => {
                isDragging = true;
            },
            dragend: (x: DragEndEvent) => {
                handlersRef.current.onChange(x);
                setTimeout(() => {
                    isDragging = false;
                }, 100);
            },
            click: () => {
                if (!isDragging) {
                    handlersRef.current.onClick();
                }
            },
        }),
        [],
    );

    return (
        <Marker
            position={[latitude, longitude]}
            icon={color ? getIcon(color) : undefined}
            draggable={true}
            eventHandlers={eventHandlers}
        />
    );
};

export const DraggableMarkers = () => {
    useStore(triggerLocalRefresh);
    const $questions = useStore(questions);
    const $hiderMode = useStore(hiderMode);
    const $autoSave = useStore(autoSave);
    const $editingId = useStore(editingQuestionId);
    const $draftQuestionId = useStore(draftQuestionId);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeQuestion =
        $editingId === -1 ? null : $questions.find((q) => q.key === $editingId);
    const isHiderActive = $editingId === -1 && $hiderMode !== false;

    const shouldShowPortal =
        mounted && $editingId !== null && (activeQuestion || isHiderActive);

    const closePanel = () => {
        if ($draftQuestionId === $editingId && activeQuestion) {
            questions.set(
                $questions.filter((q) => q.key !== activeQuestion.key),
            );
            draftQuestionId.set(null);
            draftQuestionType.set(null);
        }
        editingQuestionId.set(null);
    };

    const saveQuestion = () => {
        if (!activeQuestion) {
            editingQuestionId.set(null);
            return;
        }

        if (draftQuestionId.get() === activeQuestion.key) {
            // It's a draft! Save it but don't lock it.
            draftQuestionId.set(null);
            draftQuestionType.set(null);
            questionModified();
        } else {
            // Just saving changes for an existing question
            questionModified();
        }
        editingQuestionId.set(null);
    };

    return (
        <Fragment>
            {/* 1. RENDER MARKERS */}
            {$hiderMode !== false && (
                <ColoredMarker
                    color="green"
                    key="hider"
                    latitude={$hiderMode.latitude}
                    longitude={$hiderMode.longitude}
                    onClick={() => editingQuestionId.set(-1)}
                    onChange={(e) => {
                        $hiderMode.latitude =
                            e.target.getLatLng().lat ?? $hiderMode.latitude;
                        $hiderMode.longitude =
                            e.target.getLatLng().lng ?? $hiderMode.longitude;

                        if (autoSave.get()) {
                            hiderMode.set({ ...$hiderMode });
                        } else {
                            triggerLocalRefresh.set(Math.random());
                        }
                    }}
                />
            )}
            {$questions.map((question) => {
                if (!question.data || !question.data.drag) return null;
                if (
                    question.id === "matching" &&
                    question.data.type === "custom-zone"
                )
                    return null;

                switch (question.id) {
                    case "radius":
                    case "tentacles":
                    case "matching":
                    case "measuring":
                        return (
                            <ColoredMarker
                                color={question.data.color}
                                key={question.key}
                                latitude={question.data.lat}
                                longitude={question.data.lng}
                                onClick={() =>
                                    editingQuestionId.set(question.key)
                                }
                                onChange={(e) => {
                                    question.data.lat =
                                        e.target.getLatLng().lat;
                                    question.data.lng =
                                        e.target.getLatLng().lng;
                                    questionModified();
                                }}
                            />
                        );
                    case "thermometer":
                        return (
                            <Fragment key={question.key}>
                                <ColoredMarker
                                    color={question.data.colorA}
                                    key={"a" + question.key.toString()}
                                    latitude={question.data.latA}
                                    longitude={question.data.lngA}
                                    onClick={() =>
                                        editingQuestionId.set(question.key)
                                    }
                                    onChange={(e) => {
                                        question.data.latA =
                                            e.target.getLatLng().lat;
                                        question.data.lngA =
                                            e.target.getLatLng().lng;
                                        questionModified();
                                    }}
                                />
                                <ColoredMarker
                                    color={question.data.colorB}
                                    key={"b" + question.key.toString()}
                                    latitude={question.data.latB}
                                    longitude={question.data.lngB}
                                    onClick={() =>
                                        editingQuestionId.set(question.key)
                                    }
                                    onChange={(e) => {
                                        question.data.latB =
                                            e.target.getLatLng().lat;
                                        question.data.lngB =
                                            e.target.getLatLng().lng;
                                        questionModified();
                                    }}
                                />
                            </Fragment>
                        );
                    default:
                        return null;
                }
            })}

            {/* 2. RENDER THE GLOBAL FLOATING PANEL (Replaces the blocking Dialog) */}
            {shouldShowPortal &&
                typeof document !== "undefined" &&
                createPortal(
                    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[420px] z-[1040] pointer-events-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 flex flex-col max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
                        {isHiderActive ? (
                            <div className="bg-slate-950 px-5 py-3 flex items-center justify-between shrink-0 shadow-sm border-b border-slate-800">
                                <h2 className="text-white font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                                    <Target className="w-4 h-4 text-sky-400" />
                                    Hider Location
                                </h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closePanel}
                                    className="text-slate-300 hover:bg-slate-800 hover:text-white h-8 w-8 p-0 rounded-full"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={closePanel}
                                className="absolute right-2 top-2 z-10 text-slate-400 hover:bg-slate-800 hover:text-white h-8 w-8 p-0 rounded-full"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}

                        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 text-white">
                            {isHiderActive && (
                                <SidebarMenu>
                                    <LatitudeLongitude
                                        latitude={$hiderMode.latitude}
                                        longitude={$hiderMode.longitude}
                                        inlineEdit
                                        onChange={(latitude, longitude) => {
                                            hiderMode.set({
                                                latitude:
                                                    latitude ??
                                                    $hiderMode.latitude,
                                                longitude:
                                                    longitude ??
                                                    $hiderMode.longitude,
                                            });
                                        }}
                                        label="Hider Location"
                                    />
                                </SidebarMenu>
                            )}

                            {activeQuestion && (
                                <Fragment>
                                    {activeQuestion.id === "radius" && (
                                        <RadiusQuestionComponent
                                            isPreview={true}
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "tentacles" && (
                                        <TentacleQuestionComponent
                                            isPreview={true}
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "thermometer" && (
                                        <ThermometerQuestionComponent
                                            isPreview={true}
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "matching" && (
                                        <MatchingQuestionComponent
                                            isPreview={true}
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "measuring" && (
                                        <MeasuringQuestionComponent
                                            isPreview={true}
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                </Fragment>
                            )}

                            {isHiderActive && (
                                <Button
                                    onClick={() => {
                                        hiderMode.set(false);
                                        closePanel();
                                    }}
                                    variant="destructive"
                                    className="font-semibold font-poppins mt-2 w-full"
                                >
                                    Disable Hider Mode
                                </Button>
                            )}

                            {!$autoSave && (
                                <Button
                                    onClick={save}
                                    className="bg-blue-600 hover:bg-blue-500 font-semibold font-poppins w-full mt-2"
                                >
                                    Save Changes
                                </Button>
                            )}
                        </div>

                        <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0 flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.2)]">
                            <Button
                                type="button"
                                onClick={saveQuestion}
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
                            >
                                Save Question
                            </Button>
                        </div>
                    </div>,
                    document.body,
                )}
        </Fragment>
    );
};
