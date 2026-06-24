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
                    {
                        element: '[data-tutorial-id="add-question-btn"]',
                        popover: {
                            title: "Ask a Question",
                            description:
                                "Click here to ask a question. Once you are ready, you can lock it to record your answer.",
                            side: "right",
                            align: "start",
                            showButtons: ["previous"], // Hide Next button to force interaction
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

                                const btn = document.querySelector(
                                    '[data-tutorial-id="add-question-btn"]',
                                );
                                if (btn) {
                                    btn.addEventListener(
                                        "click",
                                        () => {
                                            setTimeout(
                                                () => driverObj.moveNext(),
                                                400,
                                            );
                                        },
                                        { once: true },
                                    );
                                }
                            },
                        },
                    },
                    {
                        element: '[data-tutorial-id="tutorial-add-radar-5"]',
                        popover: {
                            title: "Choose a Question Type",
                            description:
                                "Let's ask a 5 km Radar question. Click here to add it to the map.",
                            side: "right",
                            align: "start",
                            showButtons: ["previous"], // Hide Next button
                            onPopoverRender: () => {
                                const btn = document.querySelector(
                                    '[data-tutorial-id="tutorial-add-radar-5"]',
                                );
                                if (btn) {
                                    btn.addEventListener(
                                        "click",
                                        () => {
                                            const checkInterval = setInterval(
                                                () => {
                                                    const lockBtn =
                                                        document.querySelector(
                                                            '.peer[data-side="left"] [data-tutorial-id="tutorial-lock-btn"]',
                                                        );
                                                    if (lockBtn) {
                                                        clearInterval(
                                                            checkInterval,
                                                        );
                                                        driverObj.moveNext();
                                                    }
                                                },
                                                100,
                                            );
                                        },
                                        { once: true },
                                    );
                                }
                            },
                        },
                    },
                    {
                        element:
                            '.peer[data-side="left"] [data-tutorial-id="tutorial-lock-btn"]',
                        popover: {
                            title: "Lock Your Answer",
                            description:
                                "Move the map around to reposition your question. Once you are satisfied with your answer, lock the question using this button to record it.",
                            side: "bottom",
                            align: "end",
                            onPopoverRender: () => {
                                // Let the user interact with the map
                                driverObj.setConfig({
                                    ...driverObj.getConfig(),
                                    allowActiveInteraction: true,
                                } as any);

                                const checkInterval = setInterval(() => {
                                    const lockBtn = document.querySelector(
                                        '.peer[data-side="left"] [data-tutorial-id="tutorial-lock-btn"]',
                                    );
                                    // if it's no longer rendering an unlock icon (it has a lock icon now), advance
                                    if (
                                        lockBtn &&
                                        lockBtn.innerHTML.includes(
                                            "lucide-lock",
                                        )
                                    ) {
                                        clearInterval(checkInterval);
                                        // A slight delay to let the animation play before moving
                                        setTimeout(
                                            () => driverObj.moveNext(),
                                            300,
                                        );
                                    }
                                }, 100);
                            },
                        },
                    },
                    {
                        element: '[data-tutorial-id="time-penalty-tracker"]',
                        popover: {
                            title: "Time Penalty",
                            description:
                                "Locking a question automatically increases your Time Penalty, which you can see tracked here. Keep an eye on it!",
                            side: "right",
                            align: "start",
                            onPopoverRender: () => {
                                // Restore original config
                                driverObj.setConfig({
                                    ...driverObj.getConfig(),
                                    allowActiveInteraction: false,
                                } as any);
                            },
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
