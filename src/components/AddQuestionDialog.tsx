import * as turf from "@turf/turf";
import {
    Beer,
    Building2,
    Camera,
    Car,
    Church,
    Coffee,
    Film,
    Flag,
    Hamburger,
    Hospital,
    Leaf,
    Library,
    Map as MapIcon,
    MapPinned,
    Network,
    Palette,
    Plus,
    Route,
    Ruler,
    ShoppingCart,
    Store,
    Target,
    Thermometer as HotCold,
    Train,
    TramFront,
    Trees,
    Utensils,
    Waves,
} from "lucide-react";
import { useState } from "react";

import { SidebarContext } from "@/components/ui/sidebar-l";
import { addQuestion, leafletMapContext, TIME_PENALTIES } from "@/lib/context";

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
            qData.color = "orange";
        } else if (type === "match") {
            qData.type = detail || "museum";
            qData.same = true;
            qData.color = "red";
        } else if (type === "measure") {
            qData.type = detail || "museum";
            qData.hiderCloser = true;
            qData.color = "green";
        } else if (type === "hot/cold") {
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
                colorA: "gold",
                colorB: "blue",
            };
        } else if (type === "closest") {
            qData.locationType = detail || "museum";
            qData.radius = 2;
            qData.unit = "kilometers";
            qData.color = "violet";
        } else if (type === "photo") {
            qId = "photo";
            qData.notes = "";
            qData.type = detail || "camera";
            qData.color = "blue";
        }

        // Add to map immediately
        addQuestion({ id: qId as any, key, data: qData });

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
                <Button
                    className="w-full flex items-center justify-center gap-2 h-11"
                    data-tutorial-id="add-question-btn"
                >
                    <Plus className="w-5 h-5" /> Add Question
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-6xl w-[95vw] sm:w-full bg-card p-0 flex flex-col max-h-[90dvh] rounded-xl overflow-hidden shadow-xl border">
                <DialogHeader className="bg-slate-800 p-4 m-0 shrink-0 border-b border-slate-700">
                    <DialogTitle className="text-white text-center font-bold text-xl uppercase tracking-wider m-0">
                        Question Menu
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-6">
                    {/* MATCH */}
                    <div className="flex flex-col border-t-4 border-red-500 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-red-500 p-1.5 rounded text-white shrink-0">
                                <MapIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-500 uppercase leading-none text-sm sm:text-base flex items-center">
                                    Match{" "}
                                    <span className="ml-2 bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                        +{TIME_PENALTIES.match}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("match", "museum")
                                }
                                className="bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Palette className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Museum
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("match", "hospital")
                                }
                                className="bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Hospital className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Hospital
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("match", "cinema")
                                }
                                className="bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Film className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Cinema
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("match", "library")
                                }
                                className="bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Library className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Library
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("match", "golf_course")
                                }
                                className="bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Flag className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Golf
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect(
                                        "match",
                                        "same-neighbourhood",
                                    )
                                }
                                className="bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <MapPinned className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Community
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect(
                                        "match",
                                        "same-train-line",
                                    )
                                }
                                className="bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <TramFront className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Transit
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* MEASURE */}
                    <div className="flex flex-col border-t-4 border-green-600 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-green-600 p-1.5 rounded text-white shrink-0">
                                <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-600 uppercase leading-none text-sm sm:text-base flex items-center">
                                    Measure{" "}
                                    <span className="ml-2 bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                        +{TIME_PENALTIES.measure}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("measure", "museum")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Palette className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Museum
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("measure", "hospital")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Hospital className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Hospital
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("measure", "cinema")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Film className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Cinema
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("measure", "library")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Library className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Library
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measure",
                                        "golf_course",
                                    )
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Flag className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Golf
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("measure", "mcdonalds")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Hamburger className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    McDonald&apos;s
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect("measure", "seven11")
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Store className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    7-Eleven
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measure",
                                        "rail-measure",
                                    )
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <TramFront className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Transit
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* RADAR */}
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
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                type="button"
                                aria-label="Add radar question for 0.5 km"
                                title="Add radar question for 0.5 km"
                                onClick={() =>
                                    handleQuestionSelect("radar", "0.5")
                                }
                                className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                0.5 km
                            </button>
                            <button
                                type="button"
                                aria-label="Add radar question for 1 km"
                                title="Add radar question for 1 km"
                                onClick={() =>
                                    handleQuestionSelect("radar", "1")
                                }
                                className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                1 km
                            </button>
                            <button
                                type="button"
                                aria-label="Add radar question for 2 km"
                                title="Add radar question for 2 km"
                                onClick={() =>
                                    handleQuestionSelect("radar", "2")
                                }
                                className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                2 km
                            </button>
                            <button
                                type="button"
                                aria-label="Add radar question for 5 km"
                                title="Add radar question for 5 km"
                                data-tutorial-id="tutorial-add-radar-5"
                                onClick={() =>
                                    handleQuestionSelect("radar", "5")
                                }
                                className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                5 km
                            </button>

                            <button
                                type="button"
                                aria-label="Add radar question for 10 km"
                                title="Add radar question for 10 km"
                                onClick={() =>
                                    handleQuestionSelect("radar", "10")
                                }
                                className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                10 km
                            </button>
                            <button
                                type="button"
                                aria-label="Add radar question for unknown size"
                                title="Add radar question for unknown size"
                                onClick={() =>
                                    handleQuestionSelect("radar", "unknown")
                                }
                                className="bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                ????
                            </button>
                        </div>
                    </div>

                    {/* THERMOMETER & CLOSEST COLUMN */}
                    <div className="flex flex-col gap-6">
                        {/* HotCold */}
                        <div className="flex flex-col border-t-4 border-yellow-400 pt-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="bg-yellow-400 p-1.5 rounded text-white shrink-0">
                                    <HotCold className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-yellow-500 uppercase leading-none text-sm sm:text-base flex items-center">
                                        Hot/Cold{" "}
                                        <span className="ml-2 bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                            +{TIME_PENALTIES["hot/cold"]}
                                        </span>
                                    </h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                                <button
                                    type="button"
                                    aria-label="Add hotCold question for 1 km"
                                    title="Add hotCold question for 1 km"
                                    onClick={() =>
                                        handleQuestionSelect("hot/cold", "1")
                                    }
                                    className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <HotCold className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                    1km
                                </button>
                                <button
                                    type="button"
                                    aria-label="Add hotCold question for 2 km"
                                    title="Add hotCold question for 2 km"
                                    onClick={() =>
                                        handleQuestionSelect("hot/cold", "2")
                                    }
                                    className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <HotCold className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                    2km
                                </button>
                                <button
                                    type="button"
                                    aria-label="Add hotCold question for 5 km"
                                    title="Add hotCold question for 5 km"
                                    onClick={() =>
                                        handleQuestionSelect("hot/cold", "5")
                                    }
                                    className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <HotCold className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                    5km
                                </button>
                            </div>
                        </div>

                        {/* Closest */}
                        <div className="flex flex-col border-t-4 border-purple-600 pt-3">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="bg-purple-600 p-1.5 rounded text-white shrink-0">
                                    <Network className="w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-purple-600 uppercase leading-none text-sm sm:text-base flex items-center">
                                        Closest{" "}
                                        <span className="ml-2 bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                            +{TIME_PENALTIES.closest}
                                        </span>
                                    </h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "closest",
                                            "museum",
                                        )
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Palette className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Museum
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "closest",
                                            "hospital",
                                        )
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Hospital className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Hospital
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "closest",
                                            "cinema",
                                        )
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Film className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Cinema
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "closest",
                                            "library",
                                        )
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Library className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Library
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "closest",
                                            "mcdonalds",
                                        )
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Hamburger className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        McDonald&apos;s
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "closest",
                                            "seven11",
                                        )
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Store className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        7-Eleven
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "closest",
                                            "timhortons",
                                        )
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Coffee className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Tim&apos;s
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleQuestionSelect("closest", "pub")
                                    }
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Beer className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Pub
                                    </span>
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
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                type="button"
                                aria-label="Add photo question for camera"
                                title="Add photo question for camera"
                                onClick={() =>
                                    handleQuestionSelect("photo", "camera")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Camera className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Selfie
                                </span>
                            </button>
                            <button
                                type="button"
                                aria-label="Add photo question for tree"
                                title="Add photo question for tree"
                                onClick={() =>
                                    handleQuestionSelect("photo", "tree")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Leaf className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Tree
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for car"
                                title="Add photo question for car"
                                onClick={() =>
                                    handleQuestionSelect("photo", "car")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Car className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Street
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for building"
                                title="Add photo question for building"
                                onClick={() =>
                                    handleQuestionSelect("photo", "building")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Building2 className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Tallest
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for restaurant"
                                title="Add photo question for restaurant"
                                onClick={() =>
                                    handleQuestionSelect("photo", "restaurant")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Utensils className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Restaurant
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for park"
                                title="Add photo question for park"
                                onClick={() =>
                                    handleQuestionSelect("photo", "park")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Trees className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Park
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for store"
                                title="Add photo question for store"
                                onClick={() =>
                                    handleQuestionSelect("photo", "store")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <ShoppingCart className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Store
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for place of worship"
                                title="Add photo question for place of worship"
                                onClick={() =>
                                    handleQuestionSelect("photo", "worship")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Church className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Worship
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for train platform"
                                title="Add photo question for train platform"
                                onClick={() =>
                                    handleQuestionSelect("photo", "train")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Train className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Platform
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for route"
                                title="Add photo question for route"
                                onClick={() =>
                                    handleQuestionSelect("photo", "route")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Route className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Crossing
                                </span>
                            </button>

                            <button
                                type="button"
                                aria-label="Add photo question for body of water"
                                title="Add photo question for body of water"
                                onClick={() =>
                                    handleQuestionSelect("photo", "water")
                                }
                                className="bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Waves className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Water
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
