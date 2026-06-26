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
    penaltyMinutes,
    questionModified,
    questions,
    TIME_PENALTIES,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import { calculateMeasuringDistance } from "@/maps/questions/measure";
import { type MeasureQuestion, measuringQuestionSchema } from "@/maps/schema";

import { QuestionCard } from "./base";

export const MeasureQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
    isPreview,
}: {
    data: MeasureQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
    isPreview?: boolean;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderMode);
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);
    const [distanceValue, setDistanceValue] = React.useState<number | null>(
        null,
    );
    React.useEffect(() => {
        let active = true;
        calculateMeasuringDistance(data)
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

    const label = `Measure
    ${
        $questions
            .filter((q) => q.id === "measure")
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
                data.collapsed = collapsed; // Doesn't trigger a re-render so no need for questionModified
            }}
            locked={!data.drag}
            setLocked={(locked) => {
                questionModified((data.drag = !locked));
                if (locked) {
                    penaltyMinutes.set(
                        penaltyMinutes.get() + TIME_PENALTIES.measure,
                    );
                } else {
                    penaltyMinutes.set(
                        Math.max(
                            0,
                            penaltyMinutes.get() - TIME_PENALTIES.measure,
                        ),
                    );
                }
            }}
        >
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Measure Type"
                    options={Object.fromEntries(
                        (
                            ((measuringQuestionSchema.shape.type as any)._def
                                .innerType ||
                                measuringQuestionSchema.shape.type) as any
                        ).options.map((x: any) => [
                            (x._def as any).value,
                            x.description,
                        ]),
                    )}
                    value={data.type}
                    onValueChange={async (value) => {
                        data.type = value;
                        questionModified();
                    }}
                    disabled={!data.drag || $isLoading}
                />
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
            {distanceValue !== null && (
                <div className="px-2 text-sm text-muted-foreground">
                    Distance:{" "}
                    <span className="font-medium text-foreground">
                        {distanceValue.toFixed(3)} km
                    </span>
                </div>
            )}

            {!isPreview && (
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
                        disabled={!!$hiderMode || !data.drag || $isLoading}
                    >
                        <ToggleGroupItem value="further">
                            Hider Further
                        </ToggleGroupItem>
                        <ToggleGroupItem value="closer">
                            Hider Closer
                        </ToggleGroupItem>
                    </ToggleGroup>
                    {!!$hiderMode && (
                        <div className="w-full text-center text-sm font-medium mt-2 bg-slate-800 p-2 rounded-md">
                            Tell the Seekers:{" "}
                            <span className="text-primary">
                                {data.hiderCloser
                                    ? "Hider Closer"
                                    : "Hider Further"}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </QuestionCard>
    );
};
