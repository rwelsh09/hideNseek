import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

import { LatitudeLongitude } from "@/components/LatitudeLongitude";
import { Input } from "@/components/ui/input";
import {
    MENU_ITEM_CLASSNAME,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    isLoading,
    questionModified,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import type { PhotoQuestion } from "@/maps/schema";

import { QuestionCard } from "./base";

const PHOTO_LABELS: Record<string, string> = {
    camera: "Hider Selfie",
    tree: "Unique Tree",
    car: "Widest Street",
    building: "Tallest Structure",
    restaurant: "Restaurant",
    park: "Park",
    worship: "Place of Worship",
    train: "Station",
    route: "Nearest Intersection",
    water: "Largest Body of Water",
};

export const PHOTO_DESCRIPTIONS: Record<string, string> = {
    camera: "Take a selfie at your current location with enough background visible to help Seekers identify where you are.",
    tree: "Find and photograph the most unique or distinctive tree in your immediate vicinity.",
    car: "Photograph the widest street or road that you can see from your location.",
    building:
        "Photograph the tallest building, tower, or structure visible from where you are.",
    restaurant:
        "Take a photo showing a nearby restaurant, cafe, or food establishment.",
    park: "Take a photo that clearly shows a park, playground, or green space nearby.",
    worship:
        "Photograph the nearest church, mosque, temple, or other place of worship.",
    train: "Take a picture showing your transit station or train platform.",
    route: "Take a picture showing the nearest street intersection.",
    water: "Take a photo of the largest body of water in your hiding zone.",
};

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
}) => {
    useStore(triggerLocalRefresh);
    const $isLoading = useStore(isLoading);
    const [localNotes, setLocalNotes] = useState(data.notes);
    useEffect(() => {
        setLocalNotes(data.notes);
    }, [data.notes]);
    const label = PHOTO_LABELS[data.type] || "Photo";

    return (
        <QuestionCard
            questionKey={questionKey}
            label={label}
            sub={sub}
            className={className}
            questionData={data}
            penaltyId={"photo"}
        >
            <SidebarMenuItem>
                <div className={cn(MENU_ITEM_CLASSNAME, "gap-2 flex flex-col")}>
                    <Input
                        type="text"
                        placeholder="Enter information about the photo..."
                        className="rounded-md p-2 w-full"
                        value={localNotes}
                        disabled={data.locked || $isLoading}
                        enterKeyHint="done"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.currentTarget.blur();
                            }
                        }}
                        onChange={(e) => setLocalNotes(e.target.value)}
                        onBlur={() => {
                            if (data.notes !== localNotes) {
                                data.notes = localNotes;
                                questionModified();
                            }
                        }}
                    />
                </div>
            </SidebarMenuItem>
            <LatitudeLongitude
                latitude={data.lat}
                longitude={data.lng}
                colourName={data.colour}
                onChange={(lat, lng) => {
                    if (lat !== null) {
                        data.lat = lat;
                    }
                    if (lng !== null) {
                        data.lng = lng;
                    }
                    questionModified();
                }}
                disabled={data.locked || $isLoading}
            />
            <div
                className="w-full text-center text-sm font-medium mt-2 bg-slate-800 p-2 rounded-md mx-2 mb-2 flex flex-col gap-2"
                style={{ width: "calc(100% - 1rem)" }}
            >
                <span className="italic opacity-80 border-b border-slate-700 pb-2">
                    {PHOTO_DESCRIPTIONS[data.type] ||
                        "Take a photograph based on the request."}
                </span>
            </div>
        </QuestionCard>
    );
};
