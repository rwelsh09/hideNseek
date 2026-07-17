import {
    Building2,
    Camera,
    Car,
    Church,
    Leaf,
    Route,
    Train,
    Trees,
    Utensils,
    Waves,
} from "lucide-react";

import { TIME_PENALTIES } from "@/lib/context";

interface PhotoSectionProps {
    handleQuestionSelect: (type: string, detail?: string) => void;
    isQuestionLocked: (type: string, detail?: string) => boolean;
}

export function PhotoSection({
    handleQuestionSelect,
    isQuestionLocked,
}: PhotoSectionProps) {
    return (
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
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2">
                <button
                    type="button"
                    aria-label="Add photo question for camera"
                    title="Add photo question for camera"
                    onClick={() => handleQuestionSelect("photo", "camera")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "camera") ? "opacity-50 grayscale" : ""}`}
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
                    onClick={() => handleQuestionSelect("photo", "tree")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "tree") ? "opacity-50 grayscale" : ""}`}
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
                    onClick={() => handleQuestionSelect("photo", "car")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "car") ? "opacity-50 grayscale" : ""}`}
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
                    onClick={() => handleQuestionSelect("photo", "building")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "building") ? "opacity-50 grayscale" : ""}`}
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
                    onClick={() => handleQuestionSelect("photo", "restaurant")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "restaurant") ? "opacity-50 grayscale" : ""}`}
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
                    onClick={() => handleQuestionSelect("photo", "park")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "park") ? "opacity-50 grayscale" : ""}`}
                >
                    <Trees className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                        Park
                    </span>
                </button>

                <button
                    type="button"
                    aria-label="Add photo question for place of worship"
                    title="Add photo question for place of worship"
                    onClick={() => handleQuestionSelect("photo", "worship")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "worship") ? "opacity-50 grayscale" : ""}`}
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
                    onClick={() => handleQuestionSelect("photo", "train")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "train") ? "opacity-50 grayscale" : ""}`}
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
                    onClick={() => handleQuestionSelect("photo", "route")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "route") ? "opacity-50 grayscale" : ""}`}
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
                    onClick={() => handleQuestionSelect("photo", "water")}
                    className={`bg-sky-400 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-sky-500 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("photo", "water") ? "opacity-50 grayscale" : ""}`}
                >
                    <Waves className="w-5 h-5 sm:w-5 sm:h-5 shrink-0" />
                    <span className="text-[9px] sm:text-[10px] leading-tight text-center w-full px-0.5 line-clamp-2">
                        Water
                    </span>
                </button>
            </div>
        </div>
    );
}
