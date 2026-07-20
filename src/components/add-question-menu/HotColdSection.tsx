import { Thermometer as HotCold } from "lucide-react";

import { TIME_PENALTIES } from "@/lib/context";

interface HotColdSectionProps {
    handleQuestionSelect: (type: string, detail?: string) => void;
    isQuestionLocked: (type: string, detail?: string) => boolean;
}

export function HotColdSection({
    handleQuestionSelect,
    isQuestionLocked,
}: HotColdSectionProps) {
    return (
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
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2">
                <button
                    type="button"
                    aria-label="Add Hot/Cold question for 1 km"
                    title="Add Hot/Cold question for 1 km"
                    onClick={() => handleQuestionSelect("hot/cold", "1")}
                    className={`bg-rose-500 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-rose-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("hot/cold", "1") ? "opacity-50 grayscale" : ""}`}
                >
                    <HotCold className="w-4 h-4 sm:w-5 sm:h-5" /> 1km
                </button>
                <button
                    type="button"
                    aria-label="Add Hot/Cold question for 5 km"
                    title="Add Hot/Cold question for 5 km"
                    onClick={() => handleQuestionSelect("hot/cold", "5")}
                    className={`bg-rose-500 text-white text-[10px] sm:text-xs font-bold flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-rose-600 overflow-hidden aspect-square transition-colors rounded-sm sm:rounded-none ${isQuestionLocked("hot/cold", "5") ? "opacity-50 grayscale" : ""}`}
                >
                    <HotCold className="w-4 h-4 sm:w-5 sm:h-5" /> 5km
                </button>
            </div>
        </div>
    );
}
