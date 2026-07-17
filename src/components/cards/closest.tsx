import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";

import { LatitudeLongitude } from "@/components/LatitudeLongitude";
import { Select } from "@/components/ui/select";
import {
    MENU_ITEM_CLASSNAME,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
    hiderMode,
    isLoading,
    questionModified,
    triggerLocalRefresh,
} from "@/lib/context";
import { mapToObj } from "@/lib/utils";
import { fetchClosestLocationsWithGrowth, filterPointsWithinRadius } from "@/maps/questions/closest";
import {
    type ClosestQuestion,
    closestQuestionSchema,
    getSchemaOptions,
} from "@/maps/schema";

import { QuestionCard } from "./base";

export const ClosestQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: ClosestQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
}) => {
    const $isLoading = useStore(isLoading);

    return (
        <QuestionCard
            questionKey={questionKey}
            sub={sub}
            className={className}
            questionData={data}
            penaltyId={"closest"}
        >
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <Select
                    trigger="Location Type"
                    options={getSchemaOptions(
                        closestQuestionSchema.shape.locationType,
                    )}
                    value={data.locationType}
                    onValueChange={async (value) => {
                        data.location = false;
                        data.locationType = value;
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
            <SidebarMenuItem className={MENU_ITEM_CLASSNAME}>
                <ClosestLocationSelector
                    data={data}
                    disabled={data.locked || $isLoading}
                />
            </SidebarMenuItem>
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
        fetchClosestLocationsWithGrowth(data)
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

    // Filter locations to only those within the radius of the primary location
    const filteredFeatures = (() => {
        const prevRadius = data.radius;
        const result = filterPointsWithinRadius(locations, data);

        if (prevRadius !== data.radius) {
            setTimeout(() => questionModified(), 0);
        }

        return result.features || [];
    })();

    // If the currently selected location is no longer within radius, clear it.
    const _selectedLocationName = data.location
        ? data.location.properties?.name
        : null;
    if (
        _selectedLocationName &&
        !filteredFeatures.find(
            (f: any) => f.properties?.name === _selectedLocationName,
        )
    ) {
        data.location = false;
        questionModified();
    }

    return (
        <div className="flex flex-col w-full">
            <Select
                trigger="Location"
                options={{
                    false: "None",
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

        </div>
    );
};
