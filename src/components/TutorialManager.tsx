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
    showNextStepsChecklist,
    showTutorial,
} from "@/lib/context";

export const TutorialManager = () => {
    const $showTutorial = useStore(showTutorial);
    const $hasSeenRules = useStore(hasSeenRules);

    // States for custom confirm dialogs
    const [confirmEndTutorial, setConfirmEndTutorial] = useState(false);
    const [activeDriver, setActiveDriver] = useState<any>(null);

    useEffect(() => {
        if ($showTutorial) {
            const driverObj = driver({
                showProgress: true,
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
                steps: !$hasSeenRules
                    ? [
                          {
                              element:
                                  '[data-tutorial-id="tutorial-options-btn"]',
                              popover: {
                                  title: "Welcome to Hide & Seek",
                                  description:
                                      "Before we begin, open the Options menu and read the Rules.",
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
                                      "Use these buttons to re-center the map on your location, zoom to the potential hiding areas or view the entire map.",
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
                                  title: "Game Setup",
                                  description:
                                      "This opens the right sidebar, where you can set the Hiders head start time and toggle & adjust Hiding Zones.",
                                  side: "left",
                                  align: "start",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-share-state-btn"]',
                              popover: {
                                  title: "Share Game Setup",
                                  description:
                                      "Once the head start and hiding zones are set, you can use this to share the exact Game Setup with the other players.",
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
                                      "Access Hider Mode, recommended Starting Point, transit lines overlays, and more.",
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
                                      "This is the question that you will ask the Hider. For now, just click here to store it in your sidebar and continue.",
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
                                      "When you get the answer from the Hider you will open the sidebar to eneter the result and lock it in.",
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
                                  '[data-tutorial-id="tutorial-question-result-toggle"]',
                              popover: {
                                  title: "Enter the Result",
                                  description:
                                      "Based on the Hider's answer, select the appropriate result here.",
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
                                          disableActiveInteraction: true,
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
