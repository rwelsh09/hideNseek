import { useStore } from "@nanostores/react";
import { ClipboardPasteIcon } from "lucide-react";
import { toast } from "react-toastify";

import { addQuestion, isLoading } from "@/lib/context";
import { questionSchema } from "@/maps/schema";

import { Button } from "./ui/button";

export const PasteQuestionButton = () => {
    const $isLoading = useStore(isLoading);

    return (
        <Button
            variant="secondary"
            className="w-full font-semibold font-poppins flex items-center justify-center gap-2 h-11"
            data-tutorial-id="tutorial-paste-question-btn"
            onClick={() => {
                navigator.clipboard
                    .readText()
                    .then((text) => {
                        try {
                            const parsed = JSON.parse(text);
                            delete parsed.key; // Ensure a new key is generated
                            const validated = questionSchema.parse(parsed);
                            addQuestion(validated);
                            toast.success("Question pasted successfully!");
                        } catch {
                            toast.error(
                                "Failed to parse question from clipboard",
                            );
                        }
                    })
                    .catch(() => {
                        toast.error("Failed to read from clipboard");
                    });
            }}
            disabled={$isLoading}
        >
            <ClipboardPasteIcon className="w-4 h-4" />
            Paste Question
        </Button>
    );
};
