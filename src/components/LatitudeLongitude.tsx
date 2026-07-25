import { useStore } from "@nanostores/react";
import { LocateIcon } from "lucide-react";
import { toast } from "react-toastify";

import { geolocationPermission, isLoading } from "@/lib/context";
import { cn } from "@/lib/utils";
import { ICON_COLOURS } from "@/maps/api";

import { Button } from "./ui/button";

export const LatitudeLongitude = ({
    latitude,
    longitude,
    onChange,
    label = "Location",
    colourName,
    className,
    disabled,
}: {
    latitude: number;
    longitude: number;
    onChange: (lat: number | null, lng: number | null) => void;
    label?: React.ReactNode;
    colourName?: keyof typeof ICON_COLOURS;
    className?: string;
    disabled?: boolean;
}) => {
    const $isLoading = useStore(isLoading);
    const colour = colourName ? ICON_COLOURS[colourName] : "transparent";

    return (
        <>
            <div
                style={{
                    backgroundColor: colour,
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
                        color:
                            colourName === "gold"
                                ? "black"
                                : colourName && colourName !== "transparent"
                                  ? "white"
                                  : undefined,
                    }}
                >
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 text-foreground"
                        style={{ color: "hsl(var(--foreground))" }}
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
                                        error.code === error.PERMISSION_DENIED
                                    ) {
                                        geolocationPermission.set("denied");
                                        toast.error("Location access denied.", {
                                            toastId: "location-denied",
                                        });
                                    } else {
                                        toast.error("Could not fetch location");
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
            </div>
        </>
    );
};
