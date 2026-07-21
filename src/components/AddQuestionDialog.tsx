import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import { Plus } from "lucide-react";
import { useState } from "react";

import { LeftSidebarContext } from "@/components/ui/sidebar";
import { addQuestion, leafletMapContext, questions } from "@/lib/context";

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
        return $questions.some((q) => {
            if (!q.data.locked) return false;

            if (type === "radar" && q.id === "radar") {
                const isCustom = detail === "unknown";
                if (isCustom) return q.data.isCustom === true;
                const radius = parseFloat(detail || "5");
                return q.data.radius === radius && !q.data.isCustom;
            }
            if (type === "hot/cold" && q.id === "hot/cold") {
                const detailDist = parseFloat(detail || "5");
                if (q.data.minDistance !== undefined) {
                    return q.data.minDistance === detailDist;
                }

                if (
                    !q.data.lngA ||
                    !q.data.latA ||
                    !q.data.lngB ||
                    !q.data.latB
                )
                    return false;
                const dist = turf.distance(
                    [q.data.lngA, q.data.latA],
                    [q.data.lngB, q.data.latB],
                    { units: "kilometers" },
                );
                return Math.abs(dist - detailDist) < 0.1;
            }
            if (type === "match" && q.id === "match") {
                return q.data.type === (detail || "museum");
            }
            if (type === "measure" && q.id === "measure") {
                return q.data.type === (detail || "museum");
            }
            if (type === "closest" && q.id === "closest") {
                return q.data.locationType === (detail || "museum");
            }
            if (type === "photo" && q.id === "photo") {
                return q.data.type === (detail || "camera");
            }
            return false;
        });
    };

    const handleQuestionSelect = (type: string, detail?: string) => {
        const map = leafletMapContext.get();
        if (!map) return;
        const center = map.getCenter();
        const key = Math.random();

        let qId = type;
        let qData: any = {
            lat: center.lat,
            lng: center.lng,
            locked: false,
            doubledPenalty: isQuestionLocked(type, detail),
        };

        if (type === "radar") {
            qId = "radar";
            qData.radius = detail === "unknown" ? 5 : parseFloat(detail || "5");
            qData.isCustom = detail === "unknown";
            qData.unit = "kilometers";
            qData.within = true;
            qData.colour = "orange";
        } else if (type === "match") {
            qData.type = detail || "museum";
            qData.same = true;
            qData.colour = "red";
        } else if (type === "measure") {
            qData.type = detail || "museum";
            qData.hiderCloser = true;
            qData.colour = "green";
        } else if (type === "hot/cold") {
            const destination = turf.destination(
                [center.lng, center.lat],
                parseFloat(detail || "5"),
                90,
                { units: "kilometers" },
            );
            qData = {
                latA: center.lat,
                lngA: center.lng,
                latB: destination.geometry.coordinates[1],
                lngB: destination.geometry.coordinates[0],
                warmer: true,
                locked: false,
                colourA: "gold",
                colourB: "blue",
                doubledPenalty: isQuestionLocked(type, detail),
                minDistance: parseFloat(detail || "5"),
            };
        } else if (type === "closest") {
            qData.locationType = detail || "museum";
            qData.radius = 2;
            qData.unit = "kilometers";
            qData.colour = "violet";
        } else if (type === "photo") {
            qId = "photo";
            qData.notes = "";
            qData.type = detail || "camera";
            qData.colour = "blue";
        }

        addQuestion({ id: qId as any, key, data: qData });

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
