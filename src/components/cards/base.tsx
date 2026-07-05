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
    if (!displayLabel) {
        const question = $questions.find((q) => q.key === questionKey);
        if (question) {
            const index =
                $questions
                    .filter((q) => q.id === question.id)
                    .findIndex((q) => q.key === questionKey) + 1;
            let typeName = question.id;
            if (typeName === "hot/cold") typeName = "HotCold";
            typeName = typeName.charAt(0).toUpperCase() + typeName.slice(1);
            // Replicating the previous exact spacing behavior just in case
            displayLabel = `${typeName}\n    ${index}`;
        } else {
            displayLabel = "Question";
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
