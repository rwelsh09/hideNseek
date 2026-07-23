import { useStore } from "@nanostores/react";
import * as React from "react";

import { LatitudeLongitude } from "@/components/LatitudeLongitude";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
    MENU_ITEM_CLASSNAME,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    hiderMode,
    isLoading,
    questionModified,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import {
    getSchemaOptions,
    type MatchQuestion,
    matchQuestionSchema,
} from "@/maps/schema";

import { QuestionCard } from "./base";

export const MatchQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: MatchQuestion;
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
            penaltyId={"match"}
        >
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Match Type"
                    options={getSchemaOptions(matchQuestionSchema.shape.type)}
                    value={data.type}
                    onValueChange={async (value) => {
                        if (value === "same-length-station") {
                            data.lengthComparison = "same";
                            data.same = true;
                        }

                        // The category should be defined such that no error is thrown if this is a zone question.
                        if (!(data as any).cat) {
                            (data as any).cat = { adminLevel: 3 };
                        }
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
                className={cn(
                    "flex gap-2 items-center p-2 flex-wrap",
                    data.type === "same-length-station" && "flex-col",
                )}
            >
                <Label
                    className={cn(
                        "font-semibold text-lg",
                        $isLoading && "text-muted-foreground",
                        data.type === "same-length-station" &&
                            "text-center",
                    )}
                >
                    Answer
                </Label>
                {data.type === "same-length-station" ? (
                    <ToggleGroup
                        className="grow"
                        type="single"
                        value={
                            data.lengthComparison
                                ? data.lengthComparison
                                : data.same === true
                                    ? "same"
                                    : data.same === false
                                    ? "different"
                                    : "same"
                        }
                        onValueChange={(
                            value:
                                | "shorter"
                                | "same"
                                | "longer"
                                | "different",
                        ) => {
                            if (value === "shorter" || value === "longer") {
                                data.lengthComparison = value;
                                questionModified();
                            } else if (value === "same") {
                                data.lengthComparison = "same";
                                data.same = true;
                                questionModified();
                            } else if (value === "different") {
                                data.same = false;
                                questionModified();
                            }
                        }}
                        disabled={!!$hiderMode || data.locked || $isLoading}
                    >
                        <ToggleGroupItem value="shorter" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">
                            Shorter
                        </ToggleGroupItem>
                        <ToggleGroupItem value="same" className="data-[state=on]:bg-rose-500 data-[state=on]:text-white">Same</ToggleGroupItem>
                        <ToggleGroupItem value="longer" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">
                            Longer
                        </ToggleGroupItem>
                    </ToggleGroup>
                ) : (
                    <ToggleGroup
                        className="grow"
                        type="single"
                        value={data.same ? "same" : "different"}
                        onValueChange={(value) => {
                            if (value === "same") {
                                data.same = true;
                                questionModified();
                            } else if (value === "different") {
                                data.same = false;
                                questionModified();
                            }
                        }}
                        disabled={!!$hiderMode || data.locked || $isLoading}
                    >
                        <ToggleGroupItem value="different" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">
                            Different
                        </ToggleGroupItem>
                        <ToggleGroupItem value="same" className="data-[state=on]:bg-rose-500 data-[state=on]:text-white">Same</ToggleGroupItem>
                    </ToggleGroup>
                )}

            </div>
        </QuestionCard>
    );
};
