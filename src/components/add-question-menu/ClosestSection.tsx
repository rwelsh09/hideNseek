import * as icons from "lucide-react";
import { Network } from "lucide-react";

import { TIME_PENALTIES } from "@/lib/context";
import { PLACES } from "@/maps/placesConfig";

interface ClosestSectionProps {
    handleQuestionSelect: (type: string, detail?: string) => void;
    isQuestionLocked: (type: string, detail?: string) => boolean;
}

export function ClosestSection({
    handleQuestionSelect,
    isQuestionLocked,
}: ClosestSectionProps) {
    return (
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
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2">
                {PLACES.filter((place) => place.type === "specific").map(
                    (place) => {
                        const Icon = icons[
                            place.icon as keyof typeof icons
                        ] as any;
                        return (
                            <button
                                key={`closest-${place.id}`}
                                type="button"
                                aria-label={`Add closest question for ${place.id}`}
                                title={`Add closest question for ${place.id}`}
                                onClick={() =>
                                    handleQuestionSelect("closest", place.id)
                                }
                                className={`bg-purple-600 text-white flex flex-col gap-0.5 p-0.5 justify-center items-center hover:bg-purple-700 overflow-hidden aspect-square transition-all active:scale-95 rounded-sm sm:rounded-none ${isQuestionLocked("closest", place.id) ? "opacity-50 grayscale" : ""}`}
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
    );
}
