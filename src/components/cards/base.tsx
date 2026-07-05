import { useStore } from "@nanostores/react";
import { LockIcon, UnlockIcon } from "lucide-react";
import { useState } from "react";

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

    const toggleLockAndCollapse = () => {
        const wasUnlocked = questionData.drag;
        questionData.drag = !wasUnlocked;
        questionModified();

        if (wasUnlocked) {
            // We are locking it now
            penaltyMinutes.set(
                penaltyMinutes.get() + TIME_PENALTIES[penaltyId],
            );
        } else {
            // We are unlocking it now
            penaltyMinutes.set(
                Math.max(
                    0,
                    penaltyMinutes.get() - TIME_PENALTIES[penaltyId],
                ),
            );
        }

        // Collapse when locked (drag = false), expand when unlocked (drag = true)
        questionData.collapsed = wasUnlocked;
        setIsCollapsed(wasUnlocked);
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
                        onClick={toggleLockAndCollapse}
                        data-tutorial-id="tutorial-lock-btn"
                        aria-label={
                            !questionData.drag
                                ? "Unlock Question"
                                : "Lock Question"
                        }
                        aria-expanded={!isCollapsed}
                        disabled={$isLoading}
                        className="absolute top-1.5 left-1.5 p-1 text-white border rounded-md transition-all duration-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50"
                    >
                        {!questionData.drag ? (
                            <LockIcon className="w-4 h-4 text-foreground" />
                        ) : (
                            <UnlockIcon className="w-4 h-4 text-foreground" />
                        )}
                    </button>
                    <SidebarGroupLabel
                        className="ml-10 mr-8 cursor-pointer"
                        onClick={toggleLockAndCollapse}
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
                    </SidebarGroupContent>
                </div>
            </SidebarGroup>
            <Separator className="h-1" />
        </>
    );
};
