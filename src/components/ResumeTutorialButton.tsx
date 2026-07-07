import { useStore } from "@nanostores/react";
import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { showTutorial, tutorialCompleted } from "@/lib/context";

export const ResumeTutorialButton = () => {
    const $showTutorial = useStore(showTutorial);
    const $tutorialCompleted = useStore(tutorialCompleted);

    if ($showTutorial || $tutorialCompleted) return null;

    return (
        <Button
            variant="default"
            className="rounded-full shadow-md pl-3 pr-4 h-[34px]"
            onClick={() => showTutorial.set(true)}
        >
            <Play className="w-4 h-4 mr-1.5" fill="currentColor" />
            Resume Tutorial
        </Button>
    );
};
