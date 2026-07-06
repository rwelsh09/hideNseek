import { useStore } from "@nanostores/react";
import { LocateIcon, PaletteIcon } from "lucide-react";
import { useRef } from "react";
import { VscQuestion, VscShare, VscTrash } from "react-icons/vsc";
import { toast } from "react-toastify";

import { DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { questions } from "@/lib/context";
import { geolocationPermission, isLoading } from "@/lib/context";
import { QUESTION_RULES } from "@/lib/rules";
import { cn } from "@/lib/utils";
import { ICON_COLORS } from "@/maps/api";

import { Button } from "./ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { SidebarMenuItem } from "./ui/sidebar-l";

const LatLngEditForm = ({
    latitude,
    longitude,
    onChange,
    disabled,
}: {
    latitude: number;
    longitude: number;
    onChange: (lat: number | null, lng: number | null) => void;
    disabled?: boolean;
}) => {
    return (
        <>
            <div className="flex gap-2 items-center">
                <Label className="min-w-16">Latitude</Label>
                <Input
                    type="number"
                    value={Math.abs(latitude)}
                    min={0}
                    max={90}
                    onChange={(e) => {
                        if (isNaN(parseFloat(e.target.value))) return;
                        onChange(
                            parseFloat(e.target.value) *
                                (latitude !== 0 ? Math.sign(latitude) : -1),
                            null,
                        );
                    }}
                    disabled={disabled}
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onChange(-latitude, null)}
                    disabled={disabled}
                    title={
                        latitude > 0
                            ? "Toggle to South hemisphere"
                            : "Toggle to North hemisphere"
                    }
                    aria-label={
                        latitude > 0
                            ? "Toggle to South hemisphere"
                            : "Toggle to North hemisphere"
                    }
                >
                    {latitude > 0 ? "N" : "S"}
                </Button>
            </div>
            <div className="flex gap-2 items-center">
                <Label className="min-w-16">Longitude</Label>
                <Input
                    type="number"
                    value={Math.abs(longitude)}
                    min={0}
                    max={180}
                    onChange={(e) => {
                        if (isNaN(parseFloat(e.target.value))) return;
                        onChange(
                            null,
                            parseFloat(e.target.value) *
                                (longitude !== 0 ? Math.sign(longitude) : -1),
                        );
                    }}
                    disabled={disabled}
                />
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onChange(null, -longitude)}
                    disabled={disabled}
                    title={
                        longitude > 0
                            ? "Toggle to West hemisphere"
                            : "Toggle to East hemisphere"
                    }
                    aria-label={
                        longitude > 0
                            ? "Toggle to West hemisphere"
                            : "Toggle to East hemisphere"
                    }
                >
                    {longitude > 0 ? "E" : "W"}
                </Button>
            </div>
        </>
    );
};

export const LatitudeLongitude = ({
    latitude,
    longitude,
    onChange,
    label = "Location",
    colorName,
    onChangeColor,
    children,
    disabled,
    inlineEdit = false,
    questionKey,
}: {
    latitude: number;
    longitude: number;
    onChange: (lat: number | null, lng: number | null) => void;
    label?: string;
    colorName?: keyof typeof ICON_COLORS;
    onChangeColor?: (color: keyof typeof ICON_COLORS) => void;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
    inlineEdit?: boolean;
    questionKey?: number;
}) => {
    const $isLoading = useStore(isLoading);
    const $questions = useStore(questions);
    const copyButtonRef = useRef<HTMLButtonElement>(null);

    const color = colorName ? ICON_COLORS[colorName] : "transparent";

    return (
        <>
            <SidebarMenuItem
                style={{
                    backgroundColor: color,
                }}
                className={cn(
                    "p-3 rounded-md space-y-2 mt-2",
                    $isLoading && "brightness-50",
                )}
            >
                {!inlineEdit && (
                    <div
                        className={cn(
                            "flex justify-between items-center",
                            $isLoading && "opacity-50",
                        )}
                        style={{
                            color: colorName === "gold" ? "black" : undefined,
                        }}
                    >
                        <div className="text-lg font-semibold font-poppins">
                            {label}
                        </div>
                        <div className="tabular-nums text-right text-xs font-oxygen">
                            <div>
                                {Math.abs(latitude).toFixed(5)}
                                {"° "}
                                {latitude > 0 ? "N" : "S"}
                            </div>
                            <div>
                                {Math.abs(longitude).toFixed(5)}
                                {"° "}
                                {longitude > 0 ? "E" : "W"}
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className={cn(!inlineEdit && "flex justify-between gap-1")}
                >
                    {inlineEdit && (
                        <div className="flex flex-col gap-2 w-full mb-2">
                            <LatLngEditForm
                                latitude={latitude}
                                longitude={longitude}
                                onChange={onChange}
                                disabled={disabled}
                            />
                        </div>
                    )}
                    {!inlineEdit && onChangeColor && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    disabled={disabled}
                                    variant="outline"
                                    size="icon"
                                    title="Change marker color"
                                    aria-label="Change marker color"
                                >
                                    <PaletteIcon />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">
                                        Change {label} Color
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-4 gap-4 py-4">
                                    {(
                                        Object.entries(ICON_COLORS) as [
                                            keyof typeof ICON_COLORS,
                                            string,
                                        ][]
                                    ).map(([colorKey, hexCode]) => (
                                        <Button
                                            key={colorKey}
                                            variant="outline"
                                            size="icon"
                                            className={cn(
                                                "h-16 w-full rounded-md border-2",
                                                colorName === colorKey
                                                    ? "border-primary"
                                                    : "border-transparent",
                                            )}
                                            style={{ backgroundColor: hexCode }}
                                            onClick={() =>
                                                onChangeColor(
                                                    colorKey as keyof typeof ICON_COLORS,
                                                )
                                            }
                                            title={`Set color to ${colorKey}`}
                                            aria-label={`Set color to ${colorKey}`}
                                        />
                                    ))}
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button>Done</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                    <div
                        className={
                            inlineEdit
                                ? "flex justify-center gap-2"
                                : "contents"
                        }
                    >
                        {!inlineEdit && questionKey !== undefined && (
                            <>
                                {QUESTION_RULES[
                                    $questions.find(
                                        (q) => q.key === questionKey,
                                    )?.id as keyof typeof QUESTION_RULES
                                ] && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                type="button"
                                                aria-label="Question Rules"
                                                data-tutorial-id="tutorial-question-rules-btn"
                                                disabled={disabled}
                                            >
                                                <VscQuestion />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-4 z-[9999]">
                                            <h4 className="font-semibold mb-2">
                                                How it works
                                            </h4>
                                            <p className="text-sm text-muted-foreground">
                                                {
                                                    QUESTION_RULES[
                                                        $questions.find(
                                                            (q) =>
                                                                q.key ===
                                                                questionKey,
                                                        )
                                                            ?.id as keyof typeof QUESTION_RULES
                                                    ]
                                                }
                                            </p>
                                        </PopoverContent>
                                    </Popover>
                                )}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    aria-label="Delete Question"
                                    data-tutorial-id="tutorial-delete-question-btn"
                                    disabled={disabled}
                                    onClick={() => {
                                        const qList = questions.get();
                                        const currentQ = qList.find(
                                            (q) => q.key === questionKey,
                                        );
                                        if (currentQ && currentQ.data.drag) {
                                            questions.set(
                                                qList.filter(
                                                    (q) =>
                                                        q.key !== questionKey,
                                                ),
                                            );
                                        }
                                    }}
                                >
                                    <VscTrash />
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            type="button"
                                            aria-label="Share Question"
                                            data-tutorial-id="tutorial-share-question-btn"
                                            disabled={disabled}
                                        >
                                            <VscShare />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl">
                                                Share this Question!
                                            </DialogTitle>
                                            <DialogDescription>
                                                Below you can access the JSON
                                                representing the question. Send
                                                this to another player for them
                                                to copy. They can then click
                                                &ldquo;Paste Question&rdquo; at
                                                the bottom of the
                                                &ldquo;Questions&rdquo; sidebar.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mb-2 sm:mb-0 transition-colors"
                                            ref={copyButtonRef}
                                            onClick={() => {
                                                if (
                                                    !navigator ||
                                                    !navigator.clipboard
                                                ) {
                                                    toast.error(
                                                        "Clipboard API not supported in your browser",
                                                    );
                                                    return;
                                                }
                                                navigator.clipboard
                                                    .writeText(
                                                        JSON.stringify(
                                                            $questions.find(
                                                                (q) =>
                                                                    q.key ===
                                                                    questionKey,
                                                            ),
                                                            null,
                                                            4,
                                                        ),
                                                    )
                                                    .then(() => {
                                                        if (
                                                            copyButtonRef.current
                                                        ) {
                                                            copyButtonRef.current.textContent =
                                                                "Copied!";
                                                            copyButtonRef.current.classList.add(
                                                                "bg-green-500",
                                                            );
                                                            setTimeout(() => {
                                                                if (
                                                                    copyButtonRef.current
                                                                ) {
                                                                    copyButtonRef.current.textContent =
                                                                        "Copy to Clipboard";
                                                                    copyButtonRef.current.classList.remove(
                                                                        "bg-green-500",
                                                                    );
                                                                }
                                                            }, 2000);
                                                        }
                                                    })
                                                    .catch(() => {
                                                        if (
                                                            copyButtonRef.current
                                                        ) {
                                                            copyButtonRef.current.textContent =
                                                                "Failed to Copy";
                                                            copyButtonRef.current.classList.add(
                                                                "bg-red-500",
                                                            );
                                                            setTimeout(() => {
                                                                if (
                                                                    copyButtonRef.current
                                                                ) {
                                                                    copyButtonRef.current.textContent =
                                                                        "Copy to Clipboard";
                                                                    copyButtonRef.current.classList.remove(
                                                                        "bg-red-500",
                                                                    );
                                                                }
                                                            }, 2000);
                                                        }
                                                    });
                                            }}
                                        >
                                            Copy to Clipboard
                                        </Button>
                                        <textarea
                                            className="w-full h-[300px] bg-slate-900 text-white rounded-md p-2"
                                            readOnly
                                            value={JSON.stringify(
                                                $questions.find(
                                                    (q) =>
                                                        q.key === questionKey,
                                                ),
                                                null,
                                                4,
                                            )}
                                        ></textarea>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                if (!navigator || !navigator.geolocation)
                                    return alert("Geolocation not supported");

                                if (geolocationPermission.get() === "denied") {
                                    toast.error("Location access denied.", {
                                        toastId: "location-denied",
                                    });
                                    return;
                                }

                                isLoading.set(true);

                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        isLoading.set(false);
                                        onChange(
                                            position.coords.latitude,
                                            position.coords.longitude,
                                        );
                                        toast.success("Location fetched", {
                                            autoClose: 500,
                                        });
                                    },
                                    (error) => {
                                        isLoading.set(false);
                                        if (
                                            error.code ===
                                            error.PERMISSION_DENIED
                                        ) {
                                            geolocationPermission.set("denied");
                                            toast.error(
                                                "Location access denied.",
                                                {
                                                    toastId: "location-denied",
                                                },
                                            );
                                        } else {
                                            toast.error(
                                                "Could not fetch location",
                                            );
                                        }
                                    },
                                    {
                                        maximumAge: 0,
                                        enableHighAccuracy: true,
                                        timeout: 10000,
                                    },
                                );
                            }}
                            disabled={disabled}
                            type="button"
                            title="Set to current location"
                            aria-label="Set to current location"
                            data-tutorial-id="tutorial-gps-btn"
                        >
                            <LocateIcon />
                        </Button>
                    </div>
                </div>
            </SidebarMenuItem>
            {children}
        </>
    );
};
