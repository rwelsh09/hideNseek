import { describe, expect, it } from "vitest";
import osm2geojson from "@/maps/geo-utils/osm2geojson";
import { getFeatureCoords } from "@/maps/geo-utils/index";

describe("golf course prod", () => {
    it("should return valid coordinates for way with geom", () => {
        const rawData = {
          elements: [
            {
              "type": "way",
              "id": 269785002,
              "bounds": {
                "minlat": 51.0558457,
                "minlon": -114.1522222,
                "maxlat": 51.0660421,
                "maxlon": -114.1360155
              },
              "nodes": [],
              "geometry": [
                {"lat":51.0558457,"lon":-114.1522222},
                {"lat":51.0660421,"lon":-114.1360155},
                {"lat":51.0558457,"lon":-114.1522222}
              ],
              "tags": {
                "leisure": "golf_course",
                "name": "Shaganappi Point Golf Course"
              }
            }
          ]
        };

        const result = osm2geojson(rawData);
        const feature = result.features[0];
        const coords = getFeatureCoords(feature);
        expect(coords).toBeDefined();
        expect(coords![0]).toBeCloseTo(-114.14411885);
        expect(coords![1]).toBeCloseTo(51.0609439);
    });
});
