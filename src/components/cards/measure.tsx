import { useStore } from "@nanostores/react";
import { Label } from "@radix-ui/react-label";
import * as React from "react";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Select } from "@/components/ui/select";
import {
    MENU_ITEM_CLASSNAME,
    SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    hiderMode,
    isLoading,
    questionModified,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import { calculateMeasureDistance } from "@/maps/questions/measure";
import {
    getSchemaOptions,
    type MeasureQuestion,
    measureQuestionSchema,
} from "@/maps/schema";

import { QuestionCard } from "./base";

export const MeasureQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: MeasureQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderMode);
    const $isLoading = useStore(isLoading);
    const [distanceValue, setDistanceValue] = React.useState<number | null>(
        null,
    );
    React.useEffect(() => {
        let active = true;
        calculateMeasureDistance(data)
            .then((dist) => {
                if (active) setDistanceValue(dist);
            })
            .catch(() => {
                if (active) setDistanceValue(null);
            });
        return () => {
            active = false;
        };
    }, [data.lat, data.lng, data.type]);

    return (
        <QuestionCard
            questionKey={questionKey}
            sub={sub}
            className={className}
            questionData={data}
            penaltyId={"measure"}
        >
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Measure Type"
                    options={getSchemaOptions(measureQuestionSchema.shape.type)}
                    value={data.type}
                    onValueChange={async (value) => {
                        data.type = value;
                        questionModified();
                    }}
                    disabled={data.locked || $isLoading}
                />
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
            {distanceValue !== null && (
                <div className="px-2 text-sm text-muted-foreground">
                    Distance:{" "}
                    <span className="font-medium text-foreground">
                        {distanceValue.toFixed(3)} km
                    </span>
                </div>
            )}

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
                    value={data.hiderCloser ? "closer" : "further"}
                    onValueChange={(value: "closer" | "further") => {
                        data.hiderCloser = value === "closer";
                        questionModified();
                    }}
                    disabled={!!$hiderMode || data.locked || $isLoading}
                >
                    <ToggleGroupItem value="further">
                        Hider Further
                    </ToggleGroupItem>
                    <ToggleGroupItem value="closer">
                        Hider Closer
                    </ToggleGroupItem>
                </ToggleGroup>

            </div>
        </QuestionCard>
    );
};
