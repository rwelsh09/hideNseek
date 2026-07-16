import * as turf from "@turf/turf";
import type { Feature, FeatureCollection, MultiPolygon } from "geojson";

import calgaryBoundaryData from "@/data/calgary_boundary.json";
import {
    mapGeoJSON,
        polyGeoJSON,
} from "@/lib/context";
import { PLACES } from "@/maps/placesConfig";

import { LOCATION_FIRST_TAG } from "./constants";

const getLocationTypeName = (location: string) => {
    const place = PLACES.find(p => p.id === location);
    return place ? place.labelPlural : "Locations";
};

export const findClosestLocations = async (
    question: any,
    text?: string,
) => {
    const loadingText =
        text ?? `Finding all ${getLocationTypeName(question.locationType)}...`;

    const place = PLACES.find(p => p.id === question.locationType);
    let data;
    if (place && place.type === "specific" && place.specificLocation) {
        data = await findPlacesInZone(place.specificLocation, loadingText);
    } else {
        data = await findPlacesInZone(
            `[${LOCATION_FIRST_TAG[question.locationType]}=${question.locationType}]`,
            loadingText,
        );
    }
    const elements = data.elements || [];
    const response = turf.points([]);
    const centerPoint = turf.point([question.lng, question.lat]);

    const radiusInMeters = 50000;

    const seenNames = new Set<string>();
    const seenCoords = new Set<string>();

    elements.forEach((element: any) => {
        if (!element.tags) return;
        const place = PLACES.find(p => p.id === question.locationType);
        const fallbackName = place && place.type === "specific" ? place.label : null;

        if (
            !element.tags["name"] &&
            !element.tags["name:en"] &&
            !fallbackName
        ) {
            return;
        }

        const hasCenter =
            element.center && element.center.lon && element.center.lat;
        const hasLatLon = element.lat && element.lon;

        let ptLon: number, ptLat: number;
        if (hasCenter) {
            ptLon = element.center.lon;
            ptLat = element.center.lat;
        } else if (hasLatLon) {
            ptLon = element.lon;
            ptLat = element.lat;
        } else {
            return;
        }

        const pt = turf.point([ptLon, ptLat]);
        const distance = turf.distance(centerPoint, pt, {
            units: "meters",
        });

        const coordKey = `${ptLon.toFixed(4)},${ptLat.toFixed(4)}`;
        if (seenCoords.has(coordKey)) return;

        if (distance <= radiusInMeters) {
            seenCoords.add(coordKey);
            const name =
                element.tags["name:en"] ?? element.tags["name"] ?? fallbackName;
            const isChain = fallbackName !== null;
            if (!isChain && seenNames.has(name)) return;

            if (!isChain) {
                seenNames.add(name);
            }

            // Add a unique identifier for chain restaurants so they can be distinguished visually if needed,
            // or at least not be identical in properties if standard logic expects it.
            response.features.push(
                turf.point([ptLon, ptLat], {
                    name: isChain ? `${name} (${element.id})` : name,
                    id: element.id,
                }),
            );
        }
    });
    return response;
};

let boundaryPromise: Promise<FeatureCollection<MultiPolygon>> | null = null;
let cachedOfflineData: any[] | null = null;

const ensureElementCenter = (el: any) => {
    let lon = el.center ? el.center.lon : el.lon;
    let lat = el.center ? el.center.lat : el.lat;

    if (
        (typeof lon !== "number" || typeof lat !== "number") &&
        el.geometry &&
        el.geometry.length > 0
    ) {
        lon = el.geometry[0].lon;
        lat = el.geometry[0].lat;
    }

    if (
        (typeof lon !== "number" || typeof lat !== "number") &&
        el.type === "relation"
    ) {
        if (el.bounds) {
            lon = el.bounds.minlon;
            lat = el.bounds.minlat;
        } else if (el.members && el.members.length > 0) {
            const memberWithGeom = el.members.find(
                (m: any) => m.geometry && m.geometry.length > 0
            );
            if (memberWithGeom) {
                lon = memberWithGeom.geometry[0].lon;
                lat = memberWithGeom.geometry[0].lat;
            }
        }
    }

    if (typeof lon === "number" && typeof lat === "number") {
        if (!el.center) {
            el.center = { lon, lat };
        }
    } else {
        if (el.center) {
            if (typeof el.center.lon !== "number" || typeof el.center.lat !== "number") {
                delete el.center;
            }
        }
    }
};

export const checkFilters = (filtersToMatch: any[], tags: Record<string, string>) => {
    if (filtersToMatch.length === 0) return true;
    return filtersToMatch.every((f) => {
        const tagVal = tags[f.key];
        if (tagVal === undefined) return false;
        if (f.op === "=") {
            return tagVal === f.val;
        } else if (f.op === "~") {
            try {
                const re = new RegExp(f.val);
                return re.test(tagVal);
            } catch {
                return false;
            }
        }
        return false;
    });
};

export const findPlacesInZone = async (
    filter: string,
    loadingText?: string,
    alternatives: string[] = [],
) => {
    let $polyGeoJSON = polyGeoJSON.get();

    if (!$polyGeoJSON) {
        if (!boundaryPromise) {
            boundaryPromise = determineMapBoundaries();
        }
        $polyGeoJSON = await boundaryPromise;
        polyGeoJSON.set($polyGeoJSON);
        mapGeoJSON.set($polyGeoJSON);
        boundaryPromise = null;
    }


    if (!cachedOfflineData) {
        const dataModule = await import('@/data/offline_places.json');
        cachedOfflineData = dataModule.default?.elements || dataModule.elements || [];
    }
    const offlineData = cachedOfflineData;

    // Parse filter using regex `/\["?([^"\]=~]+)"?(=|~)"?([^"\]]+)"?\]/g`
    const extractFilters = (queryStr: string) => {
        const regex = /\["?([^"\]=~]+)"?(=|~)"?([^"\]]+)"?\]/g;
        const matches = [];
        let match;
        while ((match = regex.exec(queryStr)) !== null) {
            matches.push({ key: match[1], op: match[2], val: match[3] });
        }
        return matches;
    };

    const primaryFilters = extractFilters(filter);
    const altFilters = alternatives.map(extractFilters);

    const matchedElements = offlineData.filter((el: any) => {
        if (!el.tags) return false;

        const matchesPrimary = checkFilters(primaryFilters, el.tags);
        const matchesAnyAlt = altFilters.length > 0 ? altFilters.some(f => checkFilters(f, el.tags)) : false;

        return matchesPrimary || matchesAnyAlt;
    });

    const data = { elements: matchedElements.map((el: any) => ({ ...el })) };

    if (data && data.elements) {
        data.elements.forEach(ensureElementCenter);
    }

    if ($polyGeoJSON && data && data.elements) {
        data.elements = data.elements.filter((el: any) => {
            const lon = el.center ? el.center.lon : el.lon;
            const lat = el.center ? el.center.lat : el.lat;

            if (typeof lon !== "number" || typeof lat !== "number")
                return false;
            const pt = turf.point([lon, lat]);
            return $polyGeoJSON.features.some((poly) =>
                turf.booleanPointInPolygon(pt, poly as any),
            );
        });
    }

    return data;
};

export const determineMapBoundaries = async () => {
    return turf.featureCollection([
        calgaryBoundaryData[0] as Feature<MultiPolygon>,
    ]);
};
