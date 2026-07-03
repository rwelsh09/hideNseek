import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import React, { useEffect, useMemo, useState } from "react";

import { LatitudeLongitude } from "@/components/LatLngPicker";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
    MENU_ITEM_CLASSNAME,
    SidebarMenuItem,
} from "@/components/ui/sidebar-l";
import { UnitSelect } from "@/components/UnitSelect";
import {
    hiderMode,
    isLoading,
    penaltyMinutes,
    questionModified,
    questions,
    TIME_PENALTIES,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn, mapToObj } from "@/lib/utils";
import { findClosestLocations } from "@/maps/api";
import {
    type ClosestQuestion,
    closestQuestionSchema,
    determineUnionizedStrings,
} from "@/maps/schema";

import { QuestionCard } from "./base";

export const ClosestQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
    isPreview,
}: {
    data: ClosestQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
    isPreview?: boolean;
}) => {
    const $questions = useStore(questions);
    const $isLoading = useStore(isLoading);
    const label = `Closest
    ${
        $questions
            .filter((q) => q.id === "closest")
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
                data.drag = !locked;
                questionModified();
                if (locked) {
                    penaltyMinutes.set(
                        penaltyMinutes.get() + TIME_PENALTIES.closest,
                    );
                } else {
                    penaltyMinutes.set(
                        Math.max(
                            0,
                            penaltyMinutes.get() - TIME_PENALTIES.closest,
                        ),
                    );
                }
            }}
        >
            <SidebarMenuItem>
                <div
                    className={cn(
                        MENU_ITEM_CLASSNAME,
                        "gap-2 flex flex-col items-start",
                    )}
                >
                    <div className="flex flex-row gap-2">
                        <Input
                            type="number"
                            className="rounded-md p-2 w-16"
                            value={data.radius}
                            onChange={(e) => {
                                let val = parseFloat(e.target.value);
                                if (val < 0) {
                                    val = 0;
                                }
                                data.radius = val;
                                questionModified();
                            }}
                            disabled={!data.drag || $isLoading}
                        />
                        <UnitSelect
                            unit={data.unit}
                            onChange={(unit) => {
                                data.unit = unit;
                                questionModified();
                            }}
                            disabled={!data.drag || $isLoading}
                        />
                    </div>
                </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <div className="flex flex-row items-center px-4 py-2 hover:bg-slate-100 hover:dark:bg-zinc-800 transition-colors">
                    <Checkbox
                        id={`show-labels-${questionKey}`}
                        checked={data.showLabels}
                        onCheckedChange={(checked) => {
                            data.showLabels = !!checked;
                            questionModified();
                        }}
                        disabled={!data.drag || $isLoading}
                        className="mr-2"
                    />
                    <label
                        htmlFor={`show-labels-${questionKey}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        Show Name Labels on Map
                    </label>
                </div>
            </SidebarMenuItem>
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Location Type"
                    options={Object.fromEntries(
                        determineUnionizedStrings(
                            closestQuestionSchema.shape.locationType,
                        ).map((x) => [(x._def as any).value, x.description]),
                    )}
                    value={data.locationType}
                    onValueChange={async (value) => {
                        data.location = false;
                        data.locationType = value;
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
                <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                    <ClosestLocationSelector
                        data={data}
                        disabled={!data.drag || $isLoading}
                    />
                </SidebarMenuItem>
            )}
        </QuestionCard>
    );
};

const ClosestLocationSelector = ({
    data,
    disabled,
}: {
    data: ClosestQuestion;
    disabled: boolean;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderMode);
    const [locations, setLocations] = useState<any>({ features: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        findClosestLocations(data)
            .then((res) => {
                if (isMounted) {
                    setLocations(res);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, [
        data.locationType,
        data.lat,
        data.lng,
        data.radius,
        data.unit,
        data.places,
    ]);

    // Filter locations to only those within the radius of the primary location
    // ⚡ Bolt: Memoize filtered features to avoid expensive O(n) turf.distance calculations on every render
    const filteredFeatures = useMemo(() => {
        if (
            data.lat === null ||
            data.lng === null ||
            data.radius === undefined ||
            data.radius === null
        ) {
            return locations.features;
        }

        const center = turf.point([data.lng, data.lat]);

        return locations.features.filter((feature: any) => {
            const coords =
                feature?.geometry?.coordinates ??
                (feature?.properties?.lon && feature?.properties?.lat
                    ? [feature.properties?.lon, feature.properties?.lat]
                    : null);

            if (!coords) return false;

            const pt = turf.point(coords);
            const dist = turf.distance(center, pt, { units: data.unit });

            return dist <= data.radius;
        });
    }, [locations.features, data.lat, data.lng, data.radius, data.unit]);

    // If the currently selected location is no longer within radius, clear it.
    const _selectedLocationName = data.location
        ? data.location.properties?.name
        : null;

    useEffect(() => {
        if (
            _selectedLocationName &&
            !filteredFeatures.find(
                (f: any) => f.properties?.name === _selectedLocationName,
            )
        ) {
            data.location = false;
            questionModified();
        }
    }, [_selectedLocationName, filteredFeatures, data]);

    if (loading) {
        return (
            <div className="flex items-center justify-center w-full h-8">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full">
            <Select
                trigger="Location"
                options={{
                    false: "Not Within",
                    ...mapToObj(filteredFeatures, (feature: any) => [
                        feature.properties?.name,
                        feature.properties?.name,
                    ]),
                }}
                value={data.location ? data.location.properties?.name : "false"}
                onValueChange={(value) => {
                    if (value === "false") {
                        data.location = false;
                    } else {
                        data.location = filteredFeatures.find(
                            (feature: any) =>
                                feature.properties?.name === value,
                        );
                    }

                    questionModified();
                }}
                disabled={!!$hiderMode || disabled}
            />
            {!!$hiderMode && (
                <div className="w-full text-center text-sm font-medium mt-2 bg-slate-800 p-2 rounded-md">
                    Tell the Seekers:{" "}
                    <span className="text-primary">
                        {data.location
                            ? data.location.properties?.name
                            : "Not Within"}
                    </span>
                </div>
            )}
        </div>
    );
};
