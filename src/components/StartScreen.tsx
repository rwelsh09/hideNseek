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
    hiderMode,
    mapGeoLocation,
    showNextStepsChecklist,
    showTutorial,
} from "@/lib/context";

export const StartScreen = () => {
    const $hasSeenWelcome = useStore(hasSeenWelcome);
    const $showTutorial = useStore(showTutorial);
    const $mapGeoLocation = useStore(mapGeoLocation);
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

    const handleStartAsSeeker = () => {
        hasSeenWelcome.set(true);
        hasSeenRules.set(true);
        showTutorial.set(false);
        showNextStepsChecklist.set(true);
        setIsOpen(false);
        hiderMode.set(false);
    };

    const handleStartAsHider = () => {
        hasSeenWelcome.set(true);
        hasSeenRules.set(true);
        showTutorial.set(false);
        showNextStepsChecklist.set(true);
        setIsOpen(false);
        hiderMode.set({
            latitude: $mapGeoLocation?.geometry?.coordinates?.[1] ?? 51.0447,
            longitude: $mapGeoLocation?.geometry?.coordinates?.[0] ?? -114.0719,
        });
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="font-poppins w-screen h-[100dvh] max-w-none sm:max-w-none !rounded-none border-none flex flex-col justify-center overflow-y-auto p-6 sm:p-12 md:p-24 bg-background">
                <div className="w-full max-w-2xl mx-auto flex flex-col justify-center min-h-full py-4 sm:py-8">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-3xl font-bold mb-2">
                            Welcome to Hide & Seek
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-base leading-relaxed">
                            One player takes the transit network to hide
                            anywhere in Calgary. The other players work together
                            to narrow down the Hider&apos;s location by asking
                            map-based questions until they can pinpoint exactly
                            where they are hiding!
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex flex-col gap-4 sm:gap-6 py-4 mt-4 sm:mt-8">
                        <Button
                            onClick={handleStartTutorial}
                            size="lg"
                            className="w-full justify-start text-left h-auto py-4 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-semibold text-xl">
                                    Start Tutorial
                                </span>
                                <span className="text-sm font-normal opacity-90">
                                    An extensive interactive guide
                                </span>
                            </div>
                        </Button>
                        <Button
                            onClick={handleReadRules}
                            size="lg"
                            variant="secondary"
                            className="w-full justify-start text-left h-auto py-4"
                        >
                            <div className="flex flex-col items-start gap-1">
                                <span className="font-semibold text-xl">
                                    Read the Rules
                                </span>
                                <span className="text-sm font-normal opacity-80">
                                    Full details on how to play
                                </span>
                            </div>
                        </Button>
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full">
                            <Button
                                onClick={handleStartAsSeeker}
                                size="lg"
                                variant="outline"
                                className="flex-1 justify-start text-left h-auto py-4"
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <span className="font-semibold text-xl">
                                        Start as Seeker
                                    </span>
                                    <span className="text-sm font-normal opacity-80">
                                        Find the hider
                                    </span>
                                </div>
                            </Button>
                            <Button
                                onClick={handleStartAsHider}
                                size="lg"
                                variant="outline"
                                className="flex-1 justify-start text-left h-auto py-4"
                            >
                                <div className="flex flex-col items-start gap-1">
                                    <span className="font-semibold text-xl">
                                        Start as Hider
                                    </span>
                                    <span className="text-sm font-normal opacity-80">
                                        Hide from seekers
                                    </span>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};
