import { describe, expect, it } from "vitest";
import osm2geojson from "@/maps/geo-utils/osm2geojson";

describe("osm2geojson wrapper", () => {
    it("should extract center points for ways and relations", () => {
        const data = {
            "elements": [
                {
                    "type": "way",
                    "id": 2,
                    "center": {
                        "lat": 51.1,
                        "lon": -114.1
                    },
                    "tags": {
                        "amenity": "restaurant"
                    }
                }
            ]
        };

        const result = osm2geojson(data);
        expect(result.features).toHaveLength(1);
        expect(result.features[0].geometry.type).toBe("Point");
        expect(result.features[0].geometry.coordinates).toEqual([-114.1, 51.1]);
    });

    it("should retain valid geometries", () => {
        const data = {
            "elements": [
                {
                    "type": "node",
                    "id": 1,
                    "lat": 51.2,
                    "lon": -114.2,
                    "tags": {
                        "amenity": "cafe"
                    }
                }
            ]
        };

        const result = osm2geojson(data);
        expect(result.features).toHaveLength(1);
        expect(result.features[0].geometry.type).toBe("Point");
        expect(result.features[0].geometry.coordinates).toEqual([-114.2, 51.2]);
    });
});
