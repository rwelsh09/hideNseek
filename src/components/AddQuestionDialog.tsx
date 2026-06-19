import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import {
    Camera,
    Landmark,
    Map as MapIcon,
    Network,
    Plane,
    Plus,
    Podium,
    Ruler,
    Target,
    Thermometer,
    TrainFront,
    TreePine,
    Waves,
} from "lucide-react";
import { useState } from "react";

import { SidebarContext } from "@/components/ui/sidebar-l";
import {
    addQuestion,
    leafletMapContext,
    softQuestionsChecked,
    TIME_PENALTIES,
} from "@/lib/context";
import { cn } from "@/lib/utils";

import {
    draftQuestionId,
    draftQuestionType,
    editingQuestionId,
} from "./DraggableMarkers";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";

export function AddQuestionDialog() {
    const [open, setOpen] = useState(false);
    const $softQuestionsChecked = useStore(softQuestionsChecked);

    const handleQuestionSelect = (type: string, detail?: string) => {
        const map = leafletMapContext.get();
        if (!map) return;
        const center = map.getCenter();
        const key = Math.random();

        let qId = type;
        let qData: any = { lat: center.lat, lng: center.lng, drag: true };

        // METRIC UPDATE: Changed all unit payloads to kilometers
        if (type === "radar") {
            qId = "radius";
            qData.radius = detail === "unknown" ? 5 : parseFloat(detail || "5");
            qData.unit = "kilometers";
            qData.within = true;
        } else if (type === "matching") {
            qData.type = detail || "airport";
            qData.same = true;
        } else if (type === "measuring") {
            qData.type = detail || "coastline";
            qData.hiderCloser = true;
        } else if (type === "thermometer") {
            const destination = turf.destination(
                [center.lng, center.lat],
                parseFloat(detail || "5"),
                90,
                { units: "kilometers" },
            );
            qData = {
                latA: center.lat,
                lngA: center.lng,
                latB: destination.geometry.coordinates[1],
                lngB: destination.geometry.coordinates[0],
                warmer: true,
                drag: true,
            };
        } else if (type === "tentacles") {
            qData.locationType = detail || "theme_park";
            qData.radius = 15;
            qData.unit = "kilometers";
        } else if (type === "photo") {
            qId = "radius";
            qData.radius = 0;
            qData.unit = "kilometers";
        }

        // Add to map immediately
        const _softKey = `${type}-${detail || ""}`.replace(/-$/, "");
        addQuestion({ id: qId as any, key, data: qData, _softKey });

        // Trigger the floating panel to open in DraggableMarkers
        editingQuestionId.set(key);
        draftQuestionId.set(key);
        draftQuestionType.set(type);

        // Close this grid menu instantly
        setOpen(false);

        // Force the mobile sidebar to close so the map is completely visible
        SidebarContext.get().setOpenMobile(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full flex items-center justify-center gap-2 py-6 text-lg rounded-none border-b border-border">
                    <Plus className="w-6 h-6" /> Add Question
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-6xl w-[95vw] sm:w-full bg-gray-100 p-0 flex flex-col max-h-[90dvh] rounded-lg overflow-hidden">
                <DialogHeader className="bg-red-600 p-3 sm:p-4 m-0 shrink-0">
                    <DialogTitle className="text-white text-center font-bold text-xl sm:text-2xl uppercase tracking-widest m-0">
                        Question Menu
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-6">
                    {/* MATCHING */}
                    <div className="flex flex-col border-t-4 border-slate-800 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-slate-800 p-1.5 rounded text-white shrink-0">
                                <MapIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 uppercase leading-none text-sm sm:text-base flex items-center">
                                    Matching{" "}
                                    <span className="ml-2 bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                        +{TIME_PENALTIES.matching}
                                    </span>
                                </h3>
                                <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                                    Draw 3, Pick 1
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                onClick={() =>
                                    handleQuestionSelect("matching", "airport")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "matching-airport",
                                )}
                                className={cn(
                                    "bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "matching-airport",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Plane className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("matching", "zone")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "matching-zone",
                                )}
                                className={cn(
                                    "bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "matching-zone",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <MapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "park-full",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "matching-park-full",
                                )}
                                className={cn(
                                    "bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "matching-park-full",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <TreePine className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "museum-full",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "matching-museum-full",
                                )}
                                className={cn(
                                    "bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "matching-museum-full",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>

                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "same-train-line",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "matching-same-train-line",
                                )}
                                className={cn(
                                    "bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "matching-same-train-line",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <TrainFront className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "letter-zone",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "matching-letter-zone",
                                )}
                                className={cn(
                                    "bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "matching-letter-zone",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <MapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "aquarium-full",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "matching-aquarium-full",
                                )}
                                className={cn(
                                    "bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "matching-aquarium-full",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Waves className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "custom-points",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "matching-custom-points",
                                )}
                                className={cn(
                                    "bg-slate-800 text-white flex justify-center items-center hover:bg-slate-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "matching-custom-points",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* MEASURING */}
                    <div className="flex flex-col border-t-4 border-green-600 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-green-600 p-1.5 rounded text-white shrink-0">
                                <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 uppercase leading-none text-sm sm:text-base flex items-center">
                                    Measuring{" "}
                                    <span className="ml-2 bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                        +{TIME_PENALTIES.measuring}
                                    </span>
                                </h3>
                                <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                                    Draw 3, Pick 1
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                onClick={() =>
                                    handleQuestionSelect("measuring", "airport")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "measuring-airport",
                                )}
                                className={cn(
                                    "bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "measuring-airport",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Plane className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "coastline",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "measuring-coastline",
                                )}
                                className={cn(
                                    "bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "measuring-coastline",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <MapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "park-full",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "measuring-park-full",
                                )}
                                className={cn(
                                    "bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "measuring-park-full",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <TreePine className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "museum-full",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "measuring-museum-full",
                                )}
                                className={cn(
                                    "bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "measuring-museum-full",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>

                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "rail-measure",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "measuring-rail-measure",
                                )}
                                className={cn(
                                    "bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "measuring-rail-measure",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <TrainFront className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("measuring", "city")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "measuring-city",
                                )}
                                className={cn(
                                    "bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "measuring-city",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <MapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "aquarium-full",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "measuring-aquarium-full",
                                )}
                                className={cn(
                                    "bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "measuring-aquarium-full",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Waves className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "custom-measure",
                                    )
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "measuring-custom-measure",
                                )}
                                className={cn(
                                    "bg-green-600 text-white flex justify-center items-center hover:bg-green-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "measuring-custom-measure",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>

                    {/* RADAR - Updated buttons for Kilometers */}
                    <div className="flex flex-col border-t-4 border-orange-500 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-orange-500 p-1.5 rounded text-white shrink-0">
                                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-500 uppercase leading-none text-sm sm:text-base flex items-center">
                                    Radar{" "}
                                    <span className="ml-2 bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                        +{TIME_PENALTIES.radar}
                                    </span>
                                </h3>
                                <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                                    Draw 2, Pick 1
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "0.5")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-0.5",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "radar-0.5",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                0.5 km
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "1")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-1",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes("radar-1") &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                1 km
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "2")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-2",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes("radar-2") &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                2 km
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "5")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-5",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes("radar-5") &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                5 km
                            </button>

                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "10")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-10",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "radar-10",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                10 km
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "15")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-15",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "radar-15",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                15 km
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "20")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-20",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "radar-20",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                20 km
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "30")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-30",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "radar-30",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                30 km
                            </button>

                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "50")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-50",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "radar-50",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                50 km
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("radar", "unknown")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "radar-unknown",
                                )}
                                className={cn(
                                    "bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "radar-unknown",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                ????
                            </button>
                        </div>
                    </div>

                    {/* THERMOMETER & TENTACLES COLUMN */}
                    <div className="flex flex-col gap-6">
                        {/* Thermometer - Updated buttons for Kilometers */}
                        <div className="flex flex-col border-t-4 border-yellow-400 pt-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="bg-yellow-400 p-1.5 rounded text-white shrink-0">
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-yellow-500 uppercase leading-none text-sm sm:text-base flex items-center">
                                        Thermometer{" "}
                                        <span className="ml-2 bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                            +{TIME_PENALTIES.thermometer}
                                        </span>
                                    </h3>
                                    <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                                        Draw 2, Pick 1
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                                <button
                                    onClick={() =>
                                        handleQuestionSelect("thermometer", "1")
                                    }
                                    disabled={$softQuestionsChecked.includes(
                                        "thermometer-1",
                                    )}
                                    className={cn(
                                        "bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col justify-center items-center hover:bg-yellow-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                        $softQuestionsChecked.includes(
                                            "thermometer-1",
                                        ) &&
                                            "opacity-30 cursor-not-allowed saturate-0",
                                    )}
                                >
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                    1km
                                </button>
                                <button
                                    onClick={() =>
                                        handleQuestionSelect("thermometer", "2")
                                    }
                                    disabled={$softQuestionsChecked.includes(
                                        "thermometer-2",
                                    )}
                                    className={cn(
                                        "bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col justify-center items-center hover:bg-yellow-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                        $softQuestionsChecked.includes(
                                            "thermometer-2",
                                        ) &&
                                            "opacity-30 cursor-not-allowed saturate-0",
                                    )}
                                >
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                    2km
                                </button>
                                <button
                                    onClick={() =>
                                        handleQuestionSelect("thermometer", "5")
                                    }
                                    disabled={$softQuestionsChecked.includes(
                                        "thermometer-5",
                                    )}
                                    className={cn(
                                        "bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col justify-center items-center hover:bg-yellow-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                        $softQuestionsChecked.includes(
                                            "thermometer-5",
                                        ) &&
                                            "opacity-30 cursor-not-allowed saturate-0",
                                    )}
                                >
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                    5km
                                </button>
                            </div>
                        </div>

                        {/* Tentacles */}
                        <div className="flex flex-col border-t-4 border-purple-600 pt-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="bg-purple-600 p-1.5 rounded text-white shrink-0">
                                    <Network className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-600 uppercase leading-none text-sm sm:text-base flex items-center">
                                        Tentacles{" "}
                                        <span className="ml-2 bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                            +{TIME_PENALTIES.tentacles}
                                        </span>
                                    </h3>
                                    <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                                        Draw 4, Pick 2
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                                <button
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "tentacles",
                                            "museum",
                                        )
                                    }
                                    disabled={$softQuestionsChecked.includes(
                                        "tentacles-museum",
                                    )}
                                    className={cn(
                                        "bg-purple-600 text-white flex justify-center items-center hover:bg-purple-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                        $softQuestionsChecked.includes(
                                            "tentacles-museum",
                                        ) &&
                                            "opacity-30 cursor-not-allowed saturate-0",
                                    )}
                                >
                                    <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <button
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "tentacles",
                                            "custom",
                                        )
                                    }
                                    disabled={$softQuestionsChecked.includes(
                                        "tentacles-custom",
                                    )}
                                    className={cn(
                                        "bg-purple-600 text-white flex justify-center items-center hover:bg-purple-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                        $softQuestionsChecked.includes(
                                            "tentacles-custom",
                                        ) &&
                                            "opacity-30 cursor-not-allowed saturate-0",
                                    )}
                                >
                                    <MapIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <button
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "tentacles",
                                            "theme_park",
                                        )
                                    }
                                    disabled={$softQuestionsChecked.includes(
                                        "tentacles-theme_park",
                                    )}
                                    className={cn(
                                        "bg-purple-600 text-white flex justify-center items-center hover:bg-purple-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                        $softQuestionsChecked.includes(
                                            "tentacles-theme_park",
                                        ) &&
                                            "opacity-30 cursor-not-allowed saturate-0",
                                    )}
                                >
                                    <Target className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <button
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "tentacles",
                                            "consulate",
                                        )
                                    }
                                    disabled={$softQuestionsChecked.includes(
                                        "tentacles-consulate",
                                    )}
                                    className={cn(
                                        "bg-purple-600 text-white flex justify-center items-center hover:bg-purple-700 aspect-square transition-colors rounded-sm sm:rounded-none",
                                        $softQuestionsChecked.includes(
                                            "tentacles-consulate",
                                        ) &&
                                            "opacity-30 cursor-not-allowed saturate-0",
                                    )}
                                >
                                    <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PHOTO */}
                    <div className="flex flex-col border-t-4 border-sky-400 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-sky-400 p-1.5 rounded text-white shrink-0">
                                <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sky-400 uppercase leading-none text-sm sm:text-base flex items-center">
                                    Photo{" "}
                                    <span className="ml-2 bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                        +{TIME_PENALTIES.photo}
                                    </span>
                                </h3>
                                <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
                                    Draw 1
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                onClick={() =>
                                    handleQuestionSelect("photo", "camera")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "photo-camera",
                                )}
                                className={cn(
                                    "bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "photo-camera",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("photo", "tree")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "photo-tree",
                                )}
                                className={cn(
                                    "bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "photo-tree",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <TreePine className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("photo", "train")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "photo-train",
                                )}
                                className={cn(
                                    "bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "photo-train",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <TrainFront className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("photo", "car")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "photo-car",
                                )}
                                className={cn(
                                    "bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "photo-car",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Podium className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("photo", "map")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "photo-map",
                                )}
                                className={cn(
                                    "bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "photo-map",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Waves className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect("photo", "landmark")
                                }
                                disabled={$softQuestionsChecked.includes(
                                    "photo-landmark",
                                )}
                                className={cn(
                                    "bg-sky-400 text-white flex justify-center items-center hover:bg-sky-500 aspect-square transition-colors rounded-sm sm:rounded-none",
                                    $softQuestionsChecked.includes(
                                        "photo-landmark",
                                    ) &&
                                        "opacity-30 cursor-not-allowed saturate-0",
                                )}
                            >
                                <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
