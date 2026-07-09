import { useStore } from "@nanostores/react";
import { LocateIcon, PaletteIcon } from "lucide-react";
import { useRef } from "react";
import { VscQuestion, VscShare, VscTrash } from "react-icons/vsc";
import { toast } from "react-toastify";

import { DialogDescription } from "@/components/ui/dialog";
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


export const LatitudeLongitude = ({
    latitude,
    longitude,
    onChange,
    label = "Location",
    colorName,
    onChangeColor,
    children,
    disabled,
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
                <div
                    className="flex justify-between gap-1"
                >
                    {onChangeColor && (
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
                        className="contents"
                    >
                        {questionKey !== undefined && (
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
                                if (!navigator || !navigator.geolocation) {
                                    toast.error("Geolocation not supported");
                                    return;
                                }

                                if (geolocationPermission.get() === "denied") {
                                    toast.error("Location access denied.", {
                                        toastId: "location-denied",
                                    });
                                    return;
                                }

                                isLoading.set(true);

                                navigator.geolocation.getCurrentPosition(
                                    (position) => {
                                        geolocationPermission.set("granted");
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
