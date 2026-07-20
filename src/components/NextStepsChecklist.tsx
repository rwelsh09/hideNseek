import { persistentAtom } from "@nanostores/persistent";
import { useStore } from "@nanostores/react";
import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { hiderMode,showHiderTutorial, showNextStepsChecklist, showTutorial } from "@/lib/context";

import { PwaInstallTip } from "./PwaInstallTip";

const hasDismissedNextStepsChecklist = persistentAtom<boolean>(
    "hasDismissedNextStepsChecklist",
    false,
    { encode: JSON.stringify, decode: JSON.parse },
);

export const NextStepsChecklist = () => {
    const isTutorialVisible = useStore(showTutorial);
    const isHiderTutorialVisible = useStore(showHiderTutorial);
    const isChecklistVisible = useStore(showNextStepsChecklist);
    const hasDismissed = useStore(hasDismissedNextStepsChecklist);
    const $hiderMode = useStore(hiderMode);
    const isHiderMode = $hiderMode !== false;
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (
        !isMounted ||
        isTutorialVisible ||
        (isHiderMode && isHiderTutorialVisible) ||
        !isChecklistVisible ||
        hasDismissed
    ) {
        return null;
    }

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1020] rounded-xl border bg-card shadow-xl p-5 space-y-4 w-80 sm:w-96 font-poppins">
            <div className="flex justify-between items-center mb-1 pb-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Are you ready!?
                </h3>
                <button
                    type="button"
                    aria-label="Dismiss checklist"
                    onClick={() => hasDismissedNextStepsChecklist.set(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <XIcon size={20} />
                </button>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2 items-start">
                    <span>
                        <strong>Start the Timer</strong>
                        <p>Click the clock icon and hit Start.</p>
                    </span>
                </li>
                <li className="flex gap-2 items-start">
                    <span>
                        <strong>Hey Hider,</strong>
                        <p>RUN RUN RUN!</p>
                    </span>
                </li>
                <PwaInstallTip />
            </ul>
        </div>
    );
};
