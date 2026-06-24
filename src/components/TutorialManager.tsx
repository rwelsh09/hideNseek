import "driver.js/dist/driver.css";

import { useStore } from "@nanostores/react";
import { driver } from "driver.js";
import { useEffect } from "react";

import { showTutorial } from "@/lib/context";

export const TutorialManager = () => {
    const $showTutorial = useStore(showTutorial);

    useEffect(() => {
        if ($showTutorial) {
            const driverObj = driver({
                showProgress: true,
                onDestroyStarted: () => {
                    if (
                        driverObj.hasNextStep() ||
                        driverObj.hasPreviousStep()
                    ) {
                        driverObj.destroy();
                    }
                    showTutorial.set(false);
                },
                steps: [
                    {
                        element: '[data-tutorial-id="left-sidebar-trigger"]',
                        popover: {
                            title: "Questions",
                            description:
                                "Open the left sidebar to add and manage questions for the game.",
                            side: "right",
                            align: "start",
                        },
                    },
                    {
                        element: '[data-tutorial-id="right-sidebar-trigger"]',
                        popover: {
                            title: "Game State",
                            description:
                                "Open the right sidebar to toggle Hiding Zones.",
                            side: "left",
                            align: "start",
                        },
                    },
                    {
                        element: '[data-tutorial-id="option-drawers-trigger"]',
                        popover: {
                            title: "Settings & Options",
                            description:
                                "Access map settings, save states, sharing options, and extra tools.",
                            side: "top",
                            align: "end",
                        },
                    },
                ],
            });

            // Need a slight delay to ensure elements are mounted before driving
            setTimeout(() => {
                driverObj.drive();
            }, 500);

            return () => {
                try {
                    driverObj.destroy();
                } catch {
                    /* ignore */
                }
            };
        }
    }, [$showTutorial]);

    return null;
};
