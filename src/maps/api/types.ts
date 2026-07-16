import type { Feature, Point, Polygon } from "geojson";
import type { LatLngTuple } from "leaflet";

import type { Question } from "@/maps/schema";

export interface OpenStreetMap {
    type: string;
    geometry: OpenStreetMapGeometry;
    properties: OpenStreetMapProperties;
}

interface OpenStreetMapGeometry {
    type: string;
    coordinates: LatLngTuple;
}

interface OpenStreetMapProperties {
    osm_type: "W" | "R" | "N";
    osm_id: number;
    extent?: number[];
    country?: string;
    state?: string;
    osm_key: string;
    countrycode: string;
    osm_value: string;
    name: string;
    type: string;
    isHidingZone?: boolean;
    questions?: Question[];
}

export enum QuestionSpecificLocation {
    McDonalds = '["brand:wikidata"="Q38076"]',
    Seven11 = '["brand:wikidata"="Q259340"]',
    TimHortons = '["brand:wikidata"="Q175106"]',
    Pub = '["amenity"~"^(pub|bar)$"]',
}

interface StationPlaceProperties {
    id: string;
    [key: string]: string | undefined;
}

export type StationPlace = Feature<Point, StationPlaceProperties>;
export type StationCircle = Feature<Polygon, StationPlace>;

export type {
    EncompassingClosestQuestionSchema,
} from "@/maps/schema";
