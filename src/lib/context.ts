import { persistentAtom } from "@nanostores/persistent";
import type { FeatureCollection, MultiPolygon, Polygon } from "geojson";
import type { Map } from "leaflet";
import { atom, computed, onSet } from "nanostores";

import type {
    OpenStreetMap,
    StationCircle,
} from "@/maps/api";
import { extractStationLabel } from "@/maps/geo-utils";
import {
    type DeepPartial,
    type Question,
    type Questions,
    questionSchema,
    questionsSchema,
    type Units,
} from "@/maps/schema";

export const mapGeoLocation = persistentAtom<OpenStreetMap>(
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
    {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
);

export const hasSeenWelcome = persistentAtom<boolean>("hasSeenWelcome", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export const showHiderTutorial = persistentAtom<boolean>("showHiderTutorial", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export const tutorialDriver = atom<any>(null);

export const headStartMinutes = persistentAtom<number>("headStartMinutes", 45, {
    encode: JSON.stringify,
    decode: JSON.parse,
});
export const mapGeoJSON = atom<FeatureCollection<
    Polygon | MultiPolygon
> | null>(null);

export const polyGeoJSON = persistentAtom<FeatureCollection<
    Polygon | MultiPolygon
> | null>("polyGeoJSON", null, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

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
    }
};

export const leafletMapContext = atom<Map | null>(null);

export const hiderMode = persistentAtom<
    | false
    | {
          latitude: number;
          longitude: number;
      }
>("isHiderMode", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});
export const triggerLocalRefresh = atom<number>(0);

export const displayHidingZonesStyle = persistentAtom<
    "zones" | "stations" | "no-overlap" | "no-display"
>("displayHidingZonesStyle", "no-display");

export const displayTransitLines = persistentAtom<boolean>("displayTransitLines", true, {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
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

export const hidingRadius = persistentAtom<number>("hidingRadius", 0.8, {
    encode: JSON.stringify,
    decode: JSON.parse,
});
export const hidingRadiusUnits = persistentAtom<Units>("hidingRadiusUnits", "kilometers", {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
);
export const disabledStations = persistentAtom<string[]>("disabledStations", [], {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
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
    "voyager" | "light" | "dark" | "transport" | "neighbourhood" | "osmcarto"
>("baseTileLayer", "voyager");

export const thunderforestApiKey = persistentAtom<string>("thunderforestApiKey", "", {
        encode: (value: string) => value,
        decode: (value: string) => value,
    },
);
export const followMe = persistentAtom<boolean>("followMe", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export const showTutorial = persistentAtom<boolean>("showTutorials", true, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export const showNextStepsChecklist = persistentAtom<boolean>("showNextStepsChecklist", false, {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
);

export const hasSeenRules = persistentAtom<boolean>("hasSeenRules", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

// --- TIME PENALTY & INFO BOARD STATE ---
export const TIME_PENALTIES: Record<string, number> = {
    match: 15,
    measure: 15,
    radar: 10,
    closest: 20,
    "hot/cold": 10,
    photo: 5,
};

export const penaltyMinutes = persistentAtom<number>("penaltyMinutes", 0, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export const timerStartTimestamp = persistentAtom<number | null>("timerStartTimestamp", null, {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
);
export const timerElapsedSeconds = persistentAtom<number>("timerElapsedSeconds", 0, {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
);
export const isTimerRunning = persistentAtom<boolean>("isTimerRunning", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export type LeaderboardEntry = {
    id: string;
    names: string;
    totalSeconds: number;
    penaltyMinutes: number;
};

export const leaderboard = persistentAtom<LeaderboardEntry[]>("leaderboard", [], {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
);

export const lockedRecommendedStart = persistentAtom<[number, number] | null>("lockedRecommendedStart", null, {
    encode: JSON.stringify,
    decode: JSON.parse,
});

export const showRecommendedStart = persistentAtom<boolean>("showRecommendedStart", false, {
        encode: JSON.stringify,
        decode: JSON.parse,
    },
);

export const hasSeenPerformanceWarning = persistentAtom<boolean>("hasSeenPerformanceWarning", false, {
    encode: JSON.stringify,
    decode: JSON.parse,
});
