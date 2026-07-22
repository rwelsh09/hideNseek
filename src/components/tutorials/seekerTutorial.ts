import type { DriveStep } from "driver.js";

export const getSeekerSteps = (driverObj: any): DriveStep[] => [
    {
        element: '[data-tutorial-id="map-action-buttons"]',
        popover: {
            title: "Map Controls",
            description:
                "Use these buttons to re-center the map on your location, zoom to the potential hiding areas or view the entire map.",
            side: "left",
            align: "start",
            showButtons: ["next"],
        },
    },
    {
        element: '[data-tutorial-id="right-sidebar-trigger"]',
        popover: {
            title: "Game Setup",
            description:
                "This opens the right sidebar, where you can adjust the Hiders head start time and toggle & adjust Hiding Zones.",
            side: "left",
            align: "start",
        },
    },
    {
        element: '[data-tutorial-id="tutorial-share-state-btn"]',
        popover: {
            title: "Share Game",
            description:
                "Use this to share your current Game State (settings, zones, questions) with the other players.",
            side: "top",
            align: "end",
        },
    },
    {
        element: '[data-tutorial-id="tutorial-options-btn"]',
        popover: {
            title: "Options",
            description:
                "Access to the Rules, Hider Mode, recommended Starting Point, and more.",
            side: "top",
            align: "end",
        },
    },
    {
        element: '[data-tutorial-id="add-question-btn"]',
        popover: {
            title: "Questions",
            description: "Add a question by clicking here.",
            side: "right",
            align: "start",
            showButtons: [],
            onPopoverRender: () => {
                const btn = document.querySelector(
                    '[data-tutorial-id="add-question-btn"]',
                );
                if (btn) {
                    btn.addEventListener(
                        "click",
                        () => {
                            const checkInterval = setInterval(() => {
                                const radarBtn = document.querySelector(
                                    '[data-tutorial-id="tutorial-add-radar-5"]',
                                );
                                if (radarBtn) {
                                    clearInterval(checkInterval);
                                    setTimeout(() => driverObj.moveNext(), 300);
                                }
                            }, 100);
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
            showButtons: [],
            onPopoverRender: () => {
                const btn = document.querySelector(
                    '[data-tutorial-id="tutorial-add-radar-5"]',
                );
                if (btn) {
                    btn.addEventListener(
                        "click",
                        () => {
                            const checkInterval = setInterval(() => {
                                const floatingPanel = document.querySelector(
                                    '[data-tutorial-id="tutorial-close-panel-btn"]',
                                );
                                if (floatingPanel) {
                                    clearInterval(checkInterval);
                                    setTimeout(() => driverObj.moveNext(), 300);
                                }
                            }, 100);
                        },
                        { once: true },
                    );
                }
            },
        },
    },
    {
        element: '[data-tutorial-id="tutorial-question-rules-btn"]',
        popover: {
            title: "How it works",
            description:
                "Clicking here brings up the specific rules for the question you are currently asking.",
            side: "bottom",
            align: "end",
        },
    },
    {
        element: '[data-tutorial-id="tutorial-gps-btn"]',
        popover: {
            title: "Set to Current Location",
            description:
                "Automatically set the question's marker using your device's GPS.",
            side: "bottom",
            align: "center",
        },
    },
    {
        element: '[data-tutorial-id="tutorial-share-question-btn"]',
        popover: {
            title: "Ask Question",
            description:
                "When the Seekers agree on a question they'll click here and send the question to the Hider.",
            side: "bottom",
            align: "end",
        },
    },
    {
        element: '[data-tutorial-id="tutorial-question-result-toggle"]',
        popover: {
            title: "Enter the Result",
            description:
                "Based on the Hider's answer, select the appropriate result here. (Leave it as 'Inside' for now.)",
            side: "bottom",
            align: "center",
            onPopoverRender: () => {
                driverObj.setConfig({
                    ...driverObj.getConfig(),
                    disableActiveInteraction: false,
                });
            },
        },
    },
    {
        element: '[data-tutorial-id="tutorial-lock-btn"]',
        popover: {
            title: "Lock Your Answer",
            description:
                "Once you receive your answer from the Hider, lock the question using this button. (Try it now!)",
            side: "bottom",
            align: "end",
            showButtons: [],
            onPopoverRender: () => {
                driverObj.setConfig({
                    ...driverObj.getConfig(),
                    disableActiveInteraction: false,
                });

                const checkInterval = setInterval(() => {
                    const lockBtn = document.querySelector(
                        '[data-tutorial-id="tutorial-lock-btn"]',
                    );
                    if (
                        lockBtn &&
                        lockBtn.getAttribute("aria-label") === "Unlock Question"
                    ) {
                        clearInterval(checkInterval);
                        setTimeout(() => driverObj.moveNext(), 350);
                    }
                }, 100);
            },
        },
    },
    {
        element: '[data-tutorial-id="tutorial-close-panel-btn"]',
        popover: {
            title: "Close Question",
            description: "Click here to close the question panel.",
            side: "bottom",
            align: "end",
            showButtons: [],
            onPopoverRender: () => {
                driverObj.setConfig({
                    ...driverObj.getConfig(),
                    disableActiveInteraction: false,
                });

                if ((driverObj as any)._closeCheckInterval) {
                    clearInterval((driverObj as any)._closeCheckInterval);
                }

                const checkInterval = setInterval(() => {
                    const closeBtn = document.querySelector(
                        '[data-tutorial-id="tutorial-close-panel-btn"]',
                    );
                    if (!closeBtn) {
                        clearInterval(checkInterval);
                        setTimeout(() => driverObj.moveNext(), 300);
                    } else if (
                        !closeBtn.hasAttribute("data-listener-attached")
                    ) {
                        closeBtn.setAttribute("data-listener-attached", "true");
                        closeBtn.addEventListener(
                            "click",
                            () => {
                                clearInterval(checkInterval);
                                setTimeout(() => driverObj.moveNext(), 300);
                            },
                            { once: true },
                        );
                    }
                }, 100);
                (driverObj as any)._closeCheckInterval = checkInterval;
            },
        },
        onDeselected: () => {
            if ((driverObj as any)._closeCheckInterval) {
                clearInterval((driverObj as any)._closeCheckInterval);
            }
        },
    },
    {
        element: '[data-tutorial-id="map-action-buttons"]',
        popover: {
            title: "Map Controls",
            description:
                "Try clicking the middle button. This will zoom to the newly created potential hiding area.",
            side: "left",
            align: "start",
        },
    },
    {
        element: '[data-tutorial-id="left-sidebar-trigger"]',
        popover: {
            title: "Open the Sidebar",
            description: "Click here to manage your questions.",
            side: "right",
            align: "start",
            showButtons: [],
            onPopoverRender: () => {
                driverObj.setConfig({
                    ...driverObj.getConfig(),
                    disableActiveInteraction: false,
                });

                const sidebarL = document.querySelector(
                    '.peer[data-side="left"]',
                );
                if (
                    sidebarL &&
                    sidebarL.getAttribute("data-state") === "expanded"
                ) {
                    setTimeout(() => driverObj.moveNext(), 10);
                    return;
                }

                const checkInterval = setInterval(() => {
                    const pasteBtn = document.querySelector(
                        '[data-tutorial-id="tutorial-paste-question-btn"]',
                    );
                    const currentSidebar = document.querySelector(
                        '.peer[data-side="left"]',
                    );
                    if (
                        pasteBtn ||
                        (currentSidebar &&
                            currentSidebar.getAttribute("data-state") ===
                                "expanded")
                    ) {
                        clearInterval(checkInterval);
                        setTimeout(() => driverObj.moveNext(), 300);
                    }
                }, 100);
                (driverObj as any)._openSidebarCheckInterval = checkInterval;
            },
        },
        onDeselected: () => {
            if ((driverObj as any)._openSidebarCheckInterval) {
                clearInterval((driverObj as any)._openSidebarCheckInterval);
            }
        },
    },
    {
        element: '[data-tutorial-id="time-penalty-tracker"]',
        popover: {
            title: "Time Penalty",
            description:
                "Locking a question automatically increases the Time Penalty.",
            side: "right",
            align: "start",
            onPopoverRender: () => {
                driverObj.setConfig({
                    ...driverObj.getConfig(),
                    disableActiveInteraction: true,
                });
            },
        },
        onDeselected: () => {
            driverObj.setConfig({
                ...driverObj.getConfig(),
                disableActiveInteraction: false,
            });
        },
    },
    {
        element: '[data-tutorial-id="tutorial-lock-btn"]',
        popover: {
            title: "Unlock a Question",
            description: "Made a mistake? Click the lock to unlock it.",
            side: "bottom",
            align: "end",
            showButtons: [],
            onPopoverRender: () => {
                driverObj.setConfig({
                    ...driverObj.getConfig(),
                    disableActiveInteraction: false,
                });

                const checkInterval = setInterval(() => {
                    const lockBtn = document.querySelector(
                        '[data-tutorial-id="tutorial-lock-btn"]',
                    );
                    if (
                        lockBtn &&
                        lockBtn.getAttribute("aria-label") === "Lock Question"
                    ) {
                        clearInterval(checkInterval);
                        setTimeout(() => driverObj.moveNext(), 300);
                    }
                }, 100);

                (driverObj as any)._unlockCheckInterval = checkInterval;
            },
        },
    },
    {
        element: '[data-tutorial-id="tutorial-delete-question-btn"]',
        popover: {
            title: "Delete the Question",
            description:
                "Click the delete button to remove this test question and finish the tutorial.",
            side: "bottom",
            align: "end",
            showButtons: [],
            onPopoverRender: () => {
                driverObj.setConfig({
                    ...driverObj.getConfig(),
                    disableActiveInteraction: false,
                });

                const checkInterval = setInterval(() => {
                    const btn = document.querySelector(
                        '[data-tutorial-id="tutorial-delete-question-btn"]',
                    );

                    if (btn && !btn.hasAttribute("data-listener-attached")) {
                        btn.setAttribute("data-listener-attached", "true");

                        const onClick = () => {
                            setTimeout(() => driverObj.moveNext(), 500);
                        };

                        btn.addEventListener("click", onClick, { once: true });

                        (driverObj as any)._deleteBtn = btn;
                        (driverObj as any)._deleteBtnOnClick = onClick;
                    }
                }, 100);

                (driverObj as any)._deleteBtnInterval = checkInterval;
            },
        },
    },
];
