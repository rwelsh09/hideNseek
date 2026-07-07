import { useStore } from "@nanostores/react";
import { type DragEndEvent, Icon } from "leaflet";
import { Target, X } from "lucide-react";
import { atom } from "nanostores";
import { useEffect, useMemo, useRef, useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { createPortal } from "react-dom";
import { Marker } from "react-leaflet";

import {
    hiderMode,
    questionModified,
    questions,
    triggerLocalRefresh,
} from "@/lib/context";
import type { ICON_COLORS } from "@/maps/api";

import { LatitudeLongitude } from "./LatLngPicker";
import {
    ClosestQuestionComponent,
    HotColdQuestionComponent,
    MatchQuestionComponent,
    MeasureQuestionComponent,
    PhotoQuestionComponent,
    RadiusQuestionComponent,
} from "./QuestionCards";
import { Button } from "./ui/button";
import { SidebarMenu } from "./ui/sidebar-l";

export const editingQuestionId = atom<number | null>(null);
export const draftQuestionId = atom<number | null>(null);
export const draftQuestionType = atom<string | null>(null);

let isDragging = false;

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

    useEffect(() => {
        handlersRef.current = { onChange, onClick };
    }, [onChange, onClick]);

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

    const positionArray = useMemo(
        () => [latitude, longitude] as [number, number],
        [latitude, longitude],
    );

    return (
        <Marker
            position={positionArray}
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
    const $editingId = useStore(editingQuestionId);
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
        if (activeQuestion) {
            if (draftQuestionId.get() === activeQuestion.key) {
                draftQuestionId.set(null);
                draftQuestionType.set(null);
                questionModified();
            } else {
                questionModified();
            }
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

                        hiderMode.set({ ...$hiderMode });
                    }}
                />
            )}
            {$questions.map((question) => {
                if (!question.data || !question.data.drag) return null;

                switch (question.id) {
                    case "radius":
                    case "closest":
                    case "match":
                    case "photo":
                    case "measure":
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
                    case "hot/cold":
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
                                    aria-label="Close panel"
                                    className="text-slate-300 hover:bg-slate-800 hover:text-white h-8 w-8 p-0 rounded-full"
                                    data-tutorial-id="tutorial-store-question-btn"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={closePanel}
                                aria-label="Close panel"
                                className="absolute right-2 top-2 z-10 text-slate-400 hover:bg-slate-800 hover:text-white h-8 w-8 p-0 rounded-full"
                                data-tutorial-id="tutorial-store-question-btn"
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
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "closest" && (
                                        <ClosestQuestionComponent
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "hot/cold" && (
                                        <HotColdQuestionComponent
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "match" && (
                                        <MatchQuestionComponent
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "measure" && (
                                        <MeasureQuestionComponent
                                            data={activeQuestion.data as any}
                                            questionKey={activeQuestion.key}
                                        />
                                    )}
                                    {activeQuestion.id === "photo" && (
                                        <PhotoQuestionComponent
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
                        </div>
                    </div>,
                    document.body,
                )}
        </Fragment>
    );
};
