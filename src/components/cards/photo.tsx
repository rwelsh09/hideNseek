import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Input } from "@/components/ui/input";
import {
    MENU_ITEM_CLASSNAME,
    SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import {
    isLoading,
    penaltyMinutes,
    questionModified,
    questions,
    TIME_PENALTIES,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import type { PhotoQuestion } from "@/maps/schema";

import { QuestionCard } from "./base";

export const PhotoQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: PhotoQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
    isPreview?: boolean;
}) => {
    useStore(triggerLocalRefresh);
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);
    const [localNotes, setLocalNotes] = useState(data.notes);
    useEffect(() => {
        setLocalNotes(data.notes);
    }, [data.notes]);
    const label = `Photo
    ${
        $questions
            .filter((q) => q.id === "photo")
            .map((q) => q.key)
            .indexOf(questionKey) + 1
    }`;

    return (
        <QuestionCard
            questionKey={questionKey}
            label={label}
            sub={sub}
            className={className}
            collapsed={data.collapsed}
            setCollapsed={(collapsed) => {
                data.collapsed = collapsed;
            }}
            locked={!data.drag}
            setLocked={(locked) => {
                questionModified((data.drag = !locked));
                if (locked) {
                    penaltyMinutes.set(
                        penaltyMinutes.get() + TIME_PENALTIES.photo,
                    );
                } else {
                    penaltyMinutes.set(
                        Math.max(
                            0,
                            penaltyMinutes.get() - TIME_PENALTIES.photo,
                        ),
                    );
                }
            }}
        >
            <SidebarMenuItem>
                <div className={cn(MENU_ITEM_CLASSNAME, "gap-2 flex flex-col")}>
                    <Input
                        type="text"
                        placeholder="Enter information about the photo..."
                        className="rounded-md p-2 w-full"
                        value={localNotes}
                        disabled={!data.drag || $isLoading}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        onBlur={() => {
                            if (data.notes !== localNotes) {
                                questionModified((data.notes = localNotes));
                            }
                        }}
                    />
                </div>
            </SidebarMenuItem>
            <LatitudeLongitude
                latitude={data.lat}
                longitude={data.lng}
                colorName={data.color}
                onChangeColor={(color: any) => {
                    questionModified((data.color = color));
                }}
                onChange={(lat, lng) => {
                    if (lat !== null) {
                        data.lat = lat;
                    }
                    if (lng !== null) {
                        data.lng = lng;
                    }
                    questionModified();
                }}
                disabled={!data.drag || $isLoading}
            />
        </QuestionCard>
    );
};
