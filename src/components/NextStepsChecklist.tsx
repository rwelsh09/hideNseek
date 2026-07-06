import { persistentAtom } from "@nanostores/persistent";
import { useStore } from "@nanostores/react";
import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { showNextStepsChecklist, showTutorial } from "@/lib/context";

import { PwaInstallTip } from "./PwaInstallTip";

export const hasDismissedNextStepsChecklist = persistentAtom<boolean>(
    "hasDismissedNextStepsChecklist",
    false,
    { encode: JSON.stringify, decode: JSON.parse },
);

export const NextStepsChecklist = () => {
    const isTutorialVisible = useStore(showTutorial);
    const isChecklistVisible = useStore(showNextStepsChecklist);
    const hasDismissed = useStore(hasDismissedNextStepsChecklist);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (
        !isMounted ||
        isTutorialVisible ||
        !isChecklistVisible ||
        hasDismissed
    ) {
        return null;
    }

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1020] rounded-xl border bg-card shadow-xl p-5 space-y-4 w-80 sm:w-96 font-poppins">
            <div className="flex justify-between items-center mb-1 pb-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Next Steps
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
                    <span className="font-bold text-blue-400 w-5 shrink-0">
                        1.
                    </span>
                    <span>
                        <strong>Set Head Start:</strong> Open the right sidebar
                        and define the Hider&apos;s head start time.
                    </span>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-400 w-5 shrink-0">
                        2.
                    </span>
                    <span>
                        <strong>Define Zones:</strong> In the right sidebar you
                        can adjust the Hiding Zone Radius and disable specific
                        stations/zones. (optional)
                    </span>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-400 w-5 shrink-0">
                        3.
                    </span>
                    <span>
                        <strong>Sync Game:</strong> Click Share and send the
                        game link to the other players.
                    </span>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-400 w-5 shrink-0">
                        4.
                    </span>
                    <span>
                        <strong>Start Timer:</strong> Click the clock icon.
                        Start the timer and (to the Hider) RUN RUN RUN!
                    </span>
                </li>
                <PwaInstallTip />
            </ul>
        </div>
    );
};
