import { useStore } from "@nanostores/react";
import * as React from "react";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Label } from "@/components/ui/label";
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
    questions,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import { type MatchQuestion, matchQuestionSchema } from "@/maps/schema";

import { QuestionCard } from "./base";

export const MatchQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
    isPreview,
}: {
    data: MatchQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
    isPreview?: boolean;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderMode);
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);
    const label = `Match
    ${
        $questions
            .filter((q) => q.id === "match")
            .map((q) => q.key)
            .indexOf(questionKey) + 1
    }`;

    return (
        <QuestionCard
            questionKey={questionKey}
            label={label}
            sub={sub}
            className={className}
            questionData={data}
            penaltyId={"match"}
        >
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Match Type"
                    options={Object.fromEntries(
                        (
                            ((matchQuestionSchema.shape.type as any)._def
                                .innerType ||
                                matchQuestionSchema.shape.type) as any
                        ).options.map((x: any) => [
                            (x._def as any).value,
                            x.description,
                        ]),
                    )}
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
                    disabled={!data.drag || $isLoading}
                />
            </SidebarMenuItem>

            <LatitudeLongitude
                questionKey={questionKey}
                latitude={data.lat}
                longitude={data.lng}
                colorName={data.color}
                onChangeColor={(color: any) => {
                    data.color = color;
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
                disabled={!data.drag || $isLoading}
            />
            {!isPreview && (
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
                        Result
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
                            disabled={!!$hiderMode || !data.drag || $isLoading}
                        >
                            <ToggleGroupItem value="shorter">
                                Shorter
                            </ToggleGroupItem>
                            <ToggleGroupItem value="same">Same</ToggleGroupItem>
                            <ToggleGroupItem value="longer">
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
                            disabled={!!$hiderMode || !data.drag || $isLoading}
                        >
                            <ToggleGroupItem value="different">
                                Different
                            </ToggleGroupItem>
                            <ToggleGroupItem value="same">Same</ToggleGroupItem>
                        </ToggleGroup>
                    )}
                    {!!$hiderMode && (
                        <div className="w-full text-center text-sm font-medium mt-2 bg-slate-800 p-2 rounded-md">
                            Tell the Seekers:{" "}
                            <span className="text-primary">
                                {data.type === "same-length-station"
                                    ? data.lengthComparison === "shorter"
                                        ? "Shorter"
                                        : data.lengthComparison === "longer"
                                          ? "Longer"
                                          : "Same"
                                    : data.same
                                      ? "Same"
                                      : "Different"}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </QuestionCard>
    );
};
