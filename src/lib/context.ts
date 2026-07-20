import { persistentAtom } from "@nanostores/persistent";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { Map } from "leaflet";
import { atom, computed, onSet } from "nanostores";

import type { OpenStreetMap, StationCircle } from "@/maps/api";
import { extractStationLabel } from "@/maps/geo-utils";
import {
    type DeepPartial,
    type Question,
    type Questions,
    questionSchema,
    questionsSchema,
    type Units,
} from "@/maps/schema";

/**
 * A wrapper for persistentAtom that automatically handles standard JSON serialization.
 * This reduces boilerplate and highlights atoms that require custom validation (e.g., Zod).
 */
const persistentJsonAtom = <T>(name: string, initialValue: T) =>
    persistentAtom<T>(name, initialValue, {
        encode: JSON.stringify,
        decode: JSON.parse,
    });

export const mapGeoLocation = persistentJsonAtom<OpenStreetMap>(
    "mapGeoLocation",
    {
        geometry: {
            coordinates: [-114.0719, 51.0447],
            type: "Point",
        },
        type: "Feature",
        properties: {
            osm_type: "R",
            osm_id: 3227127,
            extent: [50.8427, -114.3158, 51.2124, -113.8599],
            country: "Canada",
            osm_key: "place",
            countrycode: "CA",
            osm_value: "city",
            name: "Calgary",
            type: "city",
        },
    },
);

export const hasSeenWelcome = persistentJsonAtom<boolean>(
    "hasSeenWelcome",
    false,
);

export const showHiderTutorial = persistentJsonAtom<boolean>(
    "showHiderTutorial",
    true,
);

export const tutorialDriver = atom<any>(null);

export const headStartMinutes = persistentJsonAtom<number>(
    "headStartMinutes",
    45,
);
export const mapGeoJSON = atom<FeatureCollection<
    Polygon | MultiPolygon
> | null>(null);

export const polyGeoJSON = persistentJsonAtom<FeatureCollection<
    Polygon | MultiPolygon
> | null>("polyGeoJSON", null);

export const questions = persistentAtom<Questions>("questions", [], {
    encode: JSON.stringify,
    decode: (x) => questionsSchema.parse(JSON.parse(x)),
});
export const addQuestion = (question: DeepPartial<Question>) => {
    questions.get().push(questionSchema.parse(question));
    questionModified();
};
export const questionModified = () => {
    questions.set([...questions.get()]);
    if (questions.get().length === 0) {
        lockedRecommendedStart.set(null);
        lockedActiveStationIds.set(null);
    }
};

export const leafletMapContext = atom<Map | null>(null);

export const hiderMode = persistentJsonAtom<
    | false
    | {
          latitude: number;
          longitude: number;
      }
>("isHiderMode", false);
export const triggerLocalRefresh = atom<number>(0);

export const displayHidingZonesStyle = persistentAtom<"zones" | "no-display">(
    "displayHidingZonesStyle",
    "no-display",
);

export const displayTransitLines = persistentJsonAtom<boolean>(
    "displayTransitLines",
    true,
);

export const questionFinishedMapData = atom<any>(null);

export const trainStations = atom<StationCircle[]>([]);
onSet(trainStations, ({ newValue }) => {
    newValue.sort((a, b) => {
        const aName = (extractStationLabel(a.properties) || "") as string;
        const bName = (extractStationLabel(b.properties) || "") as string;
        return aName.localeCompare(bName);
    });
});

export const hidingRadius = persistentJsonAtom<number>("hidingRadius", 0.8);
export const hidingRadiusUnits = persistentJsonAtom<Units>(
    "hidingRadiusUnits",
    "kilometers",
);
export const disabledStations = persistentJsonAtom<string[]>(
    "disabledStations",
    [],
);

export const hidingZone = computed(
    [
        questions,
        polyGeoJSON,
        mapGeoLocation,
        disabledStations,
        hidingRadius,
        hidingRadiusUnits,
        headStartMinutes,
    ],
    (
        q,
        geo,
        loc,
        disabledStations,
        radius,
        hidingRadiusUnits,
        $headStartMinutes,
    ) => {
        if (geo !== null) {
            return {
                ...geo,
                questions: q,
                disabledStations: disabledStations,
                hidingRadius: radius,
                hidingRadiusUnits,
                headStartMinutes: $headStartMinutes,
            };
        } else {
            const $loc = structuredClone(loc);
            $loc.properties.isHidingZone = true;
            $loc.properties.questions = q;
            return {
                ...$loc,
                disabledStations: disabledStations,
                hidingRadius: radius,
                hidingRadiusUnits,
                headStartMinutes: $headStartMinutes,
            };
        }
    },
);

export const geolocationPermission = atom<"prompt" | "granted" | "denied">(
    "prompt",
);

if (typeof window !== "undefined" && navigator.permissions) {
    navigator.permissions
        .query({ name: "geolocation" })
        .then((permissionStatus) => {
            geolocationPermission.set(permissionStatus.state);
            permissionStatus.onchange = () => {
                geolocationPermission.set(permissionStatus.state);
            };
        })
        .catch(() => {
            // Some browsers (like old Safari) don't support the permissions API for geolocation
            // We just let it default to "prompt"
        });
}

export const isLoading = atom<boolean>(false);

export const isOptionsOpenStore = atom<boolean>(false);

export const baseTileLayer = persistentAtom<
    "voyager" | "light" | "dark" | "osmcarto" | "satellite"
>("baseTileLayer", "voyager");

export const followMe = persistentJsonAtom<boolean>("followMe", false);

export const showTutorial = persistentJsonAtom<boolean>("showTutorials", true);

export const showNextStepsChecklist = persistentJsonAtom<boolean>(
    "showNextStepsChecklist",
    false,
);

export const hasSeenRules = persistentJsonAtom<boolean>("hasSeenRules", false);

// --- TIME PENALTY & INFO BOARD STATE ---
export const TIME_PENALTIES: Record<string, number> = {
    match: 15,
    measure: 15,
    radar: 10,
    closest: 20,
    "hot/cold": 10,
    photo: 5,
};

export const penaltyMinutes = persistentJsonAtom<number>("penaltyMinutes", 0);

export const timerStartTimestamp = persistentJsonAtom<number | null>(
    "timerStartTimestamp",
    null,
);
export const timerElapsedSeconds = persistentJsonAtom<number>(
    "timerElapsedSeconds",
    0,
);
export const isTimerRunning = persistentJsonAtom<boolean>(
    "isTimerRunning",
    false,
);

export type LeaderboardEntry = {
    id: string;
    names: string;
    totalSeconds: number;
    penaltyMinutes: number;
};

export const leaderboard = persistentJsonAtom<LeaderboardEntry[]>(
    "leaderboard",
    [],
);

export const lockedActiveStationIds = persistentJsonAtom<string[] | null>(
    "lockedActiveStationIds",
    null,
);

export const lockedRecommendedStart = persistentJsonAtom<
    [number, number] | null
>("lockedRecommendedStart", null);

export const showRecommendedStart = persistentJsonAtom<boolean>(
    "showRecommendedStart",
    false,
);

export const hasSeenPerformanceWarning = persistentJsonAtom<boolean>(
    "hasSeenPerformanceWarning",
    false,
);
