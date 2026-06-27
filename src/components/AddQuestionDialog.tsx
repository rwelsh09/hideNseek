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
    Hospital,
    Landmark,
    Leaf,
    Library,
    Map as MapIcon,
    MapPin,
    MapPinned,
    Network,
    Palette,
    Plus,
    Route,
    Ruler,
    ShoppingCart,
    Target,
    Thermometer,
    Train,
    TramFront,
    Trees,
    Utensils,
    Waypoints,
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
        } else if (type === "matching") {
            qData.type = detail || "museum-full";
            qData.same = true;
        } else if (type === "measuring") {
            qData.type = detail || "museum-full";
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
            qData.locationType = detail || "museum";
            qData.radius = 2;
            qData.unit = "kilometers";
        } else if (type === "photo") {
            qId = "photo";
            qData.notes = "";
            qData.type = detail || "camera";
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
                    className="w-full flex items-center justify-center gap-2 py-6 text-lg rounded-none border-b border-border"
                    data-tutorial-id="add-question-btn"
                >
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
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "museum-full",
                                    )
                                }
                                className="bg-slate-800 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-slate-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Palette className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Museum
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "hospital-full",
                                    )
                                }
                                className="bg-slate-800 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-slate-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Hospital className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Hospital
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "cinema-full",
                                    )
                                }
                                className="bg-slate-800 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-slate-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Film className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Cinema
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "library-full",
                                    )
                                }
                                className="bg-slate-800 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-slate-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Library className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Library
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "golf_course-full",
                                    )
                                }
                                className="bg-slate-800 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-slate-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Flag className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Golf
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "same-neighbourhood",
                                    )
                                }
                                className="bg-slate-800 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-slate-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <MapPinned className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Community
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "matching",
                                        "same-train-line",
                                    )
                                }
                                className="bg-slate-800 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-slate-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <TramFront className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Transit
                                </span>
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
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "museum-full",
                                    )
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Palette className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Museum
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "hospital-full",
                                    )
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Hospital className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Hospital
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "cinema-full",
                                    )
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Film className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Cinema
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "library-full",
                                    )
                                }
                                className="bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                            >
                                <Library className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Library
                                </span>
                            </button>
                            <button
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
                                        "golf_course-full",
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
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measuring",
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
                                </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                                <button
                                    type="button"
                                    aria-label="Add thermometer question for 1 km"
                                    title="Add thermometer question for 1 km"
                                    onClick={() =>
                                        handleQuestionSelect("thermometer", "1")
                                    }
                                    className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                    1km
                                </button>
                                <button
                                    type="button"
                                    aria-label="Add thermometer question for 2 km"
                                    title="Add thermometer question for 2 km"
                                    onClick={() =>
                                        handleQuestionSelect("thermometer", "2")
                                    }
                                    className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Thermometer className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                    2km
                                </button>
                                <button
                                    type="button"
                                    aria-label="Add thermometer question for 5 km"
                                    title="Add thermometer question for 5 km"
                                    onClick={() =>
                                        handleQuestionSelect("thermometer", "5")
                                    }
                                    className="bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
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
                                    className="bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none"
                                >
                                    <Palette className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                        Museum
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "tentacles",
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
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "tentacles",
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
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "tentacles",
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
                                    onClick={() =>
                                        handleQuestionSelect(
                                            "tentacles",
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
                                    onClick={() =>
                                        handleQuestionSelect("tentacles", "pub")
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
                                    Unique Tree
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
                                    Widest Street
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
                                    Tallest Bldg
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
                                    Store Aisle
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
                                    Train Plat.
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
                                    Intersection
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
