import { useStore } from "@nanostores/react";
import { ClipboardPasteIcon } from "lucide-react";
import { toast } from "react-toastify";

import { addQuestion, isLoading, penaltyMinutes, TIME_PENALTIES } from "@/lib/context";
import { lockRecommendedStartIfNeeded } from "@/lib/recommended-start";
import { questionSchema } from "@/maps/schema";

import { Button } from "./ui/button";

export const PasteQuestionButton = () => {
    const $isLoading = useStore(isLoading);

    return (
        <Button
            variant="secondary"
            className="w-full font-semibold font-poppins flex items-center justify-center gap-2 h-10"
            data-tutorial-id="tutorial-paste-question-btn"
            onClick={() => {
                navigator.clipboard
                    .readText()
                    .then((text) => {
                        try {
                            const parsed = JSON.parse(text);
                            delete parsed.key; // Ensure a new key is generated
                            const validated =
                                questionSchema.parse(parsed);
                            addQuestion(validated);
                            if (validated.data.locked) {
                                lockRecommendedStartIfNeeded();
                                const penaltyId = validated.id === "radius" ? "radar" : validated.id;
                                const penaltyAmount =
                                    TIME_PENALTIES[penaltyId] *
                                    (validated.data.doubledPenalty ? 2 : 1);
                                penaltyMinutes.set(penaltyMinutes.get() + penaltyAmount);
                            }
                            toast.success(
                                "Question pasted successfully!",
                            );
                        } catch {
                            toast.error(
                                "Failed to paste question. Try copying it again.",
                            );
                        }
                    })
                    .catch(() => {
                        toast.error(
                            "Failed to read from clipboard",
                        );
                    });
            }}
            disabled={$isLoading}
        >
            <ClipboardPasteIcon className="w-4 h-4" />
            Paste Question
        </Button>
    );
};
