import { useStore } from "@nanostores/react";

import { LatitudeLongitude } from "@/components/LatitudeLongitude";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MENU_ITEM_CLASSNAME, SidebarMenuItem } from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    hiderMode,
    isLoading,
    questionModified,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import type { RadarQuestion } from "@/maps/schema";

import { QuestionCard } from "./base";

const RADAR_OPTIONS = {
    "0.5": "0.5 km",
    "1": "1 km",
    "2": "2 km",
    "5": "5 km",
    "10": "10 km",
    "15": "15 km",
    custom: "Custom",
};

export const RadarQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: RadarQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderMode);
    const $isLoading = useStore(isLoading);

    return (
        <QuestionCard
            questionKey={questionKey}
            sub={sub}
            className={className}
            questionData={data}
            penaltyId={"radar"}
        >
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Radar Size"
                    options={RADAR_OPTIONS}
                    value={data.isCustom ? "custom" : data.radius.toString()}
                    onValueChange={(value) => {
                        if (value === "custom") {
                            data.isCustom = true;
                        } else {
                            data.isCustom = false;
                            data.radius = parseFloat(value);
                        }
                        questionModified();
                    }}
                    disabled={data.locked || $isLoading}
                />
            </SidebarMenuItem>
            {data.isCustom && (
                <SidebarMenuItem>
                    <div className={cn(MENU_ITEM_CLASSNAME, "gap-2 flex flex-row items-center")}>
                        <Input
                            aria-label="Radius"
                            type="number"
                            inputMode="decimal"
                            className="rounded-md p-2 w-16"
                            value={data.radius}
                            disabled={data.locked || $isLoading}
                            enterKeyHint="done"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.currentTarget.blur();
                                }
                            }}
                            onChange={(e) => {
                                data.radius = parseFloat(e.target.value);
                                questionModified();
                            }}
                        />
                        <span className="text-sm font-medium">km</span>
                    </div>
                </SidebarMenuItem>
            )}
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
            <div className="flex gap-2 items-center p-2 flex-wrap">
                <Label
                    className={cn(
                        "font-semibold text-lg",
                        $isLoading && "text-muted-foreground",
                    )}
                >
                    Answer
                </Label>
                <ToggleGroup
                    className="grow"
                    type="single"
                    value={data.within ? "inside" : "outside"}
                    onValueChange={(value: "inside" | "outside") => {
                        data.within = value === "inside";
                        questionModified();
                    }}
                    disabled={!!$hiderMode || data.locked || $isLoading}
                    data-tutorial-id="tutorial-question-result-toggle"
                >
                    <ToggleGroupItem
                        value="outside"
                        className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                    >
                        Outside
                    </ToggleGroupItem>
                    <ToggleGroupItem
                        value="inside"
                        className="data-[state=on]:bg-rose-500 data-[state=on]:text-white"
                    >
                        Inside
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
        </QuestionCard>
    );
};
