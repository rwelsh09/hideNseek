import { useStore } from "@nanostores/react";
import { ClipboardPasteIcon, Clock, SidebarCloseIcon } from "lucide-react";
import { Play, Square, Timer, Trash2, Trophy } from "lucide-react";
import * as React from "react";
import { toast } from "react-toastify";

import {
    Sidebar,
    SidebarContent,
    SidebarContext,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import {
    addQuestion,
    autoSave,
    isLoading,
    penaltyMinutes,
    questions,
    save,
    triggerLocalRefresh,
} from "@/lib/context";
import {
    isTimerRunning,
    leaderboard,
    timerElapsedSeconds,
    timerStartTimestamp,
} from "@/lib/context";
import { questionSchema } from "@/maps/schema";

import { AddQuestionDialog } from "./AddQuestionDialog";
import {
    MatchingQuestionComponent,
    MeasuringQuestionComponent,
    PhotoQuestionComponent,
    RadiusQuestionComponent,
    TentacleQuestionComponent,
    ThermometerQuestionComponent,
} from "./QuestionCards";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const QuestionSidebar = () => {
    useStore(triggerLocalRefresh);
    const $questions = useStore(questions);
    const $autoSave = useStore(autoSave);
    const $isLoading = useStore(isLoading);

    const $penaltyMinutes = useStore(penaltyMinutes);
    const $isTimerRunning = useStore(isTimerRunning);
    const $timerElapsedSeconds = useStore(timerElapsedSeconds);
    const $leaderboard = useStore(leaderboard);

    // Format seconds into MM:SS
    const formatTime = (totalSecs: number) => {
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Calculate total seconds including penalty
    const getTotalSeconds = () => {
        return $timerElapsedSeconds + $penaltyMinutes * 60;
    };

    // Re-import timerStartTimestamp
    const $timerStartTimestamp = useStore(timerStartTimestamp);

    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        if ($isTimerRunning) {
            // Set start timestamp if none exists
            if (!$timerStartTimestamp) {
                timerStartTimestamp.set(
                    Date.now() - $timerElapsedSeconds * 1000,
                );
            }

            interval = setInterval(() => {
                const start = timerStartTimestamp.get();
                if (start) {
                    const elapsed = Math.floor((Date.now() - start) / 1000);
                    timerElapsedSeconds.set(elapsed);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [$isTimerRunning, $timerStartTimestamp]);

    const toggleTimer = () => {
        if ($isTimerRunning) {
            isTimerRunning.set(false);
            // Clear timestamp so it recalculates on next start based on elapsed
            timerStartTimestamp.set(null);
        } else {
            // Recalculate start timestamp to account for already elapsed time
            timerStartTimestamp.set(Date.now() - $timerElapsedSeconds * 1000);
            isTimerRunning.set(true);
        }
    };

    const resetTimer = () => {
        if (window.confirm("Are you sure you want to reset the timer?")) {
            isTimerRunning.set(false);
            timerStartTimestamp.set(null);
            timerElapsedSeconds.set(0);
            penaltyMinutes.set(0);
        }
    };

    const addLeaderboardEntry = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const names = formData.get("names") as string;
        if (!names) return;

        const entry = {
            id: String(Date.now()),
            names,
            totalSeconds: getTotalSeconds(),
            penaltyMinutes: $penaltyMinutes,
        };

        leaderboard.set(
            [...$leaderboard, entry].sort(
                (a, b) => a.totalSeconds - b.totalSeconds,
            ),
        );

        // Reset after saving
        isTimerRunning.set(false);
        timerStartTimestamp.set(null);
        timerElapsedSeconds.set(0);
        penaltyMinutes.set(0);
        (e.target as HTMLFormElement).reset();

        toast.success("Added to leaderboard!");
    };

    const manipulateTimer = (minutes: number) => {
        const newSeconds = Math.max(
            0,
            timerElapsedSeconds.get() + minutes * 60,
        );
        timerElapsedSeconds.set(newSeconds);
        // Adjust the timestamp to reflect the new elapsed time
        if (timerStartTimestamp.get()) {
            timerStartTimestamp.set(Date.now() - newSeconds * 1000);
        }
    };

    const removeLeaderboardEntry = (id: string) => {
        if (window.confirm("Remove this entry from the leaderboard?")) {
            leaderboard.set($leaderboard.filter((entry) => entry.id !== id));
        }
    };

    // Add missing import for React

    const addTime = (mins: number) => {
        penaltyMinutes.set(Math.max(0, $penaltyMinutes + mins));
    };

    return (
        <Sidebar>
            <div className="flex items-center justify-between shrink-0">
                <h2 className="ml-4 mt-4 font-poppins text-2xl font-bold text-white">
                    Questions
                </h2>
                <SidebarCloseIcon
                    className="mr-2 visible text-white cursor-pointer"
                    onClick={() => {
                        SidebarContext.get().toggleSidebar();
                    }}
                />
            </div>

            <SidebarContent className="px-4 pt-4 pb-2 flex flex-col gap-5 overflow-y-auto">
                {/* --- TIMER --- */}
                <div className="bg-slate-800 rounded-xl p-3 shadow-md border border-slate-700 flex flex-col gap-3">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-slate-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <Timer className="w-4 h-4 text-blue-400" />
                            Seeker Timer
                        </h3>
                        <div className="text-white font-mono font-bold text-xl">
                            {formatTime($timerElapsedSeconds)}
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-1 border-t border-slate-700 pt-2 mt-1">
                        <div className="text-slate-300 text-xs">
                            Total with Penalty:
                        </div>
                        <div className="text-blue-400 font-mono font-bold text-lg">
                            {formatTime(getTotalSeconds())}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                            variant={
                                $isTimerRunning ? "destructive" : "default"
                            }
                            size="sm"
                            onClick={toggleTimer}
                            className="w-full flex items-center justify-center gap-2"
                        >
                            {$isTimerRunning ? (
                                <>
                                    <Square className="w-4 h-4" /> Stop
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4" /> Start
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={resetTimer}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                        >
                            Reset
                        </Button>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-700 pt-2 mt-1">
                        <span>Adjust Time:</span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => manipulateTimer(-5)}
                                className="px-1.5 py-0.5 bg-slate-700 rounded hover:bg-slate-600"
                            >
                                -5m
                            </button>
                            <button
                                onClick={() => manipulateTimer(-1)}
                                className="px-1.5 py-0.5 bg-slate-700 rounded hover:bg-slate-600"
                            >
                                -1m
                            </button>
                            <button
                                onClick={() => manipulateTimer(1)}
                                className="px-1.5 py-0.5 bg-slate-700 rounded hover:bg-slate-600"
                            >
                                +1m
                            </button>
                            <button
                                onClick={() => manipulateTimer(5)}
                                className="px-1.5 py-0.5 bg-slate-700 rounded hover:bg-slate-600"
                            >
                                +5m
                            </button>
                        </div>
                    </div>

                    {!$isTimerRunning && $timerElapsedSeconds > 0 && (
                        <form
                            onSubmit={addLeaderboardEntry}
                            className="flex flex-col gap-2 mt-2 border-t border-slate-700 pt-3"
                        >
                            <div className="text-xs text-slate-300 mb-1">
                                Save to Leaderboard
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    name="names"
                                    placeholder="Seeker Name(s)"
                                    className="h-8 bg-slate-900 border-slate-700 text-sm text-white"
                                    required
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-8 px-3"
                                >
                                    Save
                                </Button>
                            </div>
                        </form>
                    )}
                </div>

                {/* --- LEADERBOARD --- */}
                {$leaderboard.length > 0 && (
                    <div className="bg-slate-800 rounded-xl p-3 shadow-md border border-slate-700 flex flex-col gap-2">
                        <h3 className="text-slate-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 px-1 mb-1">
                            <Trophy className="w-4 h-4 text-yellow-400" />
                            Leaderboard
                        </h3>
                        <div className="flex flex-col gap-2">
                            {$leaderboard.map((entry, idx) => (
                                <div
                                    key={entry.id}
                                    className="flex flex-col bg-slate-900 p-2 rounded-lg border border-slate-700 text-sm"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="font-bold text-white flex items-center gap-1.5">
                                            <span className="text-slate-500 w-4">
                                                {idx + 1}.
                                            </span>
                                            {entry.names}
                                        </div>
                                        <div className="font-mono text-blue-400 font-bold">
                                            {formatTime(entry.totalSeconds)}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-400 pl-5.5">
                                        <div>
                                            Penalty: +{entry.penaltyMinutes}m
                                        </div>
                                        <button
                                            onClick={() =>
                                                removeLeaderboardEntry(entry.id)
                                            }
                                            className="text-slate-500 hover:text-red-400 transition-colors"
                                            title="Remove entry"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TIME PENALTY TRACKER --- */}
                <div
                    className="bg-slate-800 rounded-xl p-3 shadow-md border border-slate-700 flex flex-col gap-3"
                    data-tutorial-id="time-penalty-tracker"
                >
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-slate-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-red-400" />
                            Time Penalty
                        </h3>
                        <div className="text-white font-mono font-bold text-xl">
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
                        case "radius":
                            return (
                                <RadiusQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "thermometer":
                            return (
                                <ThermometerQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "tentacles":
                            return (
                                <TentacleQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "matching":
                            return (
                                <MatchingQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "measuring":
                            return (
                                <MeasuringQuestionComponent
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

            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <AddQuestionDialog />
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-semibold font-poppins transition-colors duration-200 text-white flex items-center justify-center gap-2"
                                onClick={() => {
                                    navigator.clipboard
                                        .readText()
                                        .then((text) => {
                                            try {
                                                const parsed = JSON.parse(text);
                                                delete parsed.key; // Ensure a new key is generated
                                                const validated =
                                                    questionSchema.parse(
                                                        parsed,
                                                    );
                                                addQuestion(validated);
                                                toast.success(
                                                    "Question pasted successfully!",
                                                );
                                            } catch {
                                                toast.error(
                                                    "Failed to parse question from clipboard",
                                                );
                                            }
                                        })
                                        .catch(() => {
                                            toast.error(
                                                "Failed to read from clipboard",
                                            );
                                        });
                                }}
                                disabled={$isLoading}
                            >
                                <ClipboardPasteIcon className="w-4 h-4" />
                                Paste Question
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {!$autoSave && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="bg-blue-600 p-2 rounded-md font-semibold font-poppins transition-shadow duration-500"
                                    onClick={save}
                                    disabled={$isLoading}
                                >
                                    Save
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </Sidebar>
    );
};
