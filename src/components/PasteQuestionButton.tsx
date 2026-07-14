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
            className="w-full font-semibold font-poppins flex items-center justify-center gap-2 h-10"
            data-tutorial-id="tutorial-paste-question-btn"
            onClick={() => {
                navigator.clipboard
                    .readText()
                    .then((text) => {
                        try {
                            let jsonText = text;

                            // Check if pasted text is a URL with our q parameter
                            const urlMatch = text.match(/q=([^&\s]+)/);
                            if (urlMatch && urlMatch[1]) {
                                try {
                                    jsonText = decodeURIComponent(escape(window.atob(urlMatch[1])));
                                } catch (e) {
                                    // if decoding fails, jsonText remains as original text which will fail parsing below
                                }
                            }

                            const parsed = JSON.parse(jsonText);
                            delete parsed.key; // Ensure a new key is generated
                            const validated =
                                questionSchema.parse(parsed);
                            addQuestion(validated);
                            toast.success(
                                "Question pasted successfully!",
                            );
                        } catch (e) {
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
