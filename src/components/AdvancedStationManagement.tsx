import { useStore } from "@nanostores/react";
import { useMemo, useState } from "react";
import { VscQuestion } from "react-icons/vsc";
import { toast } from "react-toastify";

import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarMenuItem } from "@/components/ui/sidebar";
import {
    disabledStations,
    hidingRadius,
    hidingRadiusUnits,
    isLoading,
    leafletMapContext,
    trainStations,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import { fastDistance, getFeatureCoords } from "@/maps/geo-utils";
import { extractStationId, extractStationLabel } from "@/maps/geo-utils";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "./ui/command";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const AdvancedStationManagement = () => {
    const $isLoading = useStore(isLoading);
    const $hidingRadius = useStore(hidingRadius);
    const $hidingRadiusUnits = useStore(hidingRadiusUnits);
    const map = useStore(leafletMapContext);
    const stations = useStore(trainStations);
    const $disabledStations = useStore(disabledStations);

    const [overlapThreshold, setOverlapThreshold] = useState<number>(0.8);
    const [stationSearch, setStationSearch] = useState<string>("");

    const isStationSearchActive = stationSearch.trim().length > 0;
    const setStations = trainStations.set;

    const disabledStationsSet = useMemo(
        () => new Set($disabledStations),
        [$disabledStations],
    );

    return (
        <AccordionItem value="advanced" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-sm font-medium">
                Advanced Station Management
            </AccordionTrigger>
            <AccordionContent className="p-0 border-t flex flex-col">
                {$disabledStations.length > 0 && (
                    <SidebarMenuItem
                        className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                        onClick={() => {
                            disabledStations.set([]);
                        }}
                        disabled={$isLoading}
                    >
                        Clear Disabled
                    </SidebarMenuItem>
                )}
                <SidebarMenuItem
                    className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                    onClick={() => {
                        disabledStations.set(
                            stations.map((x) => extractStationId(x)),
                        );
                    }}
                    disabled={$isLoading}
                >
                    Disable All
                </SidebarMenuItem>
                <div className="flex items-center gap-2 mt-2">
                    <SidebarMenuItem
                        className="bg-popover hover:bg-accent relative flex cursor-pointer gap-2 select-none items-center rounded-sm px-2 py-2.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected='true']:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
                        onClick={() => {
                            toast.promise(
                                new Promise<void>((resolve) => {
                                    // Run heavily intensive unblocking loop over chunks
                                    const newDisabled = new Set(
                                        $disabledStations,
                                    );

                                    const precomputed = stations.map(
                                        (s, i) => ({
                                            id: i,
                                            stationId: extractStationId(s),
                                            coords:
                                                getFeatureCoords(
                                                    s.properties,
                                                ) ||
                                                getFeatureCoords(s) ||
                                                (s.geometry as any).coordinates,
                                            degree: 0,
                                            neighbors: [] as number[],
                                        }),
                                    );

                                    let i = 0;
                                    const CHUNK_SIZE = 50;

                                    const processChunk = () => {
                                        const end = Math.min(
                                            i + CHUNK_SIZE,
                                            precomputed.length,
                                        );
                                        for (; i < end; i++) {
                                            for (
                                                let j = i + 1;
                                                j < precomputed.length;
                                                j++
                                            ) {
                                                const d = fastDistance(
                                                    precomputed[i].coords,
                                                    precomputed[j].coords,
                                                    $hidingRadiusUnits as any,
                                                );
                                                if (
                                                    d <
                                                    overlapThreshold *
                                                        $hidingRadius
                                                ) {
                                                    precomputed[
                                                        i
                                                    ].neighbors.push(j);
                                                    precomputed[
                                                        j
                                                    ].neighbors.push(i);
                                                    precomputed[i].degree++;
                                                    precomputed[j].degree++;
                                                }
                                            }
                                        }

                                        if (i < precomputed.length) {
                                            requestAnimationFrame(processChunk);
                                        } else {
                                            // Greedy Independent Set approximation (Maximum Independent Set)
                                            // We want to KEEP as many independent stations as possible, so we REMOVE stations that overlap.
                                            // This is equivalent to finding a minimum vertex cover to remove.
                                            // Strategy: Remove the vertex with the highest degree, update degrees of neighbors, repeat until graph has no edges.
                                            const remaining = new Set(
                                                precomputed.map((p) => p.id),
                                            );

                                            while (remaining.size > 0) {
                                                let bestNode = -1;
                                                let maxDegree = -1;
                                                for (const id of remaining) {
                                                    if (
                                                        precomputed[id].degree >
                                                        maxDegree
                                                    ) {
                                                        maxDegree =
                                                            precomputed[id]
                                                                .degree;
                                                        bestNode = id;
                                                    }
                                                }

                                                if (maxDegree === 0) {
                                                    break; // No more edges
                                                }

                                                // Add the node with highest degree to disabled set (removing it from active graph)
                                                newDisabled.add(
                                                    precomputed[bestNode]
                                                        .stationId,
                                                );
                                                remaining.delete(bestNode);

                                                // Update neighbors
                                                for (const neighbor of precomputed[
                                                    bestNode
                                                ].neighbors) {
                                                    if (
                                                        remaining.has(neighbor)
                                                    ) {
                                                        precomputed[neighbor]
                                                            .degree--;
                                                    }
                                                }
                                            }

                                            disabledStations.set(
                                                Array.from(newDisabled),
                                            );
                                            resolve();
                                        }
                                    };

                                    requestAnimationFrame(processChunk);
                                }),
                                {
                                    pending: "Optimizing zones...",
                                    success: "Overlap minimized!",
                                    error: "Failed to optimize zones",
                                },
                            );
                        }}
                        disabled={$isLoading}
                    >
                        Auto Disable
                    </SidebarMenuItem>
                    <Popover modal={false}>
                        <PopoverTrigger asChild>
                            <button
                                className="flex-shrink-0 flex items-center justify-center p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors h-[38px] w-[38px] border ml-2"
                                aria-label="Auto Disable Overlap Information"
                            >
                                <VscQuestion className="h-5 w-5" />
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-80 text-sm align-start"
                            align="end"
                        >
                            <p>
                                Automatically disables stations so that active
                                hiding zones are spread out. The{" "}
                                <strong>Overlap Threshold</strong> controls how
                                far apart they must be: a lower number allows
                                more overlap, while a higher number (like 2.0)
                                forces them further apart so they don&apos;t
                                touch.
                            </p>
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <Label
                        className="text-sm font-medium mr-4"
                        htmlFor="overlap-threshold-input"
                    >
                        Overlap Threshold
                    </Label>
                    <Input
                        id="overlap-threshold-input"
                        type="number"
                        inputMode="decimal"
                        className="rounded-md p-1 w-16 h-8 bg-background text-sm"
                        value={overlapThreshold}
                        step={0.1}
                        min={0}
                        max={3}
                        onChange={(e) =>
                            setOverlapThreshold(parseFloat(e.target.value))
                        }
                        disabled={$isLoading}
                    />
                </div>
                <Command
                    key={
                        isStationSearchActive
                            ? "station-search-active"
                            : "station-search-idle"
                    }
                    shouldFilter={isStationSearchActive}
                >
                    <CommandInput
                        placeholder="Search for a hiding zone..."
                        value={stationSearch}
                        onValueChange={setStationSearch}
                        disabled={$isLoading}
                    />
                    <CommandList className="max-h-full">
                        <CommandEmpty>No hiding zones found.</CommandEmpty>
                        <CommandGroup>
                            {stations.map((station) => (
                                <CommandItem
                                    key={extractStationId(station)}
                                    data-station-id={extractStationId(station)}
                                    className={cn(
                                        disabledStationsSet.has(
                                            extractStationId(station),
                                        ) && "line-through",
                                    )}
                                    onSelect={async () => {
                                        if (!map) return;
                                        setTimeout(() => {
                                            const stationId =
                                                extractStationId(station);
                                            if (
                                                disabledStationsSet.has(
                                                    stationId,
                                                )
                                            ) {
                                                disabledStations.set([
                                                    ...$disabledStations.filter(
                                                        (x) => x !== stationId,
                                                    ),
                                                ]);
                                            } else {
                                                disabledStations.set([
                                                    ...$disabledStations,
                                                    stationId,
                                                ]);
                                            }
                                            setStations([...stations]);
                                        }, 100);
                                    }}
                                    disabled={$isLoading}
                                >
                                    {extractStationLabel(station.properties)}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </AccordionContent>
        </AccordionItem>
    );
};
