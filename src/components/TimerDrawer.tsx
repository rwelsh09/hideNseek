import { useStore } from "@nanostores/react";
import { Clock, Play, Square, Timer, Trash2, Trophy } from "lucide-react";
import * as React from "react";
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
    Drawer,
    DrawerTrigger,
    TopDrawerContent,
} from "@/components/ui/drawer";
import {
    headStartMinutes,
    isTimerRunning,
    leaderboard,
    penaltyMinutes,
    timerElapsedSeconds,
    timerStartTimestamp,
} from "@/lib/context";

import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const TimerDrawer = () => {
    const $penaltyMinutes = useStore(penaltyMinutes);
    const $isTimerRunning = useStore(isTimerRunning);
    const $timerElapsedSeconds = useStore(timerElapsedSeconds);
    const $timerStartTimestamp = useStore(timerStartTimestamp);
    const $leaderboard = useStore(leaderboard);
    const $headStartMinutes = useStore(headStartMinutes);

    // Format seconds into MM:SS
    const formatTime = (totalSecs: number) => {
        const isNegative = totalSecs < 0;
        const absSecs = Math.abs(totalSecs);

        const h = Math.floor(absSecs / 3600);
        const m = Math.floor((absSecs % 3600) / 60);
        const s = absSecs % 60;

        const sign = isNegative ? "-" : "";

        if (h > 0) {
            return `${sign}${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
        }
        return `${sign}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    // Calculate total seconds including penalty
    const getTotalSeconds = () => {
        return (
            $timerElapsedSeconds - $headStartMinutes * 60 + $penaltyMinutes * 60
        );
    };

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
        isTimerRunning.set(false);
        timerStartTimestamp.set(null);
        timerElapsedSeconds.set(0);
    };

    const manipulateTimer = (minutes: number) => {
        const newSeconds = timerElapsedSeconds.get() + minutes * 60;
        timerElapsedSeconds.set(newSeconds);
        // Adjust the timestamp to reflect the new elapsed time
        if (timerStartTimestamp.get()) {
            timerStartTimestamp.set(Date.now() - newSeconds * 1000);
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
                (a, b) => b.totalSeconds - a.totalSeconds,
            ),
        );

        // Reset after saving
        isTimerRunning.set(false);
        timerStartTimestamp.set(null);
        timerElapsedSeconds.set(0);
        (e.target as HTMLFormElement).reset();

        toast.success(
            <div className="flex flex-col gap-1">
                <span>Added to leaderboard!</span>
                <span className="text-sm">
                    I hope you enjoyed your game, please consider supporting the
                    app with a donation (open Options).{" "}
                </span>
            </div>,
        );
    };

    const removeLeaderboardEntry = (id: string) => {
        leaderboard.set($leaderboard.filter((entry) => entry.id !== id));
    };

    return (
        <Drawer direction="top">
            <DrawerTrigger asChild>
                <button
                    type="button"
                    className="bg-white hover:bg-[#f4f4f4] w-[34px] h-[34px] rounded-sm flex items-center justify-center border-2 border-black border-opacity-30 cursor-pointer relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                    title="Timer & Leaderboard"
                    aria-label="Timer & Leaderboard"
                    data-tutorial-id="timer-drawer-trigger"
                >
                    <Clock className="w-5 h-5 text-black" />
                    {$penaltyMinutes > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full leading-tight">
                            +{$penaltyMinutes}
                        </div>
                    )}
                </button>
            </DrawerTrigger>
            <TopDrawerContent
                className="bg-slate-900 border-slate-700 text-white h-[85vh] max-h-[600px] overflow-hidden flex flex-col"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <div className="p-4 flex-1 flex flex-col overflow-y-auto">
                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl mx-auto h-full">
                        {/* --- LEFT SIDE: TIMER --- */}
                        <div className="flex-1 rounded-xl border bg-card shadow-sm p-5 space-y-4">
                            <h2 className="text-xl font-bold font-poppins flex items-center gap-2">
                                <Timer className="w-6 h-6 text-blue-400" />
                                Timer
                            </h2>

                            <div className="bg-slate-800/50 rounded-xl p-4 shadow-inner border border-slate-700/50 flex flex-col items-center justify-center gap-2 py-8">
                                <div className="text-5xl font-mono font-bold text-white">
                                    {formatTime(
                                        $timerElapsedSeconds -
                                            $headStartMinutes * 60,
                                    )}
                                </div>
                                <div className="text-slate-400 text-sm mt-2">
                                    Total with{" "}
                                    {$penaltyMinutes > 0
                                        ? "+" + $penaltyMinutes
                                        : $penaltyMinutes}
                                    m Penalty
                                </div>
                                <div className="text-3xl text-blue-400 font-mono font-bold">
                                    {formatTime(getTotalSeconds())}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <Button
                                    variant={
                                        $isTimerRunning
                                            ? "destructive"
                                            : "default"
                                    }
                                    size="lg"
                                    onClick={toggleTimer}
                                    className="w-full flex items-center justify-center gap-2 text-lg"
                                >
                                    {$isTimerRunning ? (
                                        <>
                                            <Square className="w-5 h-5" /> Stop
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-5 h-5" /> Start
                                        </>
                                    )}
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="lg"
                                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-lg"
                                        >
                                            Reset
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Reset Timer?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to reset the timer? This will reset your elapsed time to 0.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={resetTimer}>
                                                Continue
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>

                            <div className="flex flex-col items-center gap-2 mt-4">
                                <span className="text-sm text-slate-400">
                                    Adjust Time
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => manipulateTimer(-5)}
                                        className="bg-slate-800 border-slate-700"
                                    >
                                        -5m
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => manipulateTimer(-1)}
                                        className="bg-slate-800 border-slate-700"
                                    >
                                        -1m
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => manipulateTimer(1)}
                                        className="bg-slate-800 border-slate-700"
                                    >
                                        +1m
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => manipulateTimer(5)}
                                        className="bg-slate-800 border-slate-700"
                                    >
                                        +5m
                                    </Button>
                                </div>
                            </div>

                            {!$isTimerRunning &&
                                $timerElapsedSeconds - $headStartMinutes * 60 >
                                    0 && (
                                    <form
                                        onSubmit={addLeaderboardEntry}
                                        className="flex flex-col gap-3 mt-auto border-t border-slate-700 pt-4"
                                    >
                                        <div className="text-sm text-slate-300 font-semibold">
                                            Save Record to Leaderboard
                                        </div>
                                        <div className="flex gap-2">
                                            <Input
                                                name="names"
                                                placeholder="Hider Name"
                                                className="h-10 bg-slate-800 border-slate-600 text-white"
                                                required
                                            />
                                            <Button
                                                type="submit"
                                                size="default"
                                                className="h-10 px-4"
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </form>
                                )}
                        </div>

                        {/* --- RIGHT SIDE: LEADERBOARD --- */}
                        <div className="flex-1 rounded-xl border bg-card shadow-sm p-5 h-full min-h-[300px] flex flex-col gap-4">
                            <h2 className="text-xl font-bold font-poppins flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                                Leaderboard
                            </h2>

                            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3">
                                {$leaderboard.length === 0 ? (
                                    <div className="text-slate-500 text-center py-10 italic">
                                        No records yet. Stop the timer and save
                                        to add one!
                                    </div>
                                ) : (
                                    $leaderboard.map((entry, idx) => (
                                        <div
                                            key={entry.id}
                                            className="flex flex-col bg-slate-800 p-3 rounded-lg border border-slate-700"
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="font-bold text-white flex items-center gap-2 text-lg">
                                                    <span className="text-slate-500 w-5">
                                                        {idx + 1}.
                                                    </span>
                                                    {entry.names}
                                                </div>
                                                <div className="font-mono text-blue-400 font-bold text-xl">
                                                    {formatTime(
                                                        entry.totalSeconds,
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-slate-400 pl-7">
                                                <div>
                                                    Includes +
                                                    {entry.penaltyMinutes}m
                                                    penalty
                                                </div>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button
                                                            type="button"
                                                            className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-800"
                                                            title={`Remove leaderboard entry for ${entry.names}`}
                                                            aria-label={`Remove leaderboard entry for ${entry.names}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Remove Leaderboard Entry?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Are you sure you want to remove this entry from the leaderboard?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => removeLeaderboardEntry(entry.id)}
                                                            >
                                                                Continue
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </TopDrawerContent>
        </Drawer>
    );
};
