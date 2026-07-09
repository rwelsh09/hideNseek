import * as turf from "@turf/turf";
import type { Feature, FeatureCollection, MultiPolygon } from "geojson";
import _ from "lodash";
import pLimit from "p-limit";
import { toast } from "react-toastify";

import calgaryBoundaryData from "@/data/calgary_boundary.json";
import {
    mapGeoJSON,
    mapGeoLocation,
    offlineMode,
    polyGeoJSON,
} from "@/lib/context";

import { LOCATION_FIRST_TAG } from "./constants";
import type { APILocations } from "./types";
import type { EncompassingClosestQuestionSchema } from "./types";
import { QuestionSpecificLocation } from "./types";

const getLocationTypeName = (locationType: string) => {
    switch (locationType) {
        case "museum":
            return "Museums";
        case "hospital":
            return "Hospitals";
        case "cinema":
            return "Movie Theaters";
        case "library":
            return "Libraries";
        case "mcdonalds":
            return "McDonald's";
        case "seven11":
            return "7-Elevens";
        case "timhortons":
            return "Tim Hortons";
        case "pub":
            return "Pubs/Bars";
        case "golf_course":
            return "Golf Courses";
        default:
            return "Locations";
    }
};

export const findClosestLocations = async (
    question: EncompassingClosestQuestionSchema,
    text?: string,
) => {
    const loadingText =
        text ?? `Finding all ${getLocationTypeName(question.locationType)}...`;

    let data;
    if (
        question.locationType === "mcdonalds" ||
        question.locationType === "seven11" ||
        question.locationType === "timhortons" ||
        question.locationType === "pub"
    ) {
        data = await findPlacesInZone(
            question.locationType === "mcdonalds"
                ? QuestionSpecificLocation.McDonalds
                : question.locationType === "seven11"
                  ? QuestionSpecificLocation.Seven11
                  : question.locationType === "timhortons"
                    ? QuestionSpecificLocation.TimHortons
                    : QuestionSpecificLocation.Pub,
            loadingText,
            "nwr",
            "center",
        );
    } else {
        data = await findPlacesInZone(
            `[${LOCATION_FIRST_TAG[question.locationType]}=${question.locationType}]`,
            loadingText,
            "nwr",
            "center",
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
        const fallbackName =
            question.locationType === "mcdonalds"
                ? "McDonald's"
                : question.locationType === "seven11"
                  ? "7-Eleven"
                  : question.locationType === "timhortons"
                    ? "Tim Hortons"
                    : question.locationType === "pub"
                      ? "Pub / Bar"
                      : null;

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

export const findPlacesInZone = async (
    filter: string,
    loadingText?: string,
    searchType:
        | "node"
        | "way"
        | "relation"
        | "nwr"
        | "nw"
        | "wr"
        | "nr"
        | "area" = "nwr",
    outType: "center" | "geom" = "center",
    alternatives: string[] = [],
    timeoutDuration: number = 0,
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


    const dataModule = await import('@/data/offline_places.json');
    const offlineData = dataModule.default?.elements || dataModule.elements || [];

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

        const checkFilters = (filtersToMatch: any[]) => {
            if (filtersToMatch.length === 0) return true;
            return filtersToMatch.every((f) => {
                const tagVal = el.tags[f.key];
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

        const matchesPrimary = checkFilters(primaryFilters);
        const matchesAnyAlt = altFilters.length > 0 ? altFilters.some(checkFilters) : false;

        return matchesPrimary || matchesAnyAlt;
    });

    const data = { elements: JSON.parse(JSON.stringify(matchedElements)) };

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

export const findPlacesSpecificInZone = async (
    location: `${QuestionSpecificLocation}`,
) => {
    const locations = (
        await findPlacesInZone(
            location,
            `Finding ${
                location === '["brand:wikidata"="Q38076"]'
                    ? "McDonald's"
                    : location === '["brand:wikidata"="Q259340"]'
                      ? "7-Elevens"
                      : location === '["brand:wikidata"="Q175106"]'
                        ? "Tim Hortons"
                        : "Pubs/Bars"
            }...`,
        )
    ).elements;
    return turf.featureCollection(
        locations.filter((x: any) => typeof (x.center?.lon ?? x.lon) === 'number' && typeof (x.center?.lat ?? x.lat) === 'number').map((x: any) =>
            turf.point([
                x.center ? x.center.lon : x.lon,
                x.center ? x.center.lat : x.lat,
            ]),
        ),
    );
};

export const nearestToQuestion = async (question: any) => {
    let radius = 30;
    let instances: any = { features: [] };
    let iterations = 0;
    const MAX_ITERATIONS = 10;
    while (instances.features.length === 0 && iterations < MAX_ITERATIONS) {
        instances = await findClosestLocations(
            {
                lat: question.lat,
                lng: question.lng,
                radius: radius,
                unit: "kilometers",
                location: false,
                locationType: question.type,
                drag: false,
                color: "black",
                collapsed: false,
                showLabels: false,
            },
            "Finding match locations...",
        );
        radius += 30;
        iterations++;
    }

    if (instances.features.length === 0) {
        return null;
    }

    const questionPoint = turf.point([question.lng, question.lat]);
    return turf.nearestPoint(questionPoint, instances as any);
};

let isCachingAllPlaces = false;

export const cacheAllPlaces = async () => {
    if (isCachingAllPlaces) return;
    isCachingAllPlaces = true;

    try {
        const tasks: (() => Promise<any>)[] = [];

        // Standard Locations (from LOCATION_FIRST_TAG)
        Object.keys(LOCATION_FIRST_TAG).forEach((locationStr) => {
            const location = locationStr as APILocations;

            if (
                location === "mcdonalds" ||
                location === "seven11" ||
                location === "timhortons" ||
                location === "pub"
            ) {
                return;
            }

            tasks.push(() =>
                findPlacesInZone(
                    `[${LOCATION_FIRST_TAG[location]}=${location}]`,
                    `Finding ${getLocationTypeName(locationStr)}...`,
                    "nwr",
                    "center",
                ),
            );
        });

        // Specific Hardcoded Queries
        tasks.push(() =>
            findPlacesInZone(
                '["admin_level"="10"]',
                "Finding Neighborhoods...",
                "nwr",
                "geom",
            ),
        );

        // Specific Location Enum Queries (McDonalds, 7Eleven)
        Object.values(QuestionSpecificLocation).forEach((loc) => {
            tasks.push(() => findPlacesSpecificInZone(loc as any));
        });

        const total = tasks.length;
        let completed = 0;
        let failed = 0;

        const toastId = toast.loading(`Caching places... (0/${total})`);

        // Run concurrently to avoid 504 Gateway Timeouts from Overpass
        const limit = pLimit(3);

        await Promise.all(
            tasks.map((task) =>
                limit(async () => {
                    try {
                        const result = await task();
                        if (result && result._failed) {
                            throw new Error("API Task Failed");
                        }
                    } catch (e) {
                        console.error("Cache task failed", e);
                        failed++;
                    } finally {
                        completed++;
                        const progress = completed / total;
                        toast.update(toastId, {
                            render: `Caching places... (${completed}/${total})`,
                            progress: progress,
                        });
                    }
                }),
            ),
        );

        if (failed > 0) {
            toast.update(toastId, {
                render: `Cached most places, but ${failed} failed.`,
                type: "warning",
                isLoading: false,
                autoClose: 5000,
                progress: undefined,
            });
        } else {
            toast.update(toastId, {
                render: "All possible places have been cached!",
                type: "success",
                isLoading: false,
                autoClose: 3000,
                progress: undefined,
            });
        }
    } finally {
        isCachingAllPlaces = false;
    }
};

export const determineMapBoundaries = async () => {
    return turf.featureCollection([
        calgaryBoundaryData[0] as Feature<MultiPolygon>,
    ]);
};
