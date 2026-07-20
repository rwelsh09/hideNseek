import type { DriveStep } from "driver.js";

export const getHiderSteps = (hiderDriverObj: any): DriveStep[] => [
    {
        popover: {
            title: "Welcome Hider!",
            description: "",
            side: "top",
            align: "center",
            showButtons: ["next", "close"],
            onPopoverRender: () => {
                hiderDriverObj.setConfig({
                    ...hiderDriverObj.getConfig(),
                    disableActiveInteraction: false,
                    overlayClickBehavior: () => {}
                });
            }
        }
    },
    {
        element: '.tutorial-marker-green',
        popover: {
            title: "Hider Location",
            description: "Click on the green Map Marker to open its location settings.",
            side: "top",
            align: "center",
            showButtons: [],
            onPopoverRender: () => {
                hiderDriverObj.setConfig({
                    ...hiderDriverObj.getConfig(),
                    disableActiveInteraction: false,
                });

                if ((hiderDriverObj as any)._markerClickCheckInterval) {
                    clearInterval((hiderDriverObj as any)._markerClickCheckInterval);
                }
                const checkInterval = setInterval(() => {
                    const gpsBtn = document.querySelector('#hider-location-panel [data-tutorial-id="tutorial-gps-btn"]');
                    if (gpsBtn) {
                        clearInterval(checkInterval);
                        setTimeout(() => hiderDriverObj.moveNext(), 300);
                    }
                }, 100);
                (hiderDriverObj as any)._markerClickCheckInterval = checkInterval;
            }
        },
        onDeselected: () => {
            if ((hiderDriverObj as any)._markerClickCheckInterval) {
                clearInterval((hiderDriverObj as any)._markerClickCheckInterval);
            }
        }
    },
    {
        element: '#hider-location-panel [data-tutorial-id="tutorial-gps-btn"]',
        popover: {
            title: "Set Location",
            description: "When you've arrived in your Hiding Zone, click the GPS button to set your hiding location. This is required for accurate question answering.",
            side: "bottom",
            align: "center",
            showButtons: ["next", "close"],
            onPopoverRender: () => {
                hiderDriverObj.setConfig({
                    ...hiderDriverObj.getConfig(),
                    disableActiveInteraction: false,
                });
            }
        }
    },
    {
        element: '[data-tutorial-id="tutorial-close-panel-btn"]',
        popover: {
            title: "Close Dialog",
            description: "Close this dialog to reveal the Paste Question button.",
            side: "bottom",
            align: "center",
            showButtons: [],
            onPopoverRender: () => {
                hiderDriverObj.setConfig({
                    ...hiderDriverObj.getConfig(),
                    disableActiveInteraction: false,
                });
                if ((hiderDriverObj as any)._popupCloseCheckInterval) {
                    clearInterval((hiderDriverObj as any)._popupCloseCheckInterval);
                }
                const checkInterval = setInterval(() => {
                    const popup = document.querySelector('[data-tutorial-id="tutorial-close-panel-btn"]');
                    if (!popup) {
                        clearInterval(checkInterval);
                        setTimeout(() => hiderDriverObj.moveNext(), 300);
                    }
                }, 100);
                (hiderDriverObj as any)._popupCloseCheckInterval = checkInterval;
            }
        },
        onDeselected: () => {
            if ((hiderDriverObj as any)._popupCloseCheckInterval) {
                clearInterval((hiderDriverObj as any)._popupCloseCheckInterval);
            }
        }
    },
    {
        element: '[data-tutorial-id="tutorial-paste-question-btn"]',
        popover: {
            title: "Answering Questions",
            description: "When a Seeker shares a question with you, you can click this button to paste it onto the map and see the answer.",
            side: "right",
            align: "end",
            showButtons: ["next", "close"]
        },
    }
];