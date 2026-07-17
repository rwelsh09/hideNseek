import * as icons from "lucide-react";
import { Ruler, Train } from "lucide-react";

import { TIME_PENALTIES } from "@/lib/context";
import { PLACES } from "@/maps/placesConfig";

interface MeasureSectionProps {
    handleQuestionSelect: (type: string, detail?: string) => void;
    isQuestionLocked: (type: string, detail?: string) => boolean;
}

export function MeasureSection({
    handleQuestionSelect,
    isQuestionLocked,
}: MeasureSectionProps) {
    return (
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
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2">
                {PLACES.filter((place) => place.type !== "specific").map(
                    (place) => {
                        const Icon = icons[
                            place.icon as keyof typeof icons
                        ] as any;
                        return (
                            <button
                                key={`measure-${place.id}`}
                                type="button"
                                aria-label={`Add measure question for ${place.label}`}
                                title={`Add measure question for ${place.label}`}
                                onClick={() =>
                                    handleQuestionSelect("measure", place.id)
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
                    aria-label={`Add measure question for Station`}
                    title={`Add measure question for Station`}
                    onClick={() =>
                        handleQuestionSelect("measure", "rail-measure")
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
    );
}
