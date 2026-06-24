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
                                "Open the right sidebar to configure the game area, rules, and boundaries.",
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
                    {
                        element: '[data-tutorial-id="left-sidebar-trigger"]',
                        popover: {
                            title: "Open the Sidebar",
                            description:
                                "Click here to open the sidebar so we can add a question.",
                            side: "right",
                            align: "start",
                        },
                    },
                    {
                        element: '[data-tutorial-id="add-question-btn"]',
                        popover: {
                            title: "Ask a Question",
                            description:
                                "Click here to ask a question. Once you are ready, you can lock it to record your answer.",
                            side: "right",
                            align: "start",
                            onPopoverRender: () => {
                                // Attempt to open left sidebar before showing this step
                                const trigger =
                                    document.querySelector<HTMLElement>(
                                        '[data-tutorial-id="left-sidebar-trigger"] button',
                                    ) ||
                                    document.querySelector<HTMLElement>(
                                        '[data-sidebar="trigger"]',
                                    );

                                // Only click if it's currently collapsed
                                // Need to check data-state on the sidebar parent
                                const sidebarL = document.querySelector(
                                    '.peer[data-side="left"]',
                                );
                                if (
                                    trigger &&
                                    sidebarL &&
                                    sidebarL.getAttribute("data-state") ===
                                        "collapsed"
                                ) {
                                    trigger.click();
                                }
                            },
                        },
                    },
                    {
                        element: '[data-tutorial-id="time-penalty-tracker"]',
                        popover: {
                            title: "Time Penalty",
                            description:
                                "Locking a question will automatically add to your Time Penalty here. Keep an eye on it!",
                            side: "right",
                            align: "start",
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
