import React, { useEffect, useState } from "react";

import { Button } from "./ui/button";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: Array<string>;
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

declare global {
    interface Window {
        pwaDeferredPrompt?: BeforeInstallPromptEvent;
    }
}

export const PwaInstallTip = () => {
    const [deferredPrompt, setDeferredPrompt] =
        useState<BeforeInstallPromptEvent | null>(null);
    const [isApple, setIsApple] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
        }

        // Check if Apple device
        if (/Mac|iPhone|iPod|iPad/i.test(navigator.userAgent)) {
            setIsApple(true);
        }

        // If the event fired before React hydrated, it will be stored here
        if (window.pwaDeferredPrompt) {
            setDeferredPrompt(window.pwaDeferredPrompt);
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        const handlePwaDeferredPromptReady = () => {
            if (window.pwaDeferredPrompt) {
                setDeferredPrompt(window.pwaDeferredPrompt);
            }
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);

        };

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );
        window.addEventListener(
            "pwa-deferred-prompt-ready",
            handlePwaDeferredPromptReady,
        );
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
            window.removeEventListener(
                "pwa-deferred-prompt-ready",
                handlePwaDeferredPromptReady,
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setDeferredPrompt(null);
            setIsInstalled(true);

        }
    };

    // Don't render anything during SSR to avoid hydration mismatch
    if (!isMounted) return null;

    // Don't render if already installed
    if (isInstalled) return null;

    // If we have a prompt, render the button version
    if (deferredPrompt) {
        return (
            <li className="flex gap-2 items-start mt-4 pt-4 border-t border-border flex-col sm:flex-row">
                <Button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 mt-2 sm:mt-0"
                    size="sm"
                >
                    Install this App!
                </Button>
            </li>
        );
    }

    // If Apple device (and no prompt), render the text instructions
    if (isApple) {
        return (
            <li className="flex gap-2 items-start mt-4 pt-4 border-t border-border">
                <span className="font-bold text-indigo-400 w-5 shrink-0">
                    ★
                </span>
                <span className="text-indigo-900/90 dark:text-indigo-200/90">
                    Install this app! Look for &quot;Add to Home Screen&quot; in your browser menu or under share (iOS).
                </span>
            </li>
        );
    }

    // Default fallback (e.g. Firefox Desktop which doesn't support beforeinstallprompt)
    return (
        <li className="flex gap-2 items-start mt-4 pt-4 border-t border-border">
            <span className="font-bold text-indigo-400 w-5 shrink-0">★</span>
            <span className="text-indigo-900/90 dark:text-indigo-200/90">
                Install this app! Look for &quot;Add to Home Screen&quot; or install icon in your browser.
            </span>
        </li>
    );
};
