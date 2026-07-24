import { useStore } from "@nanostores/react";
import { distance, point } from "@turf/turf";

import { LatitudeLongitude } from "@/components/LatitudeLongitude";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
    hiderMode,
    isLoading,
    questionModified,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import type { HotColdQuestion } from "@/maps/schema";

import { QuestionCard } from "./base";

export const HotColdQuestionComponent = ({
    data,
    questionKey,
    sub,
    className,
}: {
    data: HotColdQuestion;
    questionKey: number;
    sub?: string;
    className?: string;
}) => {
    useStore(triggerLocalRefresh);
    const $hiderMode = useStore(hiderMode);
    const $isLoading = useStore(isLoading);

    const DISTANCE_UNIT = "kilometers";

    const hasCoords =
        data.latA !== null &&
        data.lngA !== null &&
        data.latB !== null &&
        data.lngB !== null;

    const distanceValue = hasCoords
        ? distance(
              point([data.lngA!, data.latA!]),
              point([data.lngB!, data.latB!]),
              { units: DISTANCE_UNIT as any },
          )
        : null;

    const unitLabel = "km";

    const validateLock = () => {
        if (!hasCoords || distanceValue === null) {
            return "Please select both Start and End locations.";
        }
        const requiredMin = data.minDistance || 0;
        if (distanceValue < requiredMin - 0.001) {
            return `Distance must be at least ${requiredMin}${unitLabel}.`;
        }
        return true;
    };

    return (
        <QuestionCard
            questionKey={questionKey}
            sub={sub}
            className={className}
            questionData={data}
            penaltyId={"hot/cold"}
            validateLock={validateLock}
        >
            <LatitudeLongitude
                latitude={data.latA}
                longitude={data.lngA}
                label="Start"
                colourName={data.colourA}
                onChange={(lat, lng) => {
                    if (lat !== null) data.latA = lat;
                    if (lng !== null) data.lngA = lng;
                    questionModified();
                }}
                disabled={data.locked || $isLoading}
            />

            <LatitudeLongitude
                latitude={data.latB}
                longitude={data.lngB}
                label="End"
                colourName={data.colourB}
                onChange={(lat, lng) => {
                    if (lat !== null) data.latB = lat;
                    if (lng !== null) data.lngB = lng;
                    questionModified();
                }}
                disabled={data.locked || $isLoading}
            />

            {distanceValue !== null && (
                <div className="px-2 text-sm text-muted-foreground">
                    Distance:{" "}
                    <span className="font-medium text-foreground">
                        {distanceValue.toFixed(3)} {unitLabel}
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
                    Answer
                </Label>
                <ToggleGroup
                    className="grow"
                    type="single"
                    value={data.warmer ? "warmer" : "colder"}
                    onValueChange={(value: "warmer" | "colder") => {
                        data.warmer = value === "warmer";
                        questionModified();
                    }}
                    disabled={!!$hiderMode || data.locked || $isLoading}
                >
                    <ToggleGroupItem value="colder" className="data-[state=on]:bg-blue-500 data-[state=on]:text-white">
                        Colder
                    </ToggleGroupItem>
                    <ToggleGroupItem value="warmer" className="data-[state=on]:bg-rose-500 data-[state=on]:text-white">Warmer</ToggleGroupItem>
                </ToggleGroup>

            </div>
        </QuestionCard>
    );
};
