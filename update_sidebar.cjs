const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/ZoneSidebar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure imports
if (!content.includes('VscQuestion')) {
    content = content.replace(
        /import\s+{([^}]+)}\s+from\s+["']@\/components\/ui\/sidebar-r["'];/g,
        'import { $1 } from "@/components/ui/sidebar-r";\nimport { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";\nimport { VscQuestion } from "react-icons/vsc";'
    );
} else if (!content.includes('PopoverContent')) {
    content = content.replace(
        /import\s+{([^}]+)}\s+from\s+["']@\/components\/ui\/sidebar-r["'];/g,
        'import { $1 } from "@/components/ui/sidebar-r";\nimport { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";'
    );
}

// Update Overlap Threshold
const overlapThresholdOriginal = `                                <div className="flex items-center justify-between pb-2">
                                    <Label htmlFor="overlapThreshold">
                                        Overlap Threshold
                                    </Label>
                                    <Input
                                        id="overlapThreshold"
                                        type="number"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        className="w-20"
                                        value={$overlapThreshold}
                                        onChange={(e) =>
                                            overlapThreshold.set(
                                                parseFloat(e.target.value),
                                            )
                                        }
                                        disabled={$isLoading}
                                    />
                                </div>`;

const overlapThresholdNew = `                                <div className="flex items-center justify-between pb-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                className="flex items-center gap-1 rounded-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 group hover:text-ring/80 transition-colors"
                                                aria-label="Overlap Threshold Information"
                                            >
                                                <Label htmlFor="overlapThreshold" className="cursor-pointer">
                                                    Overlap Threshold
                                                </Label>
                                                <VscQuestion className="h-4 w-4 text-muted-foreground group-hover:text-ring/80 transition-colors" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 text-sm">
                                            <p>
                                                Controls how much hiding zones are allowed to overlap with each other.
                                                A higher number means zones can overlap more, while a lower number forces them further apart.
                                                If set to 0, zones will not be allowed to overlap at all.
                                            </p>
                                        </PopoverContent>
                                    </Popover>
                                    <Input
                                        id="overlapThreshold"
                                        type="number"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        className="w-20"
                                        value={$overlapThreshold}
                                        onChange={(e) =>
                                            overlapThreshold.set(
                                                parseFloat(e.target.value),
                                            )
                                        }
                                        disabled={$isLoading}
                                    />
                                </div>`;

content = content.replace(overlapThresholdOriginal, overlapThresholdNew);

// Update Auto Disable Overlap
const autoDisableOriginal = `                            {$displayHidingZones && (
                                <SidebarMenuItem
                                    asChild
                                    className="cursor-pointer hover:bg-muted font-bold text-center border mt-2"
                                    onClick={async () => {
                                        if ($isLoading) return;
                                        toast.promise(
                                            new Promise<void>((resolve) => {`;

const autoDisableNew = `                            {$displayHidingZones && (
                                <div className="flex items-center gap-2 mt-2">
                                    <SidebarMenuItem
                                        asChild
                                        className="cursor-pointer hover:bg-muted font-bold text-center border flex-1"
                                        onClick={async () => {
                                            if ($isLoading) return;
                                            toast.promise(
                                                new Promise<void>((resolve) => {`;

content = content.replace(autoDisableOriginal, autoDisableNew);

const autoDisableOriginal2 = `                                    }}
                                    disabled={$isLoading}
                                >
                                    Auto Disable Overlap
                                </SidebarMenuItem>
                            )}`;

const autoDisableNew2 = `                                        }}
                                        disabled={$isLoading}
                                    >
                                        Auto Disable Overlap
                                    </SidebarMenuItem>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <button
                                                className="flex-shrink-0 flex items-center justify-center p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors h-[38px] w-[38px] border"
                                                aria-label="Auto Disable Overlap Information"
                                            >
                                                <VscQuestion className="h-5 w-5" />
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 text-sm align-start" align="end">
                                            <p>
                                                Automatically disables stations to minimize overlapping hiding zones based on your set <strong>Overlap Threshold</strong>.
                                                This makes the map cleaner and ensures hiding spots are properly spaced out.
                                            </p>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            )}`;

content = content.replace(autoDisableOriginal2, autoDisableNew2);

fs.writeFileSync(filePath, content, 'utf8');
