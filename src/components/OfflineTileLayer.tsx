import "leaflet.offline";

import { createTileLayerComponent, type LayerProps } from "@react-leaflet/core";
import L from "leaflet";
import { truncate, getStorageLength, savetiles } from "leaflet.offline";

interface OfflineTileLayerProps extends L.TileLayerOptions, LayerProps {
    url: string;
}

const createOfflineTileLayer = (props: OfflineTileLayerProps, context: any) => {
    const { url, ...options } = props;
    const instance = L.tileLayer.offline(url, options);

    // Background refresh / cleanup strategy
    setTimeout(async () => {
        if (!navigator.onLine) return; // do not clear tiles if currently offline
        try {
            const length = await getStorageLength();
            if (length > 0) {
                const lastClear = localStorage.getItem('last_map_cache_clear');
                const now = Date.now();
                const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

                if (!lastClear || now - parseInt(lastClear, 10) > SEVEN_DAYS) {
                    await truncate();
                    localStorage.setItem('last_map_cache_clear', now.toString());
                }
            }
        } catch (e) {
            console.error("Failed to manage tile cache", e);
        }
    }, 10000); // 10 seconds after load

    let control: any = null;
    let saveTimeout: any = null;
    let moveEndListener: any = null;

    instance.on('add', (e: any) => {
        const map = e.target._map;
        if (!map) return;

        control = savetiles(instance, {
             alwaysDownload: false,
             confirm: (status: any, successCallback: Function) => successCallback(),
             confirmRemoval: (status: any, successCallback: Function) => successCallback(),
        });

        control.addTo(map);
        if (control.getContainer()) {
            control.getContainer().style.display = 'none';
        }

        // Listen to map movements to cache tiles as the user views them
        moveEndListener = () => {
            if (!navigator.onLine) return;
            const currentZoom = map.getZoom();
            if (currentZoom < 10) return;

            // Debounce tile saving to avoid spamming the network on every drag
            if (saveTimeout) clearTimeout(saveTimeout);

            saveTimeout = setTimeout(() => {
                try {
                    control.options.zoomlevels = [currentZoom];
                    if (control._saveTiles) {
                        control._saveTiles();
                    }
                } catch (err) {
                     // Ignore caching errors
                }
            }, 2000);
        };

        map.on('moveend', moveEndListener);
    });

    instance.on('remove', (e: any) => {
        const map = e.target._map;
        if (!map) return;

        if (saveTimeout) {
            clearTimeout(saveTimeout);
            saveTimeout = null;
        }
        if (moveEndListener) {
            map.off('moveend', moveEndListener);
            moveEndListener = null;
        }
        if (control) {
            control.remove();
            control = null;
        }
    });

    return { instance, context };
};

const updateOfflineTileLayer = (
    instance: any,
    props: OfflineTileLayerProps,
    prevProps: OfflineTileLayerProps,
) => {
    if (prevProps.url !== props.url) {
        if (instance.setUrl) instance.setUrl(props.url);
    }
};

export const OfflineTileLayer = createTileLayerComponent<
    any,
    OfflineTileLayerProps
>(createOfflineTileLayer, updateOfflineTileLayer);
