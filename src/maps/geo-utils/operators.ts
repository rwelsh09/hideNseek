import * as units from "@arcgis/core/core/units.js";
import * as geodesicBufferOperator from "@arcgis/core/geometry/operators/geodesicBufferOperator.js";
import * as geodeticDistanceOperator from "@arcgis/core/geometry/operators/geodeticDistanceOperator.js";
import Point from "@arcgis/core/geometry/Point.js";
import * as geometryJsonUtils from "@arcgis/core/geometry/support/jsonUtils.js";
import * as unionTypes from "@arcgis/core/unionTypes.js";
import { arcgisToGeoJSON, geojsonToArcGIS } from "@terraformer/arcgis";
import * as turf from "@turf/turf";
import type {
    Feature,
    FeatureCollection,
    MultiPolygon,
    Polygon,
} from "geojson";

import { BLANK_GEOJSON } from "@/maps/api";

export { geoSpatialVoronoi } from "@/maps/geo-utils/voronoi";

export const safeUnion = (input: FeatureCollection<Polygon | MultiPolygon>) => {
    if (input.features.length === 0) return turf.multiPolygon([]) as any;
    if (input.features.length === 1) return input.features[0];

    let union;
    try {
        union = turf.union(input);
    } catch (e) {
        console.error("safeUnion turf.union failed", e);
        union = null;
    }

    if (union) return union;

    // Fallback: Just return a FeatureCollection or a MultiPolygon manually?
    // Let's create a combined multipolygon manually.
    const coordinates: any[] = [];
    for (const f of input.features) {
        if (f.geometry.type === "Polygon") {
            coordinates.push(f.geometry.coordinates);
        } else if (f.geometry.type === "MultiPolygon") {
            coordinates.push(...f.geometry.coordinates);
        }
    }
    return turf.multiPolygon(coordinates) as any;
};

export const holedMask = (
    input:
        | Feature<Polygon | MultiPolygon>
        | FeatureCollection<Polygon | MultiPolygon>,
) => {
    let diff;
    try {
        diff = turf.difference(
            turf.featureCollection([
                BLANK_GEOJSON.features[0] as Feature<Polygon>,
                "features" in input ? safeUnion(input) : input,
            ]),
        );
    } catch (e) {
        console.error("holedMask turf.difference failed", e);
        diff = null;
    }
    if (!diff) return null;
    return turf.rewind(diff, { mutate: true }) as Feature<
        Polygon | MultiPolygon
    >;
};

export const modifyMapData = (
    mapData: FeatureCollection<Polygon | MultiPolygon>,
    modifications:
        | FeatureCollection<Polygon | MultiPolygon>
        | Feature<Polygon | MultiPolygon>,
    withinModifications: boolean,
) => {
    const safeModifications =
        "features" in modifications ? safeUnion(modifications) : modifications;

    if (withinModifications) {
        let result;
        try {
            result = turf.intersect(
                turf.featureCollection([safeUnion(mapData), safeModifications]),
            );
        } catch (e) {
            console.error(
                "turf.intersect failed, falling back to modifications",
                e,
            );
            result = safeModifications;
        }
        if (result) return turf.rewind(result, { mutate: true }) as any;
        return turf.rewind(safeModifications, { mutate: true }) as any;
    }

    let result;
    try {
        result = turf.difference(
            turf.featureCollection([safeUnion(mapData), safeModifications]),
        );
    } catch (e) {
        console.error("turf.difference failed, falling back to mapData", e);
        result = mapData;
    }
    if (result) return turf.rewind(result, { mutate: true }) as any;
    return mapData;
};

const DEFAULT_BUFFER_UNIT = "kilometers";

export const arcBuffer = (
    geometry: FeatureCollection,
    distance: number,
    unit: units.LengthUnit & turf.Units = DEFAULT_BUFFER_UNIT,
) => {
    const arcgisGeometry = geometry.features.map((x) =>
        geometryJsonUtils.fromJSON(geojsonToArcGIS(x.geometry)),
    ) as unionTypes.GeometryUnion[];

    return innateArcBuffer(arcgisGeometry, distance, unit);
};

const innateArcBuffer = async (
    arcgisGeometry: unionTypes.GeometryUnion[],
    distance: number,
    unit: units.LengthUnit & turf.Units = DEFAULT_BUFFER_UNIT,
) => {
    await geodesicBufferOperator.load();

    const bufferedGeometry = geodesicBufferOperator.executeMany(
        arcgisGeometry,
        Array(arcgisGeometry.length).fill(distance),
        {
            union: true,
            unit: unit,
            maxDeviation: turf.convertLength(3, "feet", unit),
        },
    );

    return turf.combine(
        turf.featureCollection([
            turf.feature(arcgisToGeoJSON(bufferedGeometry[0] as any)),
        ]) as any,
    ).features[0] as Feature<MultiPolygon>;
};

export const arcBufferToPoint = async (
    geometry: FeatureCollection,
    lat: number,
    lng: number,
) => {
    const point = new Point({
        latitude: lat,
        longitude: lng,
    });

    const arcgisGeometry = geometry.features.map((x) =>
        geometryJsonUtils.fromJSON(geojsonToArcGIS(x.geometry)),
    ) as unionTypes.GeometryUnion[];

    await geodeticDistanceOperator.load();

    const distances = arcgisGeometry.map((x) =>
        geodeticDistanceOperator.execute(x, point, {
            unit: DEFAULT_BUFFER_UNIT,
        }),
    );

    return innateArcBuffer(arcgisGeometry, Math.min(...distances));
};
