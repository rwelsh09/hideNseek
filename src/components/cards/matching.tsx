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
    displayHidingZones,
    hiderMode,
    isLoading,
    penaltyMinutes,
    questionModified,
    questions,
    TIME_PENALTIES,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import {
    determineUnionizedStrings,
    type MatchingQuestion,
    matchingQuestionSchema,
    NO_GROUP,
} from "@/maps/schema";

import { QuestionCard } from "./base";

export const MatchingQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
    isPreview,
}: {
    data: MatchingQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
    isPreview?: boolean;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderMode);
    const $questions = useStore(questions);
    const $displayHidingZones = useStore(displayHidingZones);
    const $isLoading = useStore(isLoading);
    const label = `Matching
    ${
        $questions
            .filter((q) => q.id === "matching")
            .map((q) => q.key)
            .indexOf(questionKey) + 1
    }`;

    let questionSpecific = <></>;

    switch (data.type) {
        case "same-train-line":
            break;
        case "hospital":
        case "museum":
        case "cinema":
        case "library":
        case "golf_course":
            questionSpecific = (
                <span className="px-2 text-center text-orange-500">
                    This question will only influence the map when you click on
                    a hiding zone in the hiding zone sidebar.
                </span>
            );
            break;
    }

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
                        penaltyMinutes.get() + TIME_PENALTIES.matching,
                    );
                } else {
                    penaltyMinutes.set(
                        Math.max(
                            0,
                            penaltyMinutes.get() - TIME_PENALTIES.matching,
                        ),
                    );
                }
            }}
        >
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Matching Type"
                    options={Object.fromEntries(
                        matchingQuestionSchema.options
                            .filter((x) => x.description === NO_GROUP)
                            .flatMap((x) =>
                                determineUnionizedStrings(x.shape.type),
                            )
                            .map((x) => [(x._def as any).value, x.description]),
                    )}
                    groups={matchingQuestionSchema.options
                        .filter((x) => x.description !== NO_GROUP)
                        .map((x) => [
                            x.description,
                            Object.fromEntries(
                                determineUnionizedStrings(x.shape.type).map(
                                    (x) => [
                                        (x._def as any).value,
                                        x.description,
                                    ],
                                ),
                            ),
                        ])
                        .reduce(
                            (acc, [key, value]) => {
                                const values = {
                                    disabled: !$displayHidingZones,
                                    options: value,
                                };

                                if (acc[key]) {
                                    acc[key].options = {
                                        ...acc[key].options,
                                        ...value,
                                    };
                                } else {
                                    acc[key] = values;
                                }

                                return acc;
                            },
                            {} as Record<
                                string,
                                {
                                    disabled: boolean;
                                    options: Record<string, string>;
                                }
                            >,
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
                        questionModified((data.type = value));
                    }}
                    disabled={!data.drag || $isLoading}
                />
            </SidebarMenuItem>
            {questionSpecific}

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
            {!isPreview && (
                <div
                    className={cn(
                        "flex gap-2 items-center p-2",
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
                                    questionModified(
                                        (data.lengthComparison = value),
                                    );
                                } else if (value === "same") {
                                    questionModified(
                                        (data.lengthComparison = "same"),
                                    );
                                    questionModified((data.same = true));
                                } else if (value === "different") {
                                    questionModified((data.same = false));
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
                                    questionModified((data.same = true));
                                } else if (value === "different") {
                                    questionModified((data.same = false));
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
                </div>
            )}
        </QuestionCard>
    );
};
