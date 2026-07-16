import { Map as MapIcon, Train } from "lucide-react";
import * as icons from "lucide-react";

import { TIME_PENALTIES } from "@/lib/context";
import { PLACES } from "@/maps/placesConfig";

interface MatchSectionProps {
    handleQuestionSelect: (type: string, detail?: string) => void;
    isQuestionLocked: (type: string, detail?: string) => boolean;
}

export function MatchSection({
    handleQuestionSelect,
    isQuestionLocked,
}: MatchSectionProps) {
    return (
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
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2">
                {PLACES.filter((place) => place.type !== "specific").map(
                    (place) => {
                        const Icon = icons[
                            place.icon as keyof typeof icons
                        ] as any;
                        return (
                            <button
                                key={`match-${place.id}`}
                                type="button"
                                aria-label={`Add match question for ${place.label}`}
                                title={`Add match question for ${place.label}`}
                                onClick={() =>
                                    handleQuestionSelect("match", place.id)
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
                    {
                        id: "same-neighbourhood",
                        label: "Nhbd (Same)",
                        icon: MapIcon,
                    },
                    {
                        id: "same-first-letter-neighbourhood",
                        label: "Nhbd (Letter)",
                        icon: MapIcon,
                    },
                    {
                        id: "same-train-line",
                        label: "Station (Line)",
                        icon: Train,
                    },
                    {
                        id: "same-first-letter-station",
                        label: "Station (Letter)",
                        icon: Train,
                    },
                ].map((place) => {
                    const Icon = place.icon;
                    return (
                        <button
                            key={`match-${place.id}`}
                            type="button"
                            aria-label={`Add match question for ${place.label}`}
                            title={`Add match question for ${place.label}`}
                            onClick={() =>
                                handleQuestionSelect("match", place.id)
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
    );
}
