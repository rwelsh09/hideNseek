import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    hasSeenRules,
    hasSeenWelcome,
    showNextStepsChecklist,
    showTutorial,
} from "@/lib/context";

export const WelcomeDialog = () => {
    const $hasSeenWelcome = useStore(hasSeenWelcome);
    const $showTutorial = useStore(showTutorial);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // If they have already finished the tutorial previously but haven't seen welcome,
        // just mark welcome as seen so we don't bug them.
        if (!$hasSeenWelcome && !$showTutorial) {
            hasSeenWelcome.set(true);
            return;
        }

        if (!$hasSeenWelcome && $showTutorial) {
            setIsOpen(true);
        }
    }, [$hasSeenWelcome, $showTutorial]);

    const handleStartTutorial = () => {
        hasSeenWelcome.set(true);
        setIsOpen(false);
        // TutorialManager will automatically start if showTutorial is true
    };

    const handleReadRules = () => {
        hasSeenWelcome.set(true);
        hasSeenRules.set(true);
        showTutorial.set(false);
        showNextStepsChecklist.set(true);
        setIsOpen(false);
        window.location.href = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/rules/`;
    };

    const handleFigureItOut = () => {
        hasSeenWelcome.set(true);
        hasSeenRules.set(true);
        showTutorial.set(false);
        showNextStepsChecklist.set(true);
        setIsOpen(false);
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="font-poppins">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold">Welcome to Hide & Seek</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                        Get ready to explore Calgary! Before you begin, choose how you'd like to start.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-3 py-4">
                    <Button onClick={handleStartTutorial} size="lg" className="w-full justify-start text-left bg-blue-600 hover:bg-blue-700 text-white">
                        <div className="flex flex-col items-start">
                            <span className="font-semibold text-lg">Start Tutorial</span>
                            <span className="text-xs font-normal opacity-90">A quick interactive guide</span>
                        </div>
                    </Button>
                    <Button onClick={handleReadRules} size="lg" variant="secondary" className="w-full justify-start text-left">
                        <div className="flex flex-col items-start">
                            <span className="font-semibold text-lg">Read the Rules</span>
                            <span className="text-xs font-normal opacity-80">Full details on how to play</span>
                        </div>
                    </Button>
                    <Button onClick={handleFigureItOut} size="lg" variant="outline" className="w-full justify-start text-left">
                        <div className="flex flex-col items-start">
                            <span className="font-semibold text-lg">Figure it out on my own</span>
                            <span className="text-xs font-normal opacity-80">Skip the intro and jump right in</span>
                        </div>
                    </Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};
