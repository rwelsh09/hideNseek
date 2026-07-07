import _ from "lodash";
import { toast } from "react-toastify";

import { CacheType } from "./types";

const determineQuestionCache = _.memoize(() => caches.open(CacheType.CACHE));
const determineZoneCache = _.memoize(() => caches.open(CacheType.ZONE_CACHE));
const determinePermanentCache = _.memoize(() =>
    caches.open(CacheType.PERMANENT_CACHE),
);

const inFlightFetches = new Map<string, Promise<Response>>();

export const determineCache = async (cacheType: CacheType) => {
    switch (cacheType) {
        case CacheType.CACHE:
            return await determineQuestionCache();
        case CacheType.ZONE_CACHE:
            return await determineZoneCache();
        case CacheType.PERMANENT_CACHE:
            return await determinePermanentCache();
    }
};

export const cacheFetch = async (
    url: string, // We use this string purely as the unique Cache Key
    loadingText?: string,
    cacheType: CacheType = CacheType.CACHE,
    fetchConfig?: { url: string; options: RequestInit } // Added config for POST overrides
) => {
    try {
        const cache = await determineCache(cacheType);

        const cachedResponse = await cache.match(url);
        if (cachedResponse) {
            if (!cachedResponse.ok) {
                await cache.delete(url);
            } else {
                return cachedResponse.clone();
            }
        }

        const inflightKey = `${cacheType}:${url}`;
        const existingFetch = inFlightFetches.get(inflightKey);
        if (existingFetch) {
            const response = await existingFetch;
            return response.clone();
        }

        const fetchAndMaybeCache = async () => {
            // Use fetchConfig for network call if provided, otherwise fallback to standard GET
            const targetUrl = fetchConfig ? fetchConfig.url : url;
            const targetOptions = fetchConfig ? fetchConfig.options : undefined;
            const response = await fetch(targetUrl, targetOptions);

            if (response.ok) {
                await cache.put(url, response.clone());
            } else {
                await cache.delete(url);
            }
            return response;
        };

        const fetchPromise = fetchAndMaybeCache();
        inFlightFetches.set(inflightKey, fetchPromise);

        let toastId: import("react-toastify").Id | undefined;
        if (loadingText) {
            toastId = toast.loading(loadingText);
        }

        try {
            const response = await fetchPromise;

            return response.clone();
        } finally {
            inFlightFetches.delete(inflightKey);
            if (toastId) {
                toast.dismiss(toastId);
            }
        }
    } catch {
        return fetch(fetchConfig ? fetchConfig.url : url, fetchConfig ? fetchConfig.options : undefined);
    }
};

export const clearCache = async (cacheType: CacheType = CacheType.CACHE) => {
    try {
        const cache = await determineCache(cacheType);
        await cache.keys().then((keys) => {
            keys.forEach((key) => {
                cache.delete(key);
            });
        });
    } catch {
        // Probably a caches not supported error
    }
};
