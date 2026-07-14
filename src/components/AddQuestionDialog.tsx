import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import {
    Building2,
    Camera,
    Car,
    Church,
    Leaf,
    Map as MapIcon,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    MapPinned,
    Network,
    Plus,
    Route,
    Ruler,
    ShoppingCart,
    Target,
    Thermometer as HotCold,
    Train,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    TramFront,
    Trees,
    Utensils,
    Waves,
} from "lucide-react";
import * as icons from "lucide-react";
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


export function AddQuestionDialog({ iconOnly = false }: { iconOnly?: boolean }) {
    const [open, setOpen] = useState(false);

    const $questions = useStore(questions);
    const isQuestionLocked = (type: string, detail?: string) => {
        return $questions.some(q => {
            if (!q.data.locked) return false;

            if (type === "radar" && q.id === "radar") {
                const isCustom = detail === "unknown";
                if (isCustom) return q.data.isCustom === true;
                const radius = parseFloat(detail || "5");
                return q.data.radius === radius && !q.data.isCustom;
            }
            if (type === "hot/cold" && q.id === "hot/cold") {
                if (!q.data.lngA || !q.data.latA || !q.data.lngB || !q.data.latB) return false;
                const dist = turf.distance([q.data.lngA, q.data.latA], [q.data.lngB, q.data.latB], { units: "kilometers" });
                const detailDist = parseFloat(detail || "5");
                return Math.abs(dist - detailDist) < 0.1;
            }
            if (type === "match" && q.id === "match") {
                return q.data.type === (detail || "museum");
            }
            if (type === "measure" && q.id === "measure") {
                return q.data.type === (detail || "museum");
            }
            if (type === "closest" && q.id === "closest") {
                return q.data.locationType === (detail || "museum");
            }
            if (type === "photo" && q.id === "photo") {
                return q.data.type === (detail || "camera");
            }
            return false;
        });
    };

    const handleQuestionSelect = (type: string, detail?: string) => {
        const map = leafletMapContext.get();
        if (!map) return;
        const center = map.getCenter();
        const key = Math.random();

        let qId = type;
        let qData: any = { lat: center.lat, lng: center.lng, locked: false, doubledPenalty: isQuestionLocked(type, detail) };

        // METRIC UPDATE: Changed all unit payloads to kilometers
        if (type === "radar") {
            qId = "radar";
            qData.radius = detail === "unknown" ? 5 : parseFloat(detail || "5");
            qData.isCustom = detail === "unknown";
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
                locked: false,
                colorA: "gold",
                colorB: "blue",
                doubledPenalty: isQuestionLocked(type, detail),
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
                    className={iconOnly ? "flex items-center justify-center gap-2 h-10 w-10 p-0" : "w-full flex items-center justify-center gap-2 h-10"}
                    data-tutorial-id="add-question-btn"
                >
                    <Plus className="w-5 h-5" /> {!iconOnly && "Add Question"}
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
                    <div className="flex flex-col border-t-4 border-rose-500 pt-3">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-rose-500 p-1.5 rounded text-white shrink-0">
                                <HotCold className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-rose-600 uppercase leading-none text-sm sm:text-base flex items-center">
                                    Hot/Cold{" "}
                                    <span className="ml-2 bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                                        +{TIME_PENALTIES["hot/cold"]}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2">
                            <button
                                type="button"
                                aria-label="Add hotCold question for 1 km"
                                title="Add hotCold question for 1 km"
                                onClick={() =>
                                    handleQuestionSelect("hot/cold", "1")
                                }
                                className={`bg-rose-500 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-rose-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("hot/cold", "1") ? "opacity-50 grayscale" : ""}`}
                            >
                                <HotCold className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
                                1km
                            </button>
                            <button
                                type="button"
                                aria-label="Add hotCold question for 5 km"
                                title="Add hotCold question for 5 km"
                                onClick={() =>
                                    handleQuestionSelect("hot/cold", "5")
                                }
                                className={`bg-rose-500 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-rose-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("hot/cold", "5") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("radar", "0.5") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("radar", "1") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("radar", "2") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("radar", "5") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("radar", "10") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("radar", "unknown") ? "opacity-50 grayscale" : ""}`}
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
                                        +{TIME_PENALTIES.match}
                                    </span>
                                </h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
                            {PLACES.filter((place) => place.type !== "specific").map(
                                (place) => {
                                    const Icon = icons[place.icon as keyof typeof icons];
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
                                            className={`bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("match", place.id) ? "opacity-50 grayscale" : ""}`}
                                        >
                                            <Icon className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                            <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                                {place.label}
                                            </span>
                                        </button>
                                    );
                                },
                            )}
                            {[
                                { id: "same-neighbourhood", label: "Nhbd (Same)", icon: MapIcon },
                                { id: "same-first-letter-neighbourhood", label: "Nhbd (Letter)", icon: MapIcon },
                                { id: "same-train-line", label: "Station (Line)", icon: Train },
                                { id: "same-first-letter-station", label: "Station (Letter)", icon: Train },
                            ].map((place) => {
                                const Icon = place.icon;
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
                                        className={`bg-red-500 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-red-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("match", place.id) ? "opacity-50 grayscale" : ""}`}
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
                            {PLACES.filter((place) => place.type !== "specific").map(
                                (place) => {
                                    const Icon = icons[place.icon as keyof typeof icons];
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
                                            className={`bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("measure", place.id) ? "opacity-50 grayscale" : ""}`}
                                        >
                                            <Icon className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                            <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                                {place.label}
                                            </span>
                                        </button>
                                    );
                                },
                            )}
                            <button
                                type="button"
                                onClick={() =>
                                    handleQuestionSelect(
                                        "measure",
                                        "rail-measure",
                                    )
                                }
                                className={`bg-green-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-green-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("measure", "rail-measure") ? "opacity-50 grayscale" : ""}`}
                            >
                                <Train className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                    Station
                                </span>
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
                            {PLACES.filter((place) => place.type === "specific").map(
                                (place) => {
                                    const Icon = icons[place.icon as keyof typeof icons];
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
                                            className={`bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("closest", place.id) ? "opacity-50 grayscale" : ""}`}
                                        >
                                            <Icon className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                                            <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                                                {place.label}
                                            </span>
                                        </button>
                                    );
                                }
                            )}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "camera") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "tree") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "car") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "building") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "restaurant") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "park") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "store") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "worship") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "train") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "route") ? "opacity-50 grayscale" : ""}`}
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
                                className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("photo", "water") ? "opacity-50 grayscale" : ""}`}
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
