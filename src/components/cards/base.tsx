import { useStore } from "@nanostores/react";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useState } from "react";
import { VscChevronDown } from "react-icons/vsc";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
} from "@/components/ui/sidebar-l";
import {
    isLoading,
    penaltyMinutes,
    questionModified,
    questions,
    TIME_PENALTIES,
} from "@/lib/context";
import { cn } from "@/lib/utils";

const TYPE_MAPPINGS: Record<string, string> = {
    museum: "Museum",
    hospital: "Hospital",
    cinema: "Cinema",
    library: "Library",
    mcdonalds: "McDonald's",
    seven11: "7-Eleven",
    timhortons: "Tim Hortons",
    pub: "Pubs / Bars",
    golf_course: "Golf Course",
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
    questionData: { drag: boolean; collapsed: boolean; [key: string]: any };
    penaltyId: keyof typeof TIME_PENALTIES;
}) => {
    const [isCollapsed, setIsCollapsed] = useState(
        questionData.collapsed ?? false,
    );
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);

    const toggleCollapse = () => {
        questionData.collapsed = !isCollapsed;
        setIsCollapsed((prevState) => !prevState);
    };

    let displayLabel = label;
    const question = $questions.find((q) => q.key === questionKey);
    const locked = !questionData.drag;

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
                    displayLabel = `Radius - ${questionData.radius}${questionData.unit === "kilometers" ? "km" : "m"} - ${questionData.within ? "Inside" : "Outside"}`;
                } else if (question.id === "match") {
                    const typeStr =
                        TYPE_MAPPINGS[questionData.type] || questionData.type;
                    let resultStr = "";
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
                    displayLabel = `Match - ${typeStr} - ${resultStr}`;
                } else if (question.id === "measure") {
                    const typeStr =
                        TYPE_MAPPINGS[questionData.type] || questionData.type;
                    displayLabel = `Measure - ${typeStr} - ${questionData.hiderCloser ? "Hider Closer" : "Hider Further"}`;
                } else if (question.id === "closest") {
                    const typeStr =
                        TYPE_MAPPINGS[questionData.locationType] ||
                        questionData.locationType;
                    const resultStr = questionData.location
                        ? questionData.location.properties?.name
                        : "Not Within";
                    displayLabel = `Closest - ${typeStr} - ${resultStr}`;
                } else if (question.id === "hot/cold") {
                    displayLabel = `Hot/Cold - ${questionData.warmer ? "Warmer" : "Colder"}`;
                } else {
                    displayLabel = `${typeName}\n    ${index}`;
                }
            } else {
                displayLabel = `${typeName}\n    ${index}`;
            }
        } else {
            displayLabel = "Question";
        }
    } else {
        // For photo question or any other question passing explicit label
        if (locked && question?.id === "photo") {
            displayLabel = `Photo - ${label}`;
        }
    }

    return (
        <>
            <SidebarGroup className={className}>
                <div className="relative">
                    <button
                        type="button"
                        onClick={toggleCollapse}
                        aria-label={
                            isCollapsed
                                ? "Expand Question"
                                : "Collapse Question"
                        }
                        aria-expanded={!isCollapsed}
                        className={cn(
                            "absolute top-2 left-2 text-white border rounded-md transition-all duration-500",
                            isCollapsed && "-rotate-90",
                        )}
                    >
                        <VscChevronDown />
                    </button>
                    <SidebarGroupLabel
                        className="ml-8 mr-8 cursor-pointer"
                        onClick={toggleCollapse}
                    >
                        {displayLabel} {sub && `(${sub})`}
                    </SidebarGroupLabel>
                    <SidebarGroupContent
                        className={cn(
                            "overflow-hidden transition-all duration-1000 max-h-[100rem]", // 100rem is arbitrary
                            isCollapsed && "max-h-0",
                        )}
                    >
                        <SidebarMenu>{children}</SidebarMenu>
                        <div className="flex gap-2 pt-2 px-2 justify-center">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                                data-tutorial-id="tutorial-lock-btn"
                                aria-label={
                                    !questionData.drag
                                        ? "Unlock Question"
                                        : "Lock Question"
                                }
                                onClick={() => {
                                    const locked = questionData.drag;
                                    questionData.drag = !locked;
                                    questionModified();
                                    if (locked) {
                                        penaltyMinutes.set(
                                            penaltyMinutes.get() +
                                                TIME_PENALTIES[penaltyId],
                                        );
                                    } else {
                                        penaltyMinutes.set(
                                            Math.max(
                                                0,
                                                penaltyMinutes.get() -
                                                    TIME_PENALTIES[penaltyId],
                                            ),
                                        );
                                    }
                                }}
                                disabled={$isLoading}
                            >
                                {!questionData.drag ? (
                                    <LockIcon className="w-4 h-4" />
                                ) : (
                                    <UnlockIcon className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </SidebarGroupContent>
                </div>
            </SidebarGroup>
            <Separator className="h-1" />
        </>
    );
};
