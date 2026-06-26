import "driver.js/dist/driver.css";

import { useStore } from "@nanostores/react";
import { driver } from "driver.js";
import { useEffect } from "react";

import { hasSeenRules, showTutorial } from "@/lib/context";

export const TutorialManager = () => {
    const $showTutorial = useStore(showTutorial);
    const $hasSeenRules = useStore(hasSeenRules);

    useEffect(() => {
        if ($showTutorial) {
            const driverObj = driver({
                showProgress: true,
                onDestroyStarted: () => {
                    // Check if it's a natural completion or explicit end/skip
                    const isNaturalCompletion = !driverObj.hasNextStep() && driverObj.hasPreviousStep() && hasSeenRules.get();
                    const isNavigationSkip = !driverObj.hasNextStep() && !hasSeenRules.get() && driverObj.hasPreviousStep();

                    if (isNaturalCompletion || isNavigationSkip || confirm("Are you sure you want to end the tutorial?")) {
                        driverObj.destroy();
                        if (isNaturalCompletion || !isNavigationSkip) {
                            showTutorial.set(false);
                        }
                    }
                },
                steps: !$hasSeenRules
                    ? [
                          {
                              element:
                                  '[data-tutorial-id="option-drawers-trigger"]',
                              popover: {
                                  title: "Welcome to Hide & Seek",
                                  description:
                                      "Before we begin, open the Settings & Options menu so you can read the Rules & Tips.",
                                  side: "top",
                                  align: "end",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          allowActiveInteraction: true,
                                      } as any);

                                      const trigger =
                                          document.querySelector<HTMLElement>(
                                              '[data-tutorial-id="option-drawers-trigger"] button',
                                          ) ||
                                          document.querySelector<HTMLElement>(
                                              '[data-tutorial-id="option-drawers-trigger"]',
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
                                          allowActiveInteraction: true,
                                      } as any);
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
                                      "Open the left sidebar to add and manage questions for the game.",
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
                                      "Open the right sidebar to toggle Hiding Zones.",
                                  side: "left",
                                  align: "start",
                              },
                          },
                          {
                              element:
                                  '[data-tutorial-id="option-drawers-trigger"]',
                              popover: {
                                  title: "Settings & Options",
                                  description:
                                      "Access map settings, transit lines overlays, save states, sharing options, and extra tools.",
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
                                  showButtons: ["previous"], // Hide Next button to force interaction
                                  onPopoverRender: () => {
                                      const sidebarL = document.querySelector(
                                          '.peer[data-side="left"]',
                                      );
                                      // If the sidebar is already expanded (desktop), immediately skip this interaction step
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
                                  showButtons: ["previous"], // Hide Next button to force interaction
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
                                                              // Adding slight timeout for overlay animation
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
                                  showButtons: ["previous"], // Hide Next button
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
                                  '[data-tutorial-id="left-sidebar-trigger"]',
                              popover: {
                                  title: "Open the Sidebar",
                                  description:
                                      "Drag the question on the map to your desired location, then open the sidebar to lock it.",
                                  side: "right",
                                  align: "start",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          allowActiveInteraction: true,
                                      } as any);

                                      const sidebarL = document.querySelector(
                                          '.peer[data-side="left"]',
                                      );
                                      // If the sidebar is already expanded (desktop), immediately skip this interaction step
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
                                  '.peer[data-side="left"] [data-tutorial-id="tutorial-question-rules-btn"]',
                              popover: {
                                  title: "How it works",
                                  description:
                                      "Click here to see the specific rules for the question you are currently asking.",
                                  side: "bottom",
                                  align: "end",
                              },
                          },
                          {
                              element:
                                  '.peer[data-side="left"] [data-tutorial-id="tutorial-share-question-btn"]',
                              popover: {
                                  title: "Share Question",
                                  description:
                                      "Need to send the question details to another player? You can copy and share it from here.",
                                  side: "bottom",
                                  align: "end",
                              },
                          },
                          {
                              element:
                                  '.peer[data-side="left"] [data-tutorial-id="tutorial-delete-question-btn"]',
                              popover: {
                                  title: "Delete Question",
                                  description:
                                      "Made a mistake? Use this to remove the question.",
                                  side: "bottom",
                                  align: "end",
                              },
                          },
                          {
                              element:
                                  '.peer[data-side="left"] [data-tutorial-id="tutorial-gps-btn"]',
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
                                  '.peer[data-side="left"] [data-tutorial-id="tutorial-clipboard-paste-btn"]',
                              popover: {
                                  title: "Paste Coordinates",
                                  description:
                                      "Paste coordinates you copied previously directly into the question.",
                                  side: "bottom",
                                  align: "center",
                              },
                          },
                          {
                              element:
                                  '.peer[data-side="left"] [data-tutorial-id="tutorial-clipboard-copy-btn"]',
                              popover: {
                                  title: "Copy Coordinates",
                                  description:
                                      "Quickly copy the current coordinates to your clipboard.",
                                  side: "bottom",
                                  align: "center",
                              },
                          },
                          {
                              element:
                                  '.peer[data-side="left"] [data-tutorial-id="tutorial-lock-btn"]',
                              popover: {
                                  title: "Lock Your Answer",
                                  description:
                                      "Once you receive your answer from the Hider, lock the question using this button.",
                                  side: "bottom",
                                  align: "end",
                                  showButtons: ["previous"],
                                  onPopoverRender: () => {
                                      // Let the user interact with the map
                                      driverObj.setConfig({
                                          ...driverObj.getConfig(),
                                          allowActiveInteraction: true,
                                      } as any);

                                      const checkInterval = setInterval(() => {
                                          const lockBtn =
                                              document.querySelector(
                                                  '[data-tutorial-id="tutorial-lock-btn"]',
                                              );
                                          // The aria-label changes to "Unlock Question" when the question is currently locked
                                          if (
                                              lockBtn &&
                                              lockBtn.getAttribute(
                                                  "aria-label",
                                              ) === "Unlock Question"
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
                              element:
                                  '[data-tutorial-id="time-penalty-tracker"]',
                              popover: {
                                  title: "Time Penalty",
                                  description:
                                      "Locking a question automatically increases the Time Penalty. Keep an eye on it!",
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
    }, [$showTutorial, $hasSeenRules]);

    return null;
};
