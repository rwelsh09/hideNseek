import "leaflet/dist/leaflet.css";
import "leaflet-contextmenu/dist/leaflet.contextmenu.css";
import "leaflet-contextmenu";
import "leaflet-doubletapdrag";
import "leaflet-doubletapdragzoom";

import { useStore } from "@nanostores/react";
import * as turf from "@turf/turf";
import * as L from "leaflet";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, ScaleControl } from "react-leaflet";
import { toast } from "react-toastify";

import {
    addQuestion,
    baseTileLayer,
    followMe,
    geolocationPermission,
    hiderMode,
    isLoading,
    leafletMapContext,
    mapGeoJSON,
    mapGeoLocation,
    polyGeoJSON,
    questionFinishedMapData,
    questions,
    thunderforestApiKey,
    triggerLocalRefresh,
} from "@/lib/context";
import { cn } from "@/lib/utils";
import { applyQuestionsToMapGeoData, holedMask } from "@/maps";
import { hiderifyQuestion } from "@/maps";
import { clearCache, determineMapBoundaries } from "@/maps/api";
import { flyToWithOffset } from "@/maps/ui-utils";

import { ClosestPlaces } from "./ClosestPlaces";
import { DraggableMarkers } from "./DraggableMarkers";
import { LeafletActionButtons } from "./LeafletActionButtons";
import { AddQuestionDialog } from "./AddQuestionDialog";
import { PasteQuestionButton } from "./PasteQuestionButton";
import { OfflineTileLayer } from "./OfflineTileLayer";
import { PlaytestPlaces } from "./PlaytestPlaces";
import { RecommendedStartMarker } from "./RecommendedStartMarker";
import { TransitLinesOverlay } from "./TransitLinesOverlay";

const getTileLayer = (tileLayer: string, thunderforestApiKey: string) => {
    switch (tileLayer) {
        case "light":
            return (
                <OfflineTileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="https://carto.com/attributions">CARTO</a>; Powered by Esri and Turf.js'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20} // This technically should be 6, but once the ratelimiting starts this can take over
                    minZoom={2}
                    noWrap
                />
            );

        case "dark":
            return (
                <OfflineTileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="https://carto.com/attributions">CARTO</a>; Powered by Esri and Turf.js'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    maxZoom={20} // This technically should be 6, but once the ratelimiting starts this can take over
                    minZoom={2}
                    noWrap
                />
            );

        case "transport":
            if (thunderforestApiKey)
                return (
                    <OfflineTileLayer
                        url={`https://tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=${thunderforestApiKey}`}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>; Powered by Esri and Turf.js'
                        maxZoom={22}
                        minZoom={2}
                        noWrap
                    />
                );
            break;

        case "neighbourhood":
            if (thunderforestApiKey)
                return (
                    <OfflineTileLayer
                        url={`https://tile.thunderforest.com/neighbourhood/{z}/{x}/{y}.png?apikey=${thunderforestApiKey}`}
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="http://www.thunderforest.com/">Thunderforest</a>; Powered by Esri and Turf.js'
                        maxZoom={22}
                        minZoom={2}
                        noWrap
                    />
                );
            break;

        case "osmcarto":
            return (
                <OfflineTileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; Powered by Esri and Turf.js'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                    minZoom={2}
                    noWrap
                />
            );
    }

    return (
        <OfflineTileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors; &copy; <a href="https://carto.com/attributions">CARTO</a>; Powered by Esri and Turf.js'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20} // This technically should be 6, but once the ratelimiting starts this can take over
            minZoom={2}
            noWrap
        />
    );
};

export const Map = ({ className }: { className?: string }) => {
    const $mapGeoLocation = useStore(mapGeoLocation);
    const $questions = useStore(questions);
    const $baseTileLayer = useStore(baseTileLayer);
    const $thunderforestApiKey = useStore(thunderforestApiKey);
    const $hiderMode = useStore(hiderMode);
    const $isLoading = useStore(isLoading);
    const $followMe = useStore(followMe);
    const map = useStore(leafletMapContext);

    const followMeMarkerRef = useRef<L.Marker | null>(null);
    const geoWatchIdRef = useRef<number | null>(null);
    const isRefreshingRef = useRef<boolean>(false);
    const refreshPendingRef = useRef<boolean>(false);

    const refreshQuestions = async () => {
        if (!map) return;

        if (isRefreshingRef.current) {
            refreshPendingRef.current = true;
            return;
        }

        isRefreshingRef.current = true;
        isLoading.set(true);

        try {
            if (questions.get().length === 0) {
                await clearCache();
            }

            let mapGeoData = mapGeoJSON.get();

            if (!mapGeoData) {
                const polyGeoData = polyGeoJSON.get();
                if (polyGeoData) {
                    mapGeoData = polyGeoData;
                    mapGeoJSON.set(polyGeoData);
                } else {
                    await determineMapBoundaries()
                        .then((x) => {
                            mapGeoJSON.set(x);
                            polyGeoJSON.set(x);
                            mapGeoData = x;
                        })
                        .catch(() => {});
                }
            }

            if (hiderMode.get() !== false) {
                for (const question of questions.get()) {
                    await hiderifyQuestion(question);
                }

                triggerLocalRefresh.set(Math.random()); // Refresh the question sidebar with new information but not this map
            }

            map.eachLayer((layer: any) => {
                if (layer.questionKey || layer.questionKey === 0) {
                    map.removeLayer(layer);
                }
            });

            mapGeoData = await applyQuestionsToMapGeoData(
                questions.get(),
                mapGeoData,
                (geoJSONObj, question) => {
                    const geoJSONPlane = L.geoJSON(geoJSONObj, {
                        interactive: false,
                    });
                    // @ts-expect-error This is a check such that only this type of layer is removed
                    geoJSONPlane.questionKey = question.key;
                    geoJSONPlane.addTo(map);
                },
            );

            mapGeoData = {
                type: "FeatureCollection",
                features: [holedMask(mapGeoData!)!],
            };

            map.eachLayer((layer: any) => {
                if (layer.eliminationGeoJSON) {
                    // Hopefully only geoJSON layers
                    map.removeLayer(layer);
                }
            });

            const g = L.geoJSON(mapGeoData, { interactive: false });
            // @ts-expect-error This is a check such that only this type of layer is removed
            g.eliminationGeoJSON = true;
            g.addTo(map);

            questionFinishedMapData.set(mapGeoData);
        } catch {
            if (document.querySelectorAll(".Toastify__toast").length === 0) {
                toast.error("No solutions found / error occurred");
            }
        } finally {
            isLoading.set(false);
            isRefreshingRef.current = false;

            if (refreshPendingRef.current) {
                refreshPendingRef.current = false;
                refreshQuestions();
            }
        }
    };

    const contextmenuItems = useMemo(
        () => [
            {
                text: "Add Radius",
                callback: (e: any) =>
                    addQuestion({
                        id: "radius",
                        data: {
                            lat: e.latlng.lat,
                            lng: e.latlng.lng,
                        },
                    }),
            },
            {
                text: "Add Hot/Cold",
                callback: (e: any) => {
                    const destination = turf.destination(
                        [e.latlng.lng, e.latlng.lat],
                        5,
                        90,
                        {
                            units: "kilometers",
                        },
                    );

                    addQuestion({
                        id: "hot/cold",
                        data: {
                            latA: e.latlng.lat,
                            lngA: e.latlng.lng,
                            latB: destination.geometry.coordinates[1],
                            lngB: destination.geometry.coordinates[0],
                        },
                    });
                },
            },
            {
                text: "Add Closest",
                callback: (e: any) => {
                    addQuestion({
                        id: "closest",
                        data: {
                            lat: e.latlng.lat,
                            lng: e.latlng.lng,
                        },
                    });
                },
            },
            {
                text: "Add Match",
                callback: (e: any) => {
                    addQuestion({
                        id: "match",
                        data: {
                            lat: e.latlng.lat,
                            lng: e.latlng.lng,
                        },
                    });
                },
            },
            {
                text: "Add Measure",
                callback: (e: any) => {
                    addQuestion({
                        id: "measure",
                        data: {
                            lat: e.latlng.lat,
                            lng: e.latlng.lng,
                        },
                    });
                },
            },
            {
                text: "Copy Coordinates",
                callback: (e: any) => {
                    if (!navigator || !navigator.clipboard) {
                        toast.error(
                            "Clipboard API not supported in your browser",
                        );
                        return;
                    }

                    const latitude = e.latlng.lat;
                    const longitude = e.latlng.lng;

                    toast.promise(
                        navigator.clipboard.writeText(
                            `${Math.abs(latitude)}°${latitude > 0 ? "N" : "S"}, ${Math.abs(
                                longitude,
                            )}°${longitude > 0 ? "E" : "W"}`,
                        ),
                        {
                            pending: "Writing to clipboard...",
                            success: "Coordinates copied!",
                            error: "An error occurred while copying",
                        },
                        { autoClose: 1000 },
                    );
                },
            },
        ],
        [],
    );

    const displayMap = useMemo(
        () => (
            <MapContainer
                center={[
                    $mapGeoLocation.geometry.coordinates[1],
                    $mapGeoLocation.geometry.coordinates[0],
                ]}
                zoom={10}
                minZoom={10}
                maxBounds={[
                    [50.8427, -114.3158],
                    [51.2124, -113.8599],
                ]}
                className={cn(
                    "w-[500px] h-[500px]",
                    className,
                    $isLoading && "is-loading",
                )}
                ref={leafletMapContext.set}
                // @ts-expect-error Typing doesn't update from react-contextmenu
                contextmenu={true}
                contextmenuWidth={140}
                contextmenuItems={contextmenuItems}
            >
                {getTileLayer($baseTileLayer, $thunderforestApiKey)}
                <TransitLinesOverlay />
                <DraggableMarkers />
                <ClosestPlaces />
                <PlaytestPlaces />
                <RecommendedStartMarker />
                <div className="leaflet-top leaflet-right">
                    <div
                        className="leaflet-control flex-col flex gap-[10px] pointer-events-auto"
                        data-tutorial-id="map-action-buttons"
                    >
                        <LeafletActionButtons />
                    </div>
                </div>
                <div className="leaflet-bottom leaflet-left">
                    <div className="leaflet-control pointer-events-auto mb-6 ml-2 flex flex-col gap-[10px]">
                        {$hiderMode === false ? (
                            <AddQuestionDialog />
                        ) : (
                            <PasteQuestionButton />
                        )}
                    </div>
                </div>
                {$isLoading && (
                    <div className="absolute top-[20%] left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
                        <div
                            className="bg-white/90 backdrop-blur-md shadow-md w-auto h-[36px] px-3 rounded-full flex items-center justify-center border border-slate-300"
                            title="Loading..."
                            aria-label="Loading"
                        >
                            <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
                            <span className="ml-2 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                                Loading...
                            </span>
                        </div>
                    </div>
                )}
                <ScaleControl position="bottomleft" />
            </MapContainer>
        ),
        [map, $baseTileLayer, $thunderforestApiKey, $isLoading],
    );

    useEffect(() => {
        if (!map) return;

        refreshQuestions();
    }, [$questions, map, $hiderMode]);

    useEffect(() => {
        const intervalId = setInterval(async () => {
            if (!map) return;
            let layerCount = 0;
            map.eachLayer((layer: any) => {
                if (layer.eliminationGeoJSON) {
                    // Hopefully only geoJSON layers
                    layerCount++;
                }
            });
            if (layerCount > 1) {
                refreshQuestions();
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [map]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            const mainElement: HTMLElement | null =
                document.querySelector("main");

            if (mainElement) {
                if (document.fullscreenElement) {
                    mainElement.classList.add("fullscreen");
                } else {
                    mainElement.classList.remove("fullscreen");
                }
            }
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
        };
    }, []);

    useEffect(() => {
        if (!map) return;
        if (!$followMe) {
            if (followMeMarkerRef.current) {
                map.removeLayer(followMeMarkerRef.current);
                followMeMarkerRef.current = null;
            }
            if (geoWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(geoWatchIdRef.current);
                geoWatchIdRef.current = null;
            }
            return;
        }

        if (geolocationPermission.get() === "denied") {
            followMe.set(false);
            return;
        }

        geoWatchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                geolocationPermission.set("granted");
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                if (followMeMarkerRef.current) {
                    followMeMarkerRef.current.setLatLng([lat, lng]);
                } else {
                    const marker = L.marker([lat, lng], {
                        icon: L.divIcon({
                            html: `<div class="text-blue-700 bg-white rounded-full border-2 border-blue-700 shadow w-5 h-5 flex items-center justify-center"><svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" fill="#2A81CB" opacity="0.5"/><circle cx="8" cy="8" r="3" fill="#2A81CB"/></svg></div>`,
                            className: "",
                        }),
                        zIndexOffset: 1000,
                    });
                    marker.addTo(map);
                    followMeMarkerRef.current = marker;
                }
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    geolocationPermission.set("denied");
                    toast.error("Location access denied.", {
                        toastId: "location-denied",
                    });
                    followMe.set(false);
                } else {
                    toast.error("Unable to access your location. Retrying...", {
                        toastId: "location-error",
                    });
                }
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 },
        );
        return () => {
            if (followMeMarkerRef.current) {
                map.removeLayer(followMeMarkerRef.current);
                followMeMarkerRef.current = null;
            }
            if (geoWatchIdRef.current !== null) {
                navigator.geolocation.clearWatch(geoWatchIdRef.current);
                geoWatchIdRef.current = null;
            }
        };
    }, [$followMe, map]);

    const hasCenteredRef = useRef(false);

    useEffect(() => {
        if (!map) return;
        if (hasCenteredRef.current) return;
        hasCenteredRef.current = true;

        const setDefaultLocation = () => {
            const extent = $mapGeoLocation?.properties?.extent;
            if (extent) {
                const bounds = L.latLngBounds([
                    [extent[0], extent[1]],
                    [extent[2], extent[3]],
                ]);
                const center = bounds.getCenter();
                const zoom = map.getBoundsZoom(bounds);
                flyToWithOffset(map, center, zoom);
            }
        };

        setDefaultLocation();
    }, [$mapGeoLocation, map]);

    return displayMap;
};
