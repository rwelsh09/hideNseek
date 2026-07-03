import "driver.js/dist/driver.css";

import { useStore } from "@nanostores/react";
import { driver } from "driver.js";
import React, { useEffect } from "react";

import {
    anyDrawerOpenSignal,
    hasSeenRules,
    showNextStepsChecklist,
    showTutorial,
} from "@/lib/context";

export const TutorialManager = () => {
    const $showTutorial = useStore(showTutorial);
    const $hasSeenRules = useStore(hasSeenRules);

    useEffect(() => {
        if ($showTutorial) {
            const driverObj = driver({
                disableActiveInteraction: false,
                allowClose: false,
                showProgress: true,
                onDestroyStarted: () => {
                    const isRulesPhase =
                        driverObj.getConfig().steps?.length === 2;

                    if (isRulesPhase) {
                        driverObj.destroy();
                    } else {
                        if (
                            !driverObj.hasNextStep() ||
                            confirm(
                                "Are you sure you want to end the tutorial?",
                            )
                        ) {
                            driverObj.destroy();
                            showTutorial.set(false);
                            showNextStepsChecklist.set(true);
                        }
                    }
                },
                steps: !$hasSeenRules
                    ? [
                          {
                              element:
                                  '[data-tutorial-id="tutorial-options-btn"]',
                              popover: {
                                  title: "Welcome to Hide & Seek",
                                  description:
                                      "Before we begin, open the Options menu so you can read the Rules.",
                                  side: "top",
                                  align: "end",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          disableActiveInteraction: false,
                                      });

                                      const trigger =
                                          document.querySelector<HTMLElement>(
                                              '[data-tutorial-id="tutorial-options-btn"]',
                                          );

                                      if (trigger) {
                                          trigger.addEventListener(
                                              "click",
                                              () => {
                                                  const checkInterval =
                                                      setInterval(() => {
                                                          const rulesBtn =
                                                              document.querySelector(
                                                                  '[data-tutorial-id="tutorial-rules-btn"]',
                                                              );
                                                          if (rulesBtn) {
                                                              clearInterval(
                                                                  checkInterval,
                                                              );
                                                              setTimeout(
                                                                  () =>
                                                                      driverObj.moveNext(),
                                                                  300,
                                                              );
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
                              element:
                                  '[data-tutorial-id="tutorial-rules-btn"]',
                              popover: {
                                  title: "Read the Rules",
                                  description:
                                      "Click here to read how the game works. When you return to the map, the tutorial will continue.",
                                  side: "top",
                                  align: "center",
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          disableActiveInteraction: false,
                                      });
                                  },
                              },
                          },
                      ]
                    : [
                          {
                              element:
                                  '[data-tutorial-id="map-action-buttons"]',
                              popover: {
                                  title: "Map Controls",
                                  description:
                                      "Use these buttons to re-center the map on your location, zoom to the potential hiding areas, or view the entire map.",
                                  side: "left",
                                  align: "start",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="left-sidebar-trigger"]',
                              popover: {
                                  title: "Questions",
                                  description:
                                      "This opens the left sidebar, where you add and manage questions for the game.",
                                  side: "right",
                                  align: "start",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="timer-drawer-trigger"]',
                              popover: {
                                  title: "Timer & Leaderboard",
                                  description:
                                      "Clicking here opens your timer and leaderboard.",
                                  side: "right",
                                  align: "start",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="right-sidebar-trigger"]',
                              popover: {
                                  title: "Game State",
                                  description:
                                      "This opens the right sidebar, where you can set the Hiders head start time and toggle Hiding Zones.",
                                  side: "left",
                                  align: "start",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-share-state-btn"]',
                              popover: {
                                  title: "Share Game State",
                                  description:
                                      "Once your head start and hiding zone are set, use this to share your exact Game State with the Seekers so they can load it on their devices.",
                                  side: "top",
                                  align: "end",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-options-btn"]',
                              popover: {
                                  title: "Options",
                                  description:
                                      "Access map settings, transit lines overlays, manual save states, and more.",
                                  side: "top",
                                  align: "end",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="left-sidebar-trigger"]',
                              popover: {
                                  title: "Open the Sidebar",
                                  description:
                                      "Click here to open the sidebar so we can add a question.",
                                  side: "right",
                                  align: "start",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      const sidebarL = document.querySelector(
                                          '.peer[data-side="left"]',
                                      );
                                      if (
                                          sidebarL &&
                                          sidebarL.getAttribute(
                                              "data-state",
                                          ) === "expanded"
                                      ) {
                                          setTimeout(
                                              () => driverObj.moveNext(),
                                              10,
                                          );
                                          return;
                                      }

                                      const trigger =
                                          document.querySelector<HTMLElement>(
                                              '[data-tutorial-id="left-sidebar-trigger"] button',
                                          ) ||
                                          document.querySelector<HTMLElement>(
                                              '[data-sidebar="trigger"]',
                                          );

                                      if (trigger) {
                                          trigger.addEventListener(
                                              "click",
                                              () => {
                                                  const checkInterval =
                                                      setInterval(() => {
                                                          const addBtn =
                                                              document.querySelector(
                                                                  '[data-tutorial-id="add-question-btn"]',
                                                              );
                                                          if (addBtn) {
                                                              clearInterval(
                                                                  checkInterval,
                                                              );
                                                              setTimeout(
                                                                  () =>
                                                                      driverObj.moveNext(),
                                                                  300,
                                                              );
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
                              element: '[data-tutorial-id="add-question-btn"]',
                              popover: {
                                  title: "Ask a Question",
                                  description: "Click here to add a question.",
                                  side: "right",
                                  align: "start",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      const btn = document.querySelector(
                                          '[data-tutorial-id="add-question-btn"]',
                                      );
                                      if (btn) {
                                          btn.addEventListener(
                                              "click",
                                              () => {
                                                  const checkInterval =
                                                      setInterval(() => {
                                                          const radarBtn =
                                                              document.querySelector(
                                                                  '[data-tutorial-id="tutorial-add-radar-5"]',
                                                              );
                                                          if (radarBtn) {
                                                              clearInterval(
                                                                  checkInterval,
                                                              );
                                                              setTimeout(
                                                                  () =>
                                                                      driverObj.moveNext(),
                                                                  300,
                                                              );
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
                              element:
                                  '[data-tutorial-id="tutorial-add-radar-5"]',
                              popover: {
                                  title: "Choose a Question Type",
                                  description:
                                      "Let's ask a 5 km Radar question. Click here to add it to the map.",
                                  side: "right",
                                  align: "start",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      const btn = document.querySelector(
                                          '[data-tutorial-id="tutorial-add-radar-5"]',
                                      );
                                      if (btn) {
                                          btn.addEventListener(
                                              "click",
                                              () => {
                                                  setTimeout(
                                                      () =>
                                                          driverObj.moveNext(),
                                                      500,
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
                                  '[data-tutorial-id="tutorial-store-question-btn"]',
                              popover: {
                                  title: "Store the Question",
                                  description:
                                      "You can move the marker to see how it affects the map, but for now just click here to store it in your sidebar and continue.",
                                  side: "top",
                                  align: "center",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          disableActiveInteraction: false,
                                      });

                                      const btn = document.querySelector(
                                          '[data-tutorial-id="tutorial-store-question-btn"]',
                                      );
                                      if (btn) {
                                          btn.addEventListener(
                                              "click",
                                              () => {
                                                  setTimeout(
                                                      () =>
                                                          driverObj.moveNext(),
                                                      500,
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
                                  '[data-tutorial-id="left-sidebar-trigger"]',
                              popover: {
                                  title: "Open the Sidebar",
                                  description:
                                      "Now open the sidebar to view and lock your question.",
                                  side: "right",
                                  align: "start",
                                  showButtons: ["previous"],
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
                                          sidebarL.getAttribute(
                                              "data-state",
                                          ) === "expanded"
                                      ) {
                                          setTimeout(
                                              () => driverObj.moveNext(),
                                              10,
                                          );
                                          return;
                                      }

                                      const trigger =
                                          document.querySelector<HTMLElement>(
                                              '[data-tutorial-id="left-sidebar-trigger"] button',
                                          ) ||
                                          document.querySelector<HTMLElement>(
                                              '[data-sidebar="trigger"]',
                                          );

                                      if (trigger) {
                                          trigger.addEventListener(
                                              "click",
                                              () => {
                                                  const checkInterval =
                                                      setInterval(() => {
                                                          const lockBtn =
                                                              document.querySelector(
                                                                  '[data-tutorial-id="tutorial-lock-btn"]',
                                                              );
                                                          if (lockBtn) {
                                                              clearInterval(
                                                                  checkInterval,
                                                              );
                                                              setTimeout(
                                                                  () =>
                                                                      driverObj.moveNext(),
                                                                  300,
                                                              );
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
                              element:
                                  '[data-tutorial-id="tutorial-question-rules-btn"]',
                              popover: {
                                  title: "How it works",
                                  description:
                                      "Clicking here brings up the specific rules for the question you are currently asking. (Try it later!)",
                                  side: "bottom",
                                  align: "end",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-share-question-btn"]',
                              popover: {
                                  title: "Share Question",
                                  description:
                                      "Need to send the question details to the Hider? You can copy and share it from here.",
                                  side: "bottom",
                                  align: "end",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-paste-question-btn"]',
                              popover: {
                                  title: "Paste Question",
                                  description:
                                      "If you are the Hider, you can paste the question you copied from the Seekers here to view it on your map.",
                                  side: "bottom",
                                  align: "center",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-delete-question-btn"]',
                              popover: {
                                  title: "Delete Question",
                                  description:
                                      "Feel free to test out questions during the game to see how they will affect things. Use this to remove a question you no longer want.",
                                  side: "bottom",
                                  align: "end",
                              },
                          },
                          {
                              element: '[data-tutorial-id="tutorial-gps-btn"]',
                              popover: {
                                  title: "Set to Current Location",
                                  description:
                                      "Automatically set the marker's coordinates using your device's GPS.",
                                  side: "bottom",
                                  align: "center",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-clipboard-copy-btn"]',
                              popover: {
                                  title: "Copy Coordinates",
                                  description:
                                      "Quickly copy the current coordinates to your clipboard. For easy sharing with the Hider.",
                                  side: "bottom",
                                  align: "center",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-clipboard-paste-btn"]',
                              popover: {
                                  title: "Paste Coordinates",
                                  description:
                                      "Paste coordinates you copied from the Seekers directly into the question.",
                                  side: "bottom",
                                  align: "center",
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
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          disableActiveInteraction: false,
                                      });

                                      const checkInterval = setInterval(() => {
                                          const lockBtn =
                                              document.querySelector(
                                                  '[data-tutorial-id="tutorial-lock-btn"]',
                                              );
                                          if (
                                              lockBtn &&
                                              lockBtn.getAttribute(
                                                  "aria-label",
                                              ) === "Unlock Question"
                                          ) {
                                              clearInterval(checkInterval);
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
                              element:
                                  '[data-tutorial-id="time-penalty-tracker"]',
                              popover: {
                                  title: "Time Penalty",
                                  description:
                                      "Locking a question automatically increases the Time Penalty!",
                                  side: "right",
                                  align: "start",
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
                                  title: "Unlock Your Answer",
                                  description:
                                      "Oops, we made a mistake! Let's unlock the question so we can delete it. (Click it to unlock)",
                                  side: "bottom",
                                  align: "end",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          disableActiveInteraction: false,
                                      });

                                      const checkInterval = setInterval(() => {
                                          const lockBtn =
                                              document.querySelector(
                                                  '[data-tutorial-id="tutorial-lock-btn"]',
                                              );
                                          if (
                                              lockBtn &&
                                              lockBtn.getAttribute(
                                                  "aria-label",
                                              ) === "Lock Question"
                                          ) {
                                              clearInterval(checkInterval);
                                              setTimeout(
                                                  () => driverObj.moveNext(),
                                                  300,
                                              );
                                          }
                                      }, 100);

                                      (driverObj as any)._unlockCheckInterval =
                                          checkInterval;
                                  },
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-delete-question-btn"]',
                              popover: {
                                  title: "Delete the Question",
                                  description:
                                      "Now click the delete button to remove this test question and finish the tutorial.",
                                  side: "bottom",
                                  align: "end",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          disableActiveInteraction: false,
                                      });

                                      const checkInterval = setInterval(() => {
                                          const btn = document.querySelector(
                                              '[data-tutorial-id="tutorial-delete-question-btn"]',
                                          );

                                          if (
                                              btn &&
                                              !btn.hasAttribute(
                                                  "data-listener-attached",
                                              )
                                          ) {
                                              btn.setAttribute(
                                                  "data-listener-attached",
                                                  "true",
                                              );

                                              const onClick = () => {
                                                  setTimeout(
                                                      () =>
                                                          driverObj.moveNext(),
                                                      500,
                                                  );
                                              };

                                              btn.addEventListener(
                                                  "click",
                                                  onClick,
                                                  { once: true },
                                              );

                                              (driverObj as any)._deleteBtn =
                                                  btn;
                                              (
                                                  driverObj as any
                                              )._deleteBtnOnClick = onClick;
                                          }
                                      }, 100);

                                      (driverObj as any)._deleteBtnInterval =
                                          checkInterval;
                                  },
                              },
                          },
                      ],
            });

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
    }, [$showTutorial, $hasSeenRules]);

    return null;
};

export const TutorialNudgeOverlay = () => {
    const $showTutorial = useStore(showTutorial);
    const $anyDrawerOpen = useStore(anyDrawerOpenSignal);

    // Check if the current driver element is inside an open drawer
    // If NOT, but a drawer is open, show a full-screen semi-transparent block with a message
    const [shouldNudge, setShouldNudge] = React.useState(false);

    React.useEffect(() => {
        if ($showTutorial && $anyDrawerOpen) {
            // Give driver.js time to update its active element if step changed
            const timer = setTimeout(() => {
                const activeElement = document.querySelector(
                    ".driver-active-element",
                );
                if (activeElement) {
                    const inVaul = activeElement.closest(
                        '[vaul-drawer][data-state="open"]',
                    );
                    const inMobileSheet = activeElement.closest(
                        '[role="dialog"][data-state="open"]',
                    );
                    const inRightSidebar = activeElement.closest(
                        '.peer[data-side="right"][data-state="expanded"]',
                    );

                    const rightExpanded = document.querySelector(
                        '.peer[data-side="right"][data-state="expanded"]',
                    );
                    const anyVaulDrawerOpen = document.querySelector(
                        '[vaul-drawer][data-state="open"]',
                    );
                    const anyMobileSheetOpen = document.querySelector(
                        '[role="dialog"][data-state="open"]',
                    );

                    let nudge = false;
                    if (anyVaulDrawerOpen && !inVaul) nudge = true;
                    if (anyMobileSheetOpen && !inMobileSheet) nudge = true;
                    if (rightExpanded && !inRightSidebar) nudge = true;

                    setShouldNudge(nudge);
                }
            }, 50);
            return () => clearTimeout(timer);
        } else {
            setShouldNudge(false);
        }
    }, [$showTutorial, $anyDrawerOpen]);

    if (!shouldNudge) return null;

    return (
        <div className="fixed inset-0 z-[2000000] flex items-center justify-center bg-black/60 pointer-events-none">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow-2xl text-center max-w-sm mx-4">
                <h3 className="text-xl font-bold text-white mb-2">
                    Return to Tutorial
                </h3>
                <p className="text-slate-300">
                    Please close the currently open sidebar or menu to return to
                    the tutorial.
                </p>
            </div>
        </div>
    );
};
