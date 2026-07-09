import _osm2geojson from "osm2geojson-lite";

// Wrapper function to fix missing points for ways/relations with 'center' coordinates in Overpass JSON
// osm2geojson-lite drops Point features for ways/relations that lack geometry nodes but contain a center.
export default function osm2geojson(data: any): any {
    if (!data || !data.elements) return _osm2geojson(data);

    // Create a new elements array to not mutate the original data
    const preprocessedElements = [...data.elements];

    for (const el of data.elements) {
        if ((el.type === 'way' || el.type === 'relation') && el.center && typeof el.center.lat === 'number' && typeof el.center.lon === 'number') {
            // Synthesize a Point node using the center
            preprocessedElements.push({
                type: "node",
                id: `_center_${el.type}_${el.id}`,
                lat: el.center.lat,
                lon: el.center.lon,
                tags: el.tags || {},
            });
        }
    }

    return _osm2geojson({ ...data, elements: preprocessedElements });
}
