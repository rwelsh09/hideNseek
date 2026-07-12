import { useStore } from "@nanostores/react";
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
    Trees,
    Utensils,
    Waves,
} from "lucide-react";
import { useState } from "react";

import { SidebarContext } from "@/components/ui/sidebar-l";
import { addQuestion, leafletMapContext, questions, TIME_PENALTIES } from "@/lib/context";
import { PLACES } from "@/maps/placesConfig";

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

const IconMap: Record<string, React.ElementType> = {
    Palette,
    Hospital,
    Film,
    Library,
    Hamburger,
    Coffee,
    Beer,
    Train,
    MapIcon,
    Building2,
    Store,
    Flag,
};

export function AddQuestionDialog() {
    const [open, setOpen] = useState(false);
    const $questions = useStore(questions);
    const lockedTypes = {
        "hot/cold": $questions.some(q => q.id === "hot/cold" && !q.data.drag),
        "radar": $questions.some(q => q.id === "radius" && !q.data.drag),
        "match": $questions.some(q => q.id === "match" && !q.data.drag),
        "measure": $questions.some(q => q.id === "measure" && !q.data.drag),
        "closest": $questions.some(q => q.id === "closest" && !q.data.drag),
        "photo": $questions.some(q => q.id === "photo" && !q.data.drag),
    };

    const handleQuestionSelect = (type: string, detail?: string) => {
        const map = leafletMapContext.get();
        if (!map) return;
        const center = map.getCenter();
        const key = Math.random();

        let qId = type;
        let qData: any = { lat: center.lat, lng: center.lng, drag: true, doubledPenalty: lockedTypes[type as keyof typeof lockedTypes] || false };

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
                    className="w-full flex items-center justify-center gap-2 h-10"
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

                <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 sm:gap-6">
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
                                        +{TIME_PENALTIES["hot/cold"] * (lockedTypes["hot/cold"] ? 2 : 1)}
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
                                className={`bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["hot/cold"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["hot/cold"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-yellow-400 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-yellow-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["hot/cold"] ? "opacity-50 grayscale" : ""}`}
                            >
                                <HotCold className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                5km
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
                                        +{TIME_PENALTIES.radar * (lockedTypes["radar"] ? 2 : 1)}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["radar"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["radar"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["radar"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["radar"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["radar"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["radar"] ? "opacity-50 grayscale" : ""}`}
                            >
                                ????
                            </button>
                        </div>
                    </div>

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
                                        +{TIME_PENALTIES.match * (lockedTypes["match"] ? 2 : 1)}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            {PLACES.filter((place) => place.type !== "specific").map(
                                (place) => {
                                    const Icon = IconMap[place.icon];
                                    return (
                                        <button
                                            key={`match-${place.id}`}
                                            type="button"
                                            onClick={() =>
                                                handleQuestionSelect(
                                                    "match",
                                                    place.id,
                                                )
                                            }
                                            className={`bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["match"] ? "opacity-50 grayscale" : ""}`}
                                        >
                                            <Icon className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                            <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                                {place.label}
                                            </span>
                                        </button>
                                    );
                                },
                            )}
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
                                        +{TIME_PENALTIES.measure * (lockedTypes["measure"] ? 2 : 1)}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            {PLACES.filter((place) => place.type !== "specific").map(
                                (place) => {
                                    const Icon = IconMap[place.icon];
                                    return (
                                        <button
                                            key={`measure-${place.id}`}
                                            type="button"
                                            onClick={() =>
                                                handleQuestionSelect(
                                                    "measure",
                                                    place.id,
                                                )
                                            }
                                            className={`bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["measure"] ? "opacity-50 grayscale" : ""}`}
                                        >
                                            <Icon className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                            <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                                {place.label}
                                            </span>
                                        </button>
                                    );
                                },
                            )}
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
                                        +{TIME_PENALTIES.closest * (lockedTypes["closest"] ? 2 : 1)}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            {PLACES.map((place) => {
                                const Icon = IconMap[place.icon];
                                return (
                                    <button
                                        key={`closest-${place.id}`}
                                        type="button"
                                        aria-label={`Add closest question for ${place.id}`}
                                        title={`Add closest question for ${place.id}`}
                                        onClick={() =>
                                            handleQuestionSelect(
                                                "closest",
                                                place.id,
                                            )
                                        }
                                        className={`bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["closest"] ? "opacity-50 grayscale" : ""}`}
                                    >
                                        <Icon className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                        <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                            {place.label}
                                        </span>
                                    </button>
                                );
                            })}
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
                                        +{TIME_PENALTIES.photo * (lockedTypes["photo"] ? 2 : 1)}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${lockedTypes["photo"] ? "opacity-50 grayscale" : ""}`}
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
