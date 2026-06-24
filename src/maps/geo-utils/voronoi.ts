import * as turf from "@turf/turf";
import { geoMercator } from "d3-geo";
// @ts-expect-error No type declaration
import { geoProject, geoStitch } from "d3-geo-projection";
// @ts-expect-error No type declaration
import { geoVoronoi } from "d3-geo-voronoi";
import type { FeatureCollection, MultiPolygon, Point, Polygon } from "geojson";

const scaleReference = turf.toMercator(turf.point([180, 90])); // I thought this would yield the same as turf.earthRadius * Math.pi, but it's slightly larger

export const geoSpatialVoronoi = (
    points: FeatureCollection<Point>,
): FeatureCollection<Polygon | MultiPolygon> => {
    const voronoi = geoVoronoi()(points).polygons();
    const projected = geoProject(
        geoStitch(voronoi),
        geoMercator().translate([0, 0]).precision(0.005),
    );

    const ratio = scaleReference.geometry.coordinates[0] / 480.5; // 961 is the default scale for some reason

    turf.coordEach(projected, (coord) => {
        coord[0] = coord[0] * ratio;
        coord[1] = coord[1] * -ratio; // y-coordinates are flipped
    });

    const wgs84 = turf.toWgs84(projected) as FeatureCollection<
        Polygon | MultiPolygon
    >;

    wgs84.features.forEach((feature) => {
        if (feature.geometry.type === "Polygon") {
            feature.geometry.coordinates.forEach((ring) => ring.reverse());
        } else if (feature.geometry.type === "MultiPolygon") {
            feature.geometry.coordinates.forEach((polygon) => {
                polygon.forEach((ring) => ring.reverse());
            });
        }
    });

    wgs84.features = wgs84.features.map((feature) => {
        if (turf.area(feature) > 255000000000000) {
            const whole_world = turf.polygon([
                [
                    [-180, 90],
                    [180, 90],
                    [180, -90],
                    [-180, -90],
                    [-180, 90],
                ],
            ]);
            const diff = turf.difference(
                turf.featureCollection([whole_world, feature]),
            );
            if (diff) {
                diff.properties = feature.properties;
                return diff as typeof feature;
            }
        }
        return feature;
    });

    return wgs84;
};
