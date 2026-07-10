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

    useEffect(() => {
        if ($hiderMode !== false && $showHiderTutorial && !$showTutorial) {
            const hiderDriverObj = driver({
                showProgress: true,
                overlayClickBehavior: () => {},
                onDestroyStarted: () => {
                    hiderDriverObj.destroy();
                    showHiderTutorial.set(false);
                },
                steps: [
                    {
                        element: '[data-tutorial-id="options-drawer"]',
                        popover: {
                            title: "Welcome Hider!",
                            description: "Close this options menu I have a couple things to show you.",
                            side: "top",
                            align: "center",
                            onPopoverRender: () => {
                                hiderDriverObj.setConfig({
                                    ...hiderDriverObj.getConfig(),
                                    disableActiveInteraction: false,
                                    overlayClickBehavior: () => {
                                        isOptionsOpenStore.set(false);
                                    }
                                });

                                const checkInterval = setInterval(() => {
                                    if (!isOptionsOpenStore.get()) {
                                        clearInterval(checkInterval);
                                        setTimeout(() => hiderDriverObj.moveNext(), 300);
                                    }
                                }, 100);
                                
                                (hiderDriverObj as any)._closeOptionsCheckInterval = checkInterval;
                            },
                            onDeselected: () => {
                                if ((hiderDriverObj as any)._closeOptionsCheckInterval) {
                                    clearInterval((hiderDriverObj as any)._closeOptionsCheckInterval);
                                }
                                hiderDriverObj.setConfig({
                                    ...hiderDriverObj.getConfig(),
                                    overlayClickBehavior: () => {}
                                });
                            }
                        }
                    },
                    {
                        element: '[data-tutorial-id="hider-location-picker"]',
                        popover: {
                            title: "Hider Location",
                            description: "Place the green Map Marker on your hiding spot so the app can calculate the answers to give the Seekers.",
                            side: "top",
                            align: "center",
                        },
                    },
                    {
                        element: '[data-tutorial-id="tutorial-paste-question-btn"]',
                        popover: {
                            title: "Answering Questions",
                            description: "When a Seeker shares a question with you, click this button to paste it onto the map and see the answer.",
                            side: "right",
                            align: "end",
                        },
                    }
                ]
            });
            tutorialDriver.set(hiderDriverObj);
            setTimeout(() => {
                hiderDriverObj.drive();
            }, 500);

            return () => {
                document.removeEventListener('tutorial-next', handleNext);
                tutorialDriver.set(null);
                try {
                    hiderDriverObj.destroy();
                } catch {
                    /* ignore */
                }
            };
        }
    }, [$hiderMode, $showHiderTutorial, $showTutorial]);

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
                              popover: {
                                  title: "UI Overview",
                                  description: `
                                      <div class="mt-4 text-sm text-left space-y-4">
                                          <p class="text-muted-foreground">The core features are highlighted on your screen.</p>
                                          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <li class="flex items-start gap-2">
                                                  <span class="flex h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                  <div><strong class="text-foreground">Map Controls:</strong><br/>Re-center, zoom, and adjust view.</div>
                                              </li>
                                              <li class="flex items-start gap-2">
                                                  <span class="flex h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                  <div><strong class="text-foreground">Questions:</strong><br/>Manage your asked questions.</div>
                                              </li>
                                              <li class="flex items-start gap-2">
                                                  <span class="flex h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                  <div><strong class="text-foreground">Timer:</strong><br/>View timer and leaderboard.</div>
                                              </li>
                                              <li class="flex items-start gap-2">
                                                  <span class="flex h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                  <div><strong class="text-foreground">Game Setup:</strong><br/>Set head start and Hiding Zones.</div>
                                              </li>
                                              <li class="flex items-start gap-2">
                                                  <span class="flex h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                  <div><strong class="text-foreground">Share Setup:</strong><br/>Share exact settings with others.</div>
                                              </li>
                                              <li class="flex items-start gap-2">
                                                  <span class="flex h-2 w-2 mt-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                  <div><strong class="text-foreground">Options:</strong><br/>Hider Mode, overlays, and more.</div>
                                              </li>
                                          </ul>
                                      </div>
                                      <div class="mt-6 flex justify-end">
                                          <button id="custom-next-btn" class="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">Continue</button>
                                      </div>
                                  `,
                                  side: "bottom",
                                  align: "center",
                                  showButtons: [],
                                  onPopoverRender: () => {
                                      const elementsToHighlight = [
                                          { id: '[data-tutorial-id="map-action-buttons"]', label: 'Map Controls' },
                                          { id: '[data-tutorial-id="left-sidebar-trigger"]', label: 'Questions' },
                                          { id: '[data-tutorial-id="timer-drawer-trigger"]', label: 'Timer' },
                                          { id: '[data-tutorial-id="right-sidebar-trigger"]', label: 'Game Setup' },
                                          { id: '[data-tutorial-id="tutorial-share-state-btn"]', label: 'Share Setup' },
                                          { id: '[data-tutorial-id="tutorial-options-btn"]', label: 'Options' }
                                      ];

                                      const container = document.createElement('div');
                                      container.id = 'tutorial-labels-container';
                                      container.className = 'fixed inset-0 pointer-events-none z-[1000001]';
                                      document.body.appendChild(container);

                                      elementsToHighlight.forEach(item => {
                                          const el = document.querySelector(item.id);
                                          if (el) {
                                              el.classList.add('!relative', '!z-[1000000]', 'pointer-events-none', 'ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-black/50', 'rounded-md');

                                              const rect = el.getBoundingClientRect();
                                              const label = document.createElement('div');
                                              label.className = 'absolute bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-white/20 flex items-center gap-1.5';
                                              label.innerHTML = `<span class="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>${item.label}`;

                                              if (rect.top < window.innerHeight / 2) {
                                                  label.style.top = `${rect.bottom + 8}px`;
                                              } else {
                                                  label.style.top = `${rect.top - 28}px`;
                                              }

                                              if (rect.left < window.innerWidth / 2) {
                                                  label.style.left = `${Math.max(8, rect.left)}px`;
                                              } else {
                                                  label.style.left = `${Math.min(window.innerWidth - 8, rect.right)}px`;
                                                  label.style.transform = 'translateX(-100%)';
                                              }

                                              container.appendChild(label);
                                          }
                                      });

                                      const nextBtn = document.getElementById('custom-next-btn');
                                      if (nextBtn) {
                                          nextBtn.addEventListener('click', () => {
                                              const e = new Event('tutorial-next');
                                              document.dispatchEvent(e);
                                          }, { once: true });
                                      }
                                  },
                                  onDeselected: () => {
                                      const container = document.getElementById('tutorial-labels-container');
                                      if (container) container.remove();

                                      const elementsToHighlight = [
                                          '[data-tutorial-id="map-action-buttons"]',
                                          '[data-tutorial-id="left-sidebar-trigger"]',
                                          '[data-tutorial-id="timer-drawer-trigger"]',
                                          '[data-tutorial-id="right-sidebar-trigger"]',
                                          '[data-tutorial-id="tutorial-share-state-btn"]',
                                          '[data-tutorial-id="tutorial-options-btn"]'
                                      ];

                                      elementsToHighlight.forEach(selector => {
                                          const el = document.querySelector(selector);
                                          if (el) {
                                              el.classList.remove('!relative', '!z-[1000000]', 'pointer-events-none', 'ring-2', 'ring-white', 'ring-offset-2', 'ring-offset-black/50', 'rounded-md');
                                          }
                                      });
                                  }
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
                              element: '[data-tutorial-id="left-sidebar-trigger"]',
                              popover: {
                                  title: "Open the Sidebar",
                                  description: "Click here to open the sidebar.",
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
                                      "Locking a question automatically increases the Time Penalty!",
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

            tutorialDriver.set(driverObj);

            const handleNext = () => {
                driverObj.moveNext();
            };
            document.addEventListener('tutorial-next', handleNext);

            setTimeout(() => {
                driverObj.drive();
            }, 500);

            return () => {
                document.removeEventListener('tutorial-next', handleNext);
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
