import { describe, expect,it } from "vitest";

import { getFeatureProperties } from "@/maps/geo-utils/special";

describe("getFeatureProperties", () => {
    it("should return an empty object for null or undefined input", () => {
        expect(getFeatureProperties(null)).toEqual({});
        expect(getFeatureProperties(undefined)).toEqual({});
    });

    it("should return feature.properties.tags if it exists", () => {
        const feature = {
            properties: {
                tags: {
                    name: "Test Tag",
                    amenity: "cafe"
                }
            }
        };

        expect(getFeatureProperties(feature)).toEqual({
            name: "Test Tag",
            amenity: "cafe"
        });
    });

    it("should merge and flatten properties if feature.properties.properties exists", () => {
        const feature = {
            properties: {
                baseProp: "base",
                properties: {
                    nestedProp: "nested"
                }
            }
        };

        const result = getFeatureProperties(feature);

        expect(result).toEqual({
            baseProp: "base",
            properties: {
                nestedProp: "nested"
            },
            nestedProp: "nested"
        });
    });

    it("should return feature.properties if it exists but tags or nested properties do not", () => {
        const feature = {
            properties: {
                a: 1,
                b: 2
            }
        };

        expect(getFeatureProperties(feature)).toEqual({
            a: 1,
            b: 2
        });
    });

    it("should return the feature itself if feature.properties does not exist", () => {
        const feature = {
            id: 123,
            type: "Feature"
        };

        expect(getFeatureProperties(feature)).toEqual({
            id: 123,
            type: "Feature"
        });
    });
});
