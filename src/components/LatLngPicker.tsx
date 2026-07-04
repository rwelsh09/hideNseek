import { useStore } from "@nanostores/react";
import { EditIcon, LocateIcon, PaletteIcon } from "lucide-react";
import { toast } from "react-toastify";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isLoading } from "@/lib/context";
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
}) => {
    const $isLoading = useStore(isLoading);

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
                    {inlineEdit ? (
                        <div className="flex flex-col gap-2 w-full mb-2">
                            <LatLngEditForm
                                latitude={latitude}
                                longitude={longitude}
                                onChange={onChange}
                                disabled={disabled}
                            />
                        </div>
                    ) : (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    disabled={disabled}
                                    variant="outline"
                                    size="icon"
                                    title="Edit coordinates"
                                    aria-label="Edit coordinates"
                                >
                                    <EditIcon />
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl">
                                        Update {label}
                                    </DialogTitle>
                                </DialogHeader>
                                <LatLngEditForm
                                    latitude={latitude}
                                    longitude={longitude}
                                    onChange={onChange}
                                    disabled={disabled}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button>Done</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                                if (!navigator || !navigator.geolocation)
                                    return alert("Geolocation not supported");

                                isLoading.set(true);

                                toast.promise(
                                    new Promise<GeolocationPosition>(
                                        (resolve, reject) => {
                                            navigator.geolocation.getCurrentPosition(
                                                resolve,
                                                reject,
                                                {
                                                    maximumAge: 0,
                                                    enableHighAccuracy: true,
                                                    timeout: 10000,
                                                },
                                            );
                                        },
                                    )
                                        .then((position) => {
                                            isLoading.set(false);
                                            onChange(
                                                position.coords.latitude,
                                                position.coords.longitude,
                                            );
                                        })
                                        .catch((error) => {
                                            isLoading.set(false);
                                            throw error;
                                        }),
                                    {
                                        pending: "Fetching location",
                                        success: "Location fetched",
                                        error: "Could not fetch location",
                                    },
                                    { autoClose: 500 },
                                );
                            }}
                            disabled={disabled}
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
