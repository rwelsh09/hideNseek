import { useStore } from "@nanostores/react";
import { Plus } from "lucide-react";
import { useState } from "react";

import { LeftSidebarContext } from "@/components/ui/sidebar";
import { addQuestion, leafletMapContext, questions } from "@/lib/context";
import {
    createDraftQuestionRegistry,
    isQuestionLockedRegistry,
} from "@/maps/index";

import { ClosestSection } from "./add-question-menu/ClosestSection";
import { HotColdSection } from "./add-question-menu/HotColdSection";
import { MatchSection } from "./add-question-menu/MatchSection";
import { MeasureSection } from "./add-question-menu/MeasureSection";
import { PhotoSection } from "./add-question-menu/PhotoSection";
import { RadarSection } from "./add-question-menu/RadarSection";
import {
    draftQuestionId,
    draftQuestionType,
    editingQuestionId,
} from "./DraggableMarkers";
import { Button } from "./ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";

export function AddQuestionDialog({
    iconOnly = false,
}: {
    iconOnly?: boolean;
}) {
    const [open, setOpen] = useState(false);

    const $questions = useStore(questions);
    const isQuestionLocked = (type: string, detail?: string) => {
        return isQuestionLockedRegistry($questions, type, detail);
    };

    const handleQuestionSelect = (type: string, detail?: string) => {
        const map = leafletMapContext.get();
        if (!map) return;
        const center = map.getCenter();
        const key = Math.random();

        const draft = createDraftQuestionRegistry(
            type,
            center,
            detail,
            isQuestionLocked(type, detail),
        );

        if (draft) {
            addQuestion({ ...draft, key } as any);
        }

        editingQuestionId.set(key);
        draftQuestionId.set(key);
        draftQuestionType.set(type);

        setOpen(false);

        LeftSidebarContext.get().setOpenMobile(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={
                        iconOnly
                            ? "flex items-center justify-center gap-2 h-10 w-10 p-0 shadow-md"
                            : "w-full flex items-center justify-center gap-2 h-10"
                    }
                    data-tutorial-id="add-question-btn"
                    aria-label="Add Question"
                    title={iconOnly ? "Add Question" : undefined}
                >
                    <Plus className="w-5 h-5" /> {!iconOnly && "Add Question"}
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-6xl w-[95vw] sm:w-full bg-card p-0 flex flex-col max-h-[90dvh] rounded-xl overflow-hidden shadow-xl border">
                <DialogHeader className="bg-slate-800 p-4 m-0 shrink-0 border-b border-slate-700">
                    <DialogTitle className="text-white text-center font-bold text-xl uppercase tracking-wider m-0">
                        Question Menu
                    </DialogTitle>
                </DialogHeader>

                <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 sm:gap-6">
                    <HotColdSection
                        handleQuestionSelect={handleQuestionSelect}
                        isQuestionLocked={isQuestionLocked}
                    />
                    <RadarSection
                        handleQuestionSelect={handleQuestionSelect}
                        isQuestionLocked={isQuestionLocked}
                    />
                    <MatchSection
                        handleQuestionSelect={handleQuestionSelect}
                        isQuestionLocked={isQuestionLocked}
                    />
                    <MeasureSection
                        handleQuestionSelect={handleQuestionSelect}
                        isQuestionLocked={isQuestionLocked}
                    />
                    <ClosestSection
                        handleQuestionSelect={handleQuestionSelect}
                        isQuestionLocked={isQuestionLocked}
                    />
                    <PhotoSection
                        handleQuestionSelect={handleQuestionSelect}
                        isQuestionLocked={isQuestionLocked}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
