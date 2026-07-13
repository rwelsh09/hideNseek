import { useStore } from "@nanostores/react";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useState } from "react";
import { VscQuestion, VscShare, VscTrash } from "react-icons/vsc";
import { toast } from "react-toastify";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar-l";
import { lockedActiveStationIds, lockedRecommendedStart } from "@/lib/context";
import {
    hiderMode,
    isLoading,
    penaltyMinutes,
    questionModified,
    questions,
    TIME_PENALTIES,
} from "@/lib/context";
import { lockRecommendedStartIfNeeded } from "@/lib/recommended-start";
import { QUESTION_RULES } from "@/lib/rules";
import { cn } from "@/lib/utils";
import { PLACES } from "@/maps/placesConfig";

const TYPE_MAPPINGS: Record<string, string> = {
    ...Object.fromEntries(PLACES.map(p => [p.id, p.label])),
    "same-neighbourhood": "Neighbourhood (Same As Me)",
    "same-first-letter-neighbourhood": "Neighbourhood (Same First Letter)",
    "same-first-letter-station": "Station Starts With Same Letter",
    "same-length-station": "Station Has Same Length",
    "same-train-line": "Station On Same Train Line",
    "rail-measure": "Train Station",
};

export const QuestionCard = ({
    children,
    questionKey,
    className,
    label,
    sub,
    questionData,
    penaltyId,
}: {
    children: React.ReactNode;
    questionKey: number;
    className?: string;
    label?: string;
    sub?: string;
    questionData: { locked: boolean; [key: string]: any };
    penaltyId: keyof typeof TIME_PENALTIES;
}) => {
    const [isCollapsed, setIsCollapsed] = useState(
        questionData.locked ?? false,
    );
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);
    const $hiderMode = useStore(hiderMode);

    const toggleLockAndCollapse = () => {
        lockRecommendedStartIfNeeded();

        const wasUnlocked = !questionData.locked;
        questionData.locked = wasUnlocked;
        questionModified();

        if (wasUnlocked) {
            // We are locking it now
            penaltyMinutes.set(
                penaltyMinutes.get() + TIME_PENALTIES[penaltyId] * (questionData.doubledPenalty ? 2 : 1),
            );
        } else {
            // We are unlocking it now
            penaltyMinutes.set(
                Math.max(0, penaltyMinutes.get() - TIME_PENALTIES[penaltyId] * (questionData.doubledPenalty ? 2 : 1)),
            );
        }


        setIsCollapsed(wasUnlocked);
    };

    let displayLabel = label;
    const question = $questions.find((q) => q.key === questionKey);
    const locked = questionData.locked;

    let resultStr = "";
    if (question) {
        if (question.id === "radius") {
            resultStr = questionData.within ? "Inside" : "Outside";
        } else if (question.id === "match") {
            if (questionData.type === "same-length-station") {
                resultStr =
                    questionData.lengthComparison === "shorter"
                        ? "Shorter"
                        : questionData.lengthComparison === "longer"
                          ? "Longer"
                          : "Same";
            } else {
                resultStr = questionData.same ? "Same" : "Different";
            }
        } else if (question.id === "measure") {
            resultStr = questionData.hiderCloser ? "Hider Closer" : "Hider Further";
        } else if (question.id === "closest") {
            resultStr = questionData.location
                ? questionData.location.properties?.name
                : "Not Within";
        } else if (question.id === "hot/cold") {
            resultStr = questionData.warmer ? "Warmer" : "Colder";
        }
    }

    if (!displayLabel) {
        if (question) {
            const index =
                $questions
                    .filter((q) => q.id === question.id)
                    .findIndex((q) => q.key === questionKey) + 1;
            let typeName = question.id;
            if (typeName === "hot/cold") typeName = "HotCold";
            typeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);

            if (locked) {
                if (question.id === "radius") {
                    displayLabel = `Radius - ${questionData.radius}${questionData.unit === "kilometers" ? "km" : "m"} - ${resultStr}`;
                } else if (question.id === "match") {
                    const typeStr =
                        TYPE_MAPPINGS[questionData.type] || questionData.type;
                    displayLabel = `Match - ${typeStr} - ${resultStr}`;
                } else if (question.id === "measure") {
                    const typeStr =
                        TYPE_MAPPINGS[questionData.type] || questionData.type;
                    displayLabel = `Measure - ${typeStr} - ${resultStr}`;
                } else if (question.id === "closest") {
                    const typeStr =
                        TYPE_MAPPINGS[questionData.locationType] ||
                        questionData.locationType;
                    displayLabel = `Closest - ${typeStr} - ${resultStr}`;
                } else if (question.id === "hot/cold") {
                    displayLabel = `Hot/Cold - ${resultStr}`;
                } else {
                    displayLabel = `${typeName}
    ${index}`;
                }
            } else {
                displayLabel = `${typeName}
    ${index}`;
            }
        } else {
            displayLabel = "Question";
        }
    } else {
        // For photo question or any other question passing explicit label
        if (locked && question?.id === "photo") {
            let noteSuffix = "";
            if (questionData.notes) {
                const note = questionData.notes as string;
                noteSuffix = note.length > 30 ? ` - ${note.substring(0, 30)}...` : ` - ${note}`;
            }
            displayLabel = `Photo - ${label}${noteSuffix}`;
        }
    }

    return (
        <>
            <SidebarGroup className={className}>
            <div className="relative">
                    <button
                        type="button"
                        data-tutorial-id="tutorial-lock-btn"
                        onClick={toggleLockAndCollapse}
                        aria-label={
                            questionData.locked
                                ? "Unlock Question"
                                : "Lock Question"
                        }
                        aria-expanded={!isCollapsed}
                        disabled={$isLoading}
                        className="absolute top-1.5 left-1.5 p-1 text-white border rounded-md transition-all duration-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        {questionData.locked ? (
                            <LockIcon className="w-4 h-4 text-foreground" />
                        ) : (
                            <UnlockIcon className="w-4 h-4 text-foreground" />
                        )}
                    </button>
                    <SidebarGroupLabel
                        className="ml-10 mr-24 cursor-pointer"
                        onClick={toggleLockAndCollapse}
                    >
                        {displayLabel} {sub && `(${sub})`}
                    </SidebarGroupLabel>

                    <div className="absolute right-1.5 top-1.5 flex gap-1 z-10" onClick={(e) => e.stopPropagation()}>
                        {QUESTION_RULES[question?.id as keyof typeof QUESTION_RULES] && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="Question Rules"
                                        data-tutorial-id="tutorial-question-rules-btn"
                                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                                    >
                                        <VscQuestion className="w-4 h-4" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-4 z-[9999]">
                                    <h4 className="font-semibold mb-2">How it works</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {QUESTION_RULES[question?.id as keyof typeof QUESTION_RULES]}
                                    </p>
                                </PopoverContent>
                            </Popover>
                        )}
                        <button
                            type="button"
                            aria-label="Share Question"
                            data-tutorial-id="tutorial-share-question-btn"
                            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!navigator || !navigator.clipboard) {
                                    toast.error("Clipboard API not supported in your browser");
                                    return;
                                }
                                navigator.clipboard
                                    .writeText(JSON.stringify(question, null, 4))
                                    .then(() => toast.success("Copied to Clipboard!"))
                                    .catch(() => toast.error("Failed to Copy"));
                            }}
                        >
                            <VscShare className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            aria-label="Delete Question"
                            data-tutorial-id="tutorial-delete-question-btn"
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-950 rounded-md transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                const qList = questions.get();
                                const currentQ = qList.find((q) => q.key === questionKey);
                                if (currentQ && !currentQ.data.locked) {
                                    questions.set(qList.filter((q) => q.key !== questionKey));
                                    if (questions.get().length === 0) {
                                        lockedRecommendedStart.set(null);
                                        lockedActiveStationIds.set(null);
                                    }
                                }
                            }}
                        >
                            <VscTrash className="w-4 h-4" />
                        </button>
                    </div>

                    <SidebarGroupContent
                        className={cn(
                            "overflow-hidden transition-all duration-300 max-h-[100rem]", // 100rem is arbitrary
                            isCollapsed && "max-h-0",
                        )}
                    >
                        <SidebarMenu>
                            {children}
                            {!!$hiderMode && resultStr && (
                                <div
                                    className="w-full text-center text-sm font-medium mt-2 bg-slate-800 p-2 rounded-md mx-2 mb-2 flex flex-col gap-2"
                                    style={{ width: "calc(100% - 1rem)" }}
                                >
                                    <div>
                                        Tell the Seekers:{" "}
                                        <span className="text-primary">{resultStr}</span>
                                    </div>
                                </div>
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </div>
            </SidebarGroup>
            <Separator className="h-1" />
        </>
    );
};
