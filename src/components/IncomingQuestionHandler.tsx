import { useEffect } from "react";
import { toast } from "react-toastify";

import { editingQuestionId } from "@/components/DraggableMarkers";
import { addQuestion } from "@/lib/context";
import { questionSchema } from "@/maps/schema";

export const IncomingQuestionHandler = () => {

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const qParam = urlParams.get("q");

        if (qParam) {
            // Remove 'q' from URL immediately so it doesn't trigger again on refresh
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("q");
            window.history.replaceState({}, document.title, newUrl.toString());


            try {
                const decodedText = decodeURIComponent(escape(window.atob(qParam)));
                const parsed = JSON.parse(decodedText);
                delete parsed.key; // Ensure a new key is generated
                const key = Math.random();
                parsed.key = key;

                const validated = questionSchema.parse(parsed);

                // Add the question to the state
                addQuestion(validated);
                toast.success("Question automatically pasted!");

                // Open the dialog for the newly pasted question
                editingQuestionId.set(key);

            } catch (e) {
                console.error("Failed to parse incoming question from URL", e);
                toast.error("Failed to process the question link. The link might be invalid or corrupted.");
            }
        }
    }, []); // Only run once on mount

    return null;
};
