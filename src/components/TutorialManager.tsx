import "driver.js/dist/driver.css";

import { useStore } from "@nanostores/react";
import { driver } from "driver.js";
import { useEffect, useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    hasSeenRules,
    hasSeenWelcome,
    hiderMode,
    showHiderTutorial,
    showNextStepsChecklist,
    showTutorial,
    tutorialDriver,
} from "@/lib/context";

import { getHiderSteps } from "./tutorials/hiderTutorial";
import { getSeekerSteps } from "./tutorials/seekerTutorial";

export const TutorialManager = () => {
    const $showTutorial = useStore(showTutorial);
    const $hasSeenRules = useStore(hasSeenRules);
    const $hiderMode = useStore(hiderMode);
    const $showHiderTutorial = useStore(showHiderTutorial);
    const $hasSeenWelcome = useStore(hasSeenWelcome);

    // States for custom confirm dialogs
    const [confirmEndTutorial, setConfirmEndTutorial] = useState(false);
    const [activeDriver, setActiveDriver] = useState<any>(null);

    const isHiderMode = $hiderMode !== false;

    useEffect(() => {
        if (isHiderMode && $showHiderTutorial && !$showTutorial) {
            const hiderDriverObj = driver({
                showProgress: true,
                showButtons: ["next", "close"],
                overlayClickBehavior: () => {},
                onDestroyStarted: () => {
                    hiderDriverObj.destroy();
                    showHiderTutorial.set(false);
                },
                });
            hiderDriverObj.setSteps(getHiderSteps(hiderDriverObj));
            tutorialDriver.set(hiderDriverObj);
            setTimeout(() => {
                hiderDriverObj.drive();
            }, 500);

            return () => {
                tutorialDriver.set(null);
                try {
                    hiderDriverObj.destroy();
                } catch {
                    /* ignore */
                }
            };
        }
    }, [isHiderMode, $showHiderTutorial, $showTutorial]);

    useEffect(() => {
        if ($showTutorial && $hasSeenWelcome) {
            const driverObj = driver({
                showProgress: true,
                showButtons: ["next", "close"],
                overlayClickBehavior: () => {},
                onDestroyStarted: () => {
                    const isRulesPhase =
                        driverObj.getConfig().steps?.length === 2;

                    if (isRulesPhase) {
                        driverObj.destroy();
                    } else {
                        if (!driverObj.hasNextStep()) {
                            driverObj.destroy();
                            showTutorial.set(false);
                            showNextStepsChecklist.set(true);
                        } else {
                            setActiveDriver(driverObj);
                            driverObj.destroy();
                            setConfirmEndTutorial(true);
                        }
                    }
                },
                });
            driverObj.setSteps(getSeekerSteps(driverObj));

            tutorialDriver.set(driverObj);

            setTimeout(() => {
                driverObj.drive();
            }, 500);

            return () => {
                tutorialDriver.set(null);
                try {
                    driverObj.destroy();
                } catch {
                    /* ignore */
                }
            };
        }
    }, [$showTutorial, $hasSeenRules, $hasSeenWelcome]);

    return (
        <>
            <AlertDialog
                open={confirmEndTutorial}
                onOpenChange={setConfirmEndTutorial}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>End Tutorial?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to end the tutorial?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel
                            onClick={() => {
                                if (activeDriver) {
                                    activeDriver.drive();
                                }
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                showTutorial.set(false);
                                showNextStepsChecklist.set(true);
                                setConfirmEndTutorial(false);
                            }}
                        >
                            End Tutorial
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
