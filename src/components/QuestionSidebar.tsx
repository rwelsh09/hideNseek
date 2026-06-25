import { useStore } from "@nanostores/react";
import { ClipboardPasteIcon, Clock, SidebarCloseIcon } from "lucide-react";
import { toast } from "react-toastify";

import {
    Sidebar,
    SidebarContent,
    SidebarContext,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import {
    addQuestion,
    autoSave,
    isLoading,
    penaltyMinutes,
    questions,
    save,
    triggerLocalRefresh,
} from "@/lib/context";
import {} from "@/lib/context";
import { questionSchema } from "@/maps/schema";

import { AddQuestionDialog } from "./AddQuestionDialog";
import {
    MatchingQuestionComponent,
    MeasuringQuestionComponent,
    PhotoQuestionComponent,
    RadiusQuestionComponent,
    TentacleQuestionComponent,
    ThermometerQuestionComponent,
} from "./QuestionCards";
import { Button } from "./ui/button";

export const QuestionSidebar = () => {
    useStore(triggerLocalRefresh);
    const $questions = useStore(questions);
    const $autoSave = useStore(autoSave);
    const $isLoading = useStore(isLoading);

    const $penaltyMinutes = useStore(penaltyMinutes);

    const addTime = (mins: number) => {
        penaltyMinutes.set(Math.max(0, $penaltyMinutes + mins));
    };

    return (
        <Sidebar>
            <div className="flex items-center justify-between shrink-0">
                <h2 className="ml-4 mt-4 font-poppins text-2xl font-bold text-white">
                    Questions
                </h2>
                <SidebarCloseIcon
                    className="mr-2 visible text-white cursor-pointer"
                    onClick={() => {
                        SidebarContext.get().toggleSidebar();
                    }}
                />
            </div>

            <SidebarContent className="px-4 pt-4 pb-2 flex flex-col gap-5 overflow-y-auto">
                {/* --- TIME PENALTY TRACKER --- */}
                <div
                    className="bg-slate-800 rounded-xl p-3 shadow-md border border-slate-700 flex flex-col gap-3"
                    data-tutorial-id="time-penalty-tracker"
                >
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-slate-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-red-400" />
                            Time Penalty
                        </h3>
                        <div className="text-white font-mono font-bold text-xl">
                            +{$penaltyMinutes}{" "}
                            <span className="text-xs text-slate-400 font-sans">
                                MIN
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTime(-5)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8"
                        >
                            -5
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTime(5)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8"
                        >
                            +5
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTime(10)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8"
                        >
                            +10
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addTime(15)}
                            className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8"
                        >
                            +15
                        </Button>
                    </div>
                </div>

                {/* --- ACTIVE MAP ZONES --- */}
                {$questions.length > 0 && (
                    <div className="flex items-center gap-2 mt-1 px-1">
                        <h3 className="text-slate-400 font-bold uppercase tracking-wider text-xs">
                            Active Map Zones
                        </h3>
                    </div>
                )}

                {$questions.map((question) => {
                    switch (question.id) {
                        case "radius":
                            return (
                                <RadiusQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "thermometer":
                            return (
                                <ThermometerQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "tentacles":
                            return (
                                <TentacleQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "matching":
                            return (
                                <MatchingQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "measuring":
                            return (
                                <MeasuringQuestionComponent
                                    data={question.data}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        case "photo":
                            return (
                                <PhotoQuestionComponent
                                    data={question.data as any}
                                    key={question.key}
                                    questionKey={question.key}
                                />
                            );
                        default:
                            return null;
                    }
                })}
            </SidebarContent>

            <SidebarGroup>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <AddQuestionDialog />
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                className="bg-slate-700 hover:bg-slate-600 p-2 rounded-md font-semibold font-poppins transition-colors duration-200 text-white flex items-center justify-center gap-2"
                                onClick={() => {
                                    navigator.clipboard
                                        .readText()
                                        .then((text) => {
                                            try {
                                                const parsed = JSON.parse(text);
                                                delete parsed.key; // Ensure a new key is generated
                                                const validated =
                                                    questionSchema.parse(
                                                        parsed,
                                                    );
                                                addQuestion(validated);
                                                toast.success(
                                                    "Question pasted successfully!",
                                                );
                                            } catch {
                                                toast.error(
                                                    "Failed to parse question from clipboard",
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
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        {!$autoSave && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    className="bg-blue-600 p-2 rounded-md font-semibold font-poppins transition-shadow duration-500"
                                    onClick={save}
                                    disabled={$isLoading}
                                >
                                    Save
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </Sidebar>
    );
};
