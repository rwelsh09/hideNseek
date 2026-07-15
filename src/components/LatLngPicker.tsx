import { useStore } from "@nanostores/react";
import { LocateIcon, PaletteIcon } from "lucide-react";
import { toast } from "react-toastify";

import { geolocationPermission, isLoading } from "@/lib/context";
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

export const LatitudeLongitude = ({
    latitude,
    longitude,
    onChange,
    label = "Location",
    colorName,
    onChangeColor,
    className,
    children,
    disabled,
}: {
    latitude: number;
    longitude: number;
    onChange: (lat: number | null, lng: number | null) => void;
    label?: React.ReactNode;
    colorName?: keyof typeof ICON_COLORS;
    onChangeColor?: (color: keyof typeof ICON_COLORS) => void;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}) => {
    const $isLoading = useStore(isLoading);
    const color = colorName ? ICON_COLORS[colorName] : "transparent";

    return (
        <>
            <div
                style={{
                    backgroundColor: color,
                }}
                className={cn(
                    "p-3 rounded-md mt-2 flex flex-col gap-2",
                    $isLoading && "brightness-50",
                    className,
                )}
            >
                <div
                    className={cn(
                        "flex items-center gap-2",
                        $isLoading && "opacity-50",
                    )}
                    style={{
                        color: colorName === "gold" ? "black" : (colorName && colorName !== "transparent" ? "white" : undefined),
                    }}
                >
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 text-foreground" style={{ color: "hsl(var(--foreground))" }}
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

                    <div className="flex-1 min-w-0">
                        {label && (
                            <div className="text-lg font-semibold font-poppins truncate">
                                {label}
                            </div>
                        )}
                    </div>

                    <div className="tabular-nums text-right text-xs font-oxygen shrink-0">
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

                {onChangeColor && (
                    <div className="flex gap-1 justify-end">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    disabled={disabled}
                                    variant="outline"
                                    size="sm"
                                    title="Change marker color"
                                    aria-label="Change marker color"
                                    className="w-full flex gap-2"
                                >
                                    <PaletteIcon className="w-4 h-4"/>
                                    Change Color
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">
                                        Change Color
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
                    </div>
                )}
            </div>
            {children}
        </>
    );
};
