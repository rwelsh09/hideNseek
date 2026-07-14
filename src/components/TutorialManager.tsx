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
    isOptionsOpenStore,
    showHiderTutorial,
    showNextStepsChecklist,
    showTutorial,
    tutorialDriver,
} from "@/lib/context";

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
                overlayClickBehavior: () => {},
                onDestroyStarted: () => {
                    hiderDriverObj.destroy();
                    showHiderTutorial.set(false);
                },
                steps: [
                    {
                        popover: {
                            title: "Welcome Hider!",
                            description: "",
                            side: "top",
                            align: "center",
                            showButtons: ["next"],
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
                            },
                            onDeselected: () => {
                                if ((hiderDriverObj as any)._markerClickCheckInterval) {
                                    clearInterval((hiderDriverObj as any)._markerClickCheckInterval);
                                }
                            }
                        },
                    },
                    {
                        element: '#hider-location-panel [data-tutorial-id="tutorial-gps-btn"]',
                        popover: {
                            title: "Set Location",
                            description: "When you've arrived in your Hiding Zone, click the GPS button to set your hiding location. This is required for accurate question answering.",
                            side: "bottom",
                            align: "center",
                            showButtons: ["next"],
                            onPopoverRender: () => {
                                hiderDriverObj.setConfig({
                                    ...hiderDriverObj.getConfig(),
                                    disableActiveInteraction: false,
                                });
                            }
                        }
                    },
                    {
                        element: '[data-tutorial-id="tutorial-store-question-btn"]',
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
                                    const popup = document.querySelector('[data-tutorial-id="tutorial-store-question-btn"]');
                                    if (!popup) {
                                        clearInterval(checkInterval);
                                        setTimeout(() => hiderDriverObj.moveNext(), 300);
                                    }
                                }, 100);
                                (hiderDriverObj as any)._popupCloseCheckInterval = checkInterval;
                            },
                            onDeselected: () => {
                                if ((hiderDriverObj as any)._popupCloseCheckInterval) {
                                    clearInterval((hiderDriverObj as any)._popupCloseCheckInterval);
                                }
                            }
                        }
                    },
                    {
                        element: '[data-tutorial-id="tutorial-paste-question-btn"]',
                        popover: {
                            title: "Answering Questions",
                            description: "When a Seeker shares a question with you, click this button to paste it onto the map and see the answer.",
                            side: "right",
                            align: "end",
                            showButtons: ["next"]
                        },
                    }
                ]
            });
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
                steps: [
                          {
                              element:
                                  '[data-tutorial-id="map-action-buttons"]',
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
                              element:
                                  '[data-tutorial-id="right-sidebar-trigger"]',
                              popover: {
                                  title: "Game Setup",
                                  description:
                                      "This opens the right sidebar, where you can adjust the Hiders head start time and toggle & adjust Hiding Zones.",
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
                                      "If the head start and hiding zones are changed from their default values. Use this to share the Game Setup with the other players.",
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
                                                  const checkInterval = setInterval(() => {
                                                      const floatingPanel = document.querySelector('[data-tutorial-id="tutorial-store-question-btn"]');
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
                              element:
                                  '[data-tutorial-id="tutorial-question-rules-btn"]',
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
                              element:
                                  '[data-tutorial-id="tutorial-share-question-btn"]',
                              popover: {
                                  title: "Ask Question",
                                  description:
                                      "When the Seekers agree on a question they'll click here and send the question to the Hider.",
                                  side: "bottom",
                                  align: "end",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="tutorial-question-result-toggle"]',
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
                                                  350,
                                              );
                                          }
                                      }, 100);
                                  },
                              },
                          },
                          {
                              element: '[data-tutorial-id="tutorial-store-question-btn"]',
                              popover: {
                                  title: "Close Question",
                                  description: "Click here to close the question panel.",
                                  side: "bottom",
                                  align: "end",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          disableActiveInteraction: false,
                                      });

                                      if ((driverObj as any)._closeCheckInterval) {
                                          clearInterval((driverObj as any)._closeCheckInterval);
                                      }

                                      const checkInterval = setInterval(() => {
                                          const storeBtn = document.querySelector('[data-tutorial-id="tutorial-store-question-btn"]');
                                          if (!storeBtn) {
                                              clearInterval(checkInterval);
                                              setTimeout(() => driverObj.moveNext(), 300);
                                          } else if (!storeBtn.hasAttribute("data-listener-attached")) {
                                              storeBtn.setAttribute("data-listener-attached", "true");
                                              storeBtn.addEventListener("click", () => {
                                                  clearInterval(checkInterval);
                                                  setTimeout(() => driverObj.moveNext(), 300);
                                              }, { once: true });
                                          }
                                      }, 100);
                                      (driverObj as any)._closeCheckInterval = checkInterval;
                                  },
                                  onDeselected: () => {
                                      if ((driverObj as any)._closeCheckInterval) {
                                          clearInterval((driverObj as any)._closeCheckInterval);
                                      }
                                  }
                              }
                          },
                          {
                              element:
                                  '[data-tutorial-id="map-action-buttons"]',
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
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          disableActiveInteraction: false,
                                      });

                                      const sidebarL = document.querySelector('.peer[data-side="left"]');
                                      if (sidebarL && sidebarL.getAttribute("data-state") === "expanded") {
                                          setTimeout(() => driverObj.moveNext(), 10);
                                          return;
                                      }

                                      const checkInterval = setInterval(() => {
                                          const pasteBtn = document.querySelector('[data-tutorial-id="tutorial-paste-question-btn"]');
                                          const currentSidebar = document.querySelector('.peer[data-side="left"]');
                                          if (pasteBtn || (currentSidebar && currentSidebar.getAttribute("data-state") === "expanded")) {
                                              clearInterval(checkInterval);
                                              setTimeout(() => driverObj.moveNext(), 300);
                                          }
                                      }, 100);
                                      (driverObj as any)._openSidebarCheckInterval = checkInterval;
                                  },
                                  onDeselected: () => {
                                      if ((driverObj as any)._openSidebarCheckInterval) {
                                          clearInterval((driverObj as any)._openSidebarCheckInterval);
                                      }
                                  }
                              }
                          },
                          {
                              element:
                                  '[data-tutorial-id="time-penalty-tracker"]',
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
                                  onDeselected: () => {
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
                                  title: "Unlock a Question",
                                  description:
                                      "Made a mistake? Click the lock to unlock it.",
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
                                      "Click the delete button to remove this test question and finish the tutorial.",
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
                      ]
            });

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
