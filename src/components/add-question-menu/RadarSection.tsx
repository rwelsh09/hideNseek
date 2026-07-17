import { Target } from "lucide-react";

import { TIME_PENALTIES } from "@/lib/context";

interface RadarSectionProps {
    handleQuestionSelect: (type: string, detail?: string) => void;
    isQuestionLocked: (type: string, detail?: string) => boolean;
}

export function RadarSection({
    handleQuestionSelect,
    isQuestionLocked,
}: RadarSectionProps) {
    return (
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
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2">
                <button
                    type="button"
                    aria-label="Add radar question for 0.5 km"
                    title="Add radar question for 0.5 km"
                    onClick={() => handleQuestionSelect("radar", "0.5")}
                    className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("radar", "0.5") ? "opacity-50 grayscale" : ""}`}
                >
                    0.5 km
                </button>
                <button
                    type="button"
                    aria-label="Add radar question for 1 km"
                    title="Add radar question for 1 km"
                    onClick={() => handleQuestionSelect("radar", "1")}
                    className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("radar", "1") ? "opacity-50 grayscale" : ""}`}
                >
                    1 km
                </button>
                <button
                    type="button"
                    aria-label="Add radar question for 2 km"
                    title="Add radar question for 2 km"
                    onClick={() => handleQuestionSelect("radar", "2")}
                    className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("radar", "2") ? "opacity-50 grayscale" : ""}`}
                >
                    2 km
                </button>
                <button
                    type="button"
                    aria-label="Add radar question for 5 km"
                    title="Add radar question for 5 km"
                    data-tutorial-id="tutorial-add-radar-5"
                    onClick={() => handleQuestionSelect("radar", "5")}
                    className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("radar", "5") ? "opacity-50 grayscale" : ""}`}
                >
                    5 km
                </button>
                <button
                    type="button"
                    aria-label="Add radar question for 10 km"
                    title="Add radar question for 10 km"
                    onClick={() => handleQuestionSelect("radar", "10")}
                    className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("radar", "10") ? "opacity-50 grayscale" : ""}`}
                >
                    10 km
                </button>
                <button
                    type="button"
                    aria-label="Add radar question for 15 km"
                    title="Add radar question for 15 km"
                    onClick={() => handleQuestionSelect("radar", "15")}
                    className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("radar", "15") ? "opacity-50 grayscale" : ""}`}
                >
                    15 km
                </button>
                <button
                    type="button"
                    aria-label="Add radar question for unknown size"
                    title="Add radar question for unknown size"
                    onClick={() => handleQuestionSelect("radar", "unknown")}
                    className={`bg-orange-500 text-white text-xs sm:text-sm font-bold flex justify-center items-center hover:bg-orange-600 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("radar", "unknown") ? "opacity-50 grayscale" : ""}`}
                >
                    ????
                </button>
            </div>
        </div>
    );
}
