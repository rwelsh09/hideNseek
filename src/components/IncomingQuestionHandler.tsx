import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { SidebarContext } from "@/components/ui/sidebar-l";
import { addQuestion, hiderMode } from "@/lib/context";
import { questionSchema } from "@/maps/schema";

export const IncomingQuestionHandler = () => {
    const [showHiderModeWarning, setShowHiderModeWarning] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const qParam = urlParams.get("q");

        if (qParam) {
            // Remove 'q' from URL immediately so it doesn't trigger again on refresh
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete("q");
            window.history.replaceState({}, document.title, newUrl.toString());

            // Check if hider mode is enabled
            if (!hiderMode.get()) {
                setShowHiderModeWarning(true);
                return;
            }

            try {
                const decodedText = decodeURIComponent(escape(window.atob(qParam)));
                const parsed = JSON.parse(decodedText);
                delete parsed.key; // Ensure a new key is generated
                const validated = questionSchema.parse(parsed);

                // Add the question to the state
                addQuestion(validated);
                toast.success("Question automatically pasted!");

                // Expand the left sidebar
                const sidebarContext = SidebarContext.get();
                if (sidebarContext.state === "collapsed" || !sidebarContext.open) {
                    sidebarContext.setOpen(true);
                }
                if (sidebarContext.isMobile && !sidebarContext.openMobile) {
                    sidebarContext.setOpenMobile(true);
                }
            } catch (e) {
                console.error("Failed to parse incoming question from URL", e);
                toast.error("Failed to process the question link. The link might be invalid or corrupted.");
            }
        }
    }, []); // Only run once on mount

    return (
        <AlertDialog open={showHiderModeWarning} onOpenChange={setShowHiderModeWarning}>
            <AlertDialogContent className="font-poppins">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-2xl font-bold mb-2">Hider Mode Required</AlertDialogTitle>
                    <AlertDialogDescription className="text-base leading-relaxed text-slate-300">
                        You clicked a link to automatically paste a question, but you are not currently in <strong>Hider Mode</strong>.
                        <br />
                        <br />
                        Please enable Hider Mode on the map before using this link, otherwise the game cannot automatically answer the question for you.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col gap-4 py-4 mt-2">
                    <Button onClick={() => setShowHiderModeWarning(false)} size="lg" className="w-full">
                        Got it
                    </Button>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
};
