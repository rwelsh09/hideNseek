import { useStore } from "@nanostores/react";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    MENU_ITEM_CLASSNAME,
    SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UnitSelect } from "@/components/UnitSelect";
import {
    hiderMode,
    isLoading,
    questionModified,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import type { RadarQuestion } from "@/maps/schema";

import { QuestionCard } from "./base";

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
            <SidebarMenuItem>
                <div className={cn(MENU_ITEM_CLASSNAME, "gap-2 flex flex-row")}>
                    <Input
                        type="number"
                        className="rounded-md p-2 w-16"
                        value={data.radius}
                        disabled={data.locked || $isLoading}
                        onChange={(e) => {
                            data.radius = parseFloat(e.target.value);
                            questionModified();
                        }}
                    />
                    <UnitSelect
                        unit={data.unit}
                        disabled={data.locked || $isLoading}
                        onChange={(unit) => {
                            data.unit = unit;
                            questionModified();
                        }}
                    />
                </div>
            </SidebarMenuItem>
            <LatitudeLongitude
                latitude={data.lat}
                longitude={data.lng}
                colourName={data.colour}
                onChangeColour={(colour: any) => {
                    data.colour = colour;
                    questionModified();
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
                disabled={data.locked || $isLoading}
            />
            <div className="flex gap-2 items-center p-2 flex-wrap">
                <Label
                    className={cn(
                        "font-semibold text-lg",
                        $isLoading && "text-muted-foreground",
                    )}
                >
                    Result
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
                    <ToggleGroupItem value="outside">
                        Outside
                    </ToggleGroupItem>
                    <ToggleGroupItem value="inside">Inside</ToggleGroupItem>
                </ToggleGroup>

            </div>
        </QuestionCard>
    );
};
