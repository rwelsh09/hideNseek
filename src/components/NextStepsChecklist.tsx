import { persistentAtom } from "@nanostores/persistent";
import { useStore } from "@nanostores/react";
import { XIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

import { showNextStepsChecklist, showTutorial } from "@/lib/context";

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
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2000] bg-slate-800 text-slate-200 p-6 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-600 w-80 sm:w-96 font-poppins">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                <h3 className="font-bold text-xl text-white">Next Steps</h3>
                <button
                    onClick={() => hasDismissedNextStepsChecklist.set(true)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    <XIcon size={20} />
                </button>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-400">1.</span>
                    <span>
                        <strong>Set Head Start:</strong> Open the right sidebar
                        and define the Hider&apos;s head start time.
                    </span>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-400">2.</span>
                    <span>
                        <strong>Define Zones:</strong> The Hider must lock in
                        their starting station/zone on their map.
                    </span>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-400">3.</span>
                    <span>
                        <strong>Sync State:</strong> Open the Options menu to
                        Share the game state URL with the Seekers.
                    </span>
                </li>
                <li className="flex gap-2 items-start">
                    <span className="font-bold text-blue-400">4.</span>
                    <span>
                        <strong>Start Seeking:</strong> Right-click or
                        long-press on the map to ask your first question!
                    </span>
                </li>
            </ul>
        </div>
    );
};
