import { useStore } from "@nanostores/react";
import { Clock, SidebarCloseIcon, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    LeftSidebarContext,
    Sidebar,
    SidebarContent,
} from "@/components/ui/sidebar";
import {
    isLoading,
    lockedActiveStationIds,
    lockedRecommendedStart,
    penaltyMinutes,
    questions,
    triggerLocalRefresh,
} from "@/lib/context";

import { AddQuestionDialog } from "./AddQuestionDialog";
import { PasteQuestionButton } from "./PasteQuestionButton";
import {
    ClosestQuestionComponent,
    HotColdQuestionComponent,
    MatchQuestionComponent,
    MeasureQuestionComponent,
    PhotoQuestionComponent,
    RadarQuestionComponent,
} from "./QuestionCards";
import { Button } from "./ui/button";

export const QuestionSidebar = () => {
    useStore(triggerLocalRefresh);
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);

    const $penaltyMinutes = useStore(penaltyMinutes);

    const addTime = (mins: number) => {
        penaltyMinutes.set(Math.max(0, $penaltyMinutes + mins));
    };

    return (
        <Sidebar>
            <div className="flex items-center justify-between shrink-0">
                <h2 className="ml-4 mt-4 font-poppins text-2xl font-bold text-white">
                    Questions
                </h2>
                <button
                    type="button"
                    className="mr-2 visible text-white cursor-pointer hover:bg-slate-800 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    aria-label="Close sidebar"
                    onClick={() => {
                        LeftSidebarContext.get().toggleSidebar();
                    }}
                >
                    <SidebarCloseIcon />
                </button>
            </div>

            <SidebarContent className="px-4 pt-4 pb-2 flex flex-col gap-5 overflow-y-auto">
                {/* --- TIME PENALTY TRACKER --- */}
                <div
                    className="rounded-xl border bg-card shadow-sm p-4 space-y-3"
                    data-tutorial-id="time-penalty-tracker"
                >
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-muted-foreground font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-red-400" />
                            Time Penalty
                        </h3>
                        <div className="text-foreground font-mono font-bold text-xl">
                            +{$penaltyMinutes}{" "}
                            <span className="text-xs text-slate-400 font-sans">
                                MIN
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTime(-5)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8"
                        >
                            -5
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTime(5)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8"
                        >
                            +5
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTime(10)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8"
                        >
                            +10
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTime(15)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8"
                        >
                            +15
                        </Button>
                    </div>
                </div>

                {/* --- ACTIVE MAP ZONES --- */}
                {$questions.length > 0 && (
                    <div className="flex items-center gap-2 mt-1 px-1">
                        <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                            Active Map Zones
                        </h3>
                    </div>
                )}

                {$questions.map((question) => {
                    switch (question.id) {
                        case "radar":
                            return (
                                <RadarQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "hot/cold":
                            return (
                                <HotColdQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "closest":
                            return (
                                <ClosestQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "match":
                            return (
                                <MatchQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "measure":
                            return (
                                <MeasureQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "photo":
                            return (
                                <PhotoQuestionComponent
                                    data={question.data as any}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        default:
                            return null;
                    }
                })}
            </SidebarContent>

            <div className="px-4 pb-4">
                <div className="space-y-2 mt-4 flex flex-col w-full">
                    <AddQuestionDialog />

                    <PasteQuestionButton />

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                className="w-full font-semibold font-poppins flex items-center justify-center gap-2 h-11 mt-2"
                                disabled={$isLoading || $questions.length === 0}
                            >
                                <Trash2 className="w-4 h-4" />
                                Unlock & Delete All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Are you absolutely sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will unlock and delete ALL questions,
                                    and reset your time penalty to 0. This
                                    action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        questions.set([]);
                                        lockedRecommendedStart.set(null);
                                        lockedActiveStationIds.set(null);
                                        penaltyMinutes.set(0);
                                        toast.success(
                                            "Cleared all questions and time penalty.",
                                        );
                                    }}
                                >
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </Sidebar>
    );
};
