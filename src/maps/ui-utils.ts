import * as L from "leaflet";

/**
 * Pans the map to a target LatLng with a pixel offset, adjusting the focal point
 * so it isn't centered perfectly, allowing UI overlays (like bottom dialogs)
 * to avoid obscuring the target coordinate.
 *
 * @param map Leaflet map instance
 * @param latlng Target coordinate to focus on
 * @param zoom Zoom level for the projection
 * @param offset Pixel offset [x, y], defaults to shifting the point UP by 200px (so map pans DOWN)
 */
export const flyToWithOffset = (
    map: L.Map,
    latlng: L.LatLng,
    zoom: number,
    offset: [number, number] = [0, 200],
) => {
    // Project the target coordinate to a pixel point at the given zoom
    const targetPoint = map.project(latlng, zoom);

    // Add offset. In Leaflet's projected coordinate system, Y increases downwards.
    // Adding to Y shifts the computed center SOUTH, which visually pushes the
    // original target point UP on the screen.
    targetPoint.x += offset[0];
    targetPoint.y += offset[1];

    // Unproject back to coordinates and fly to it
    const offsetLatLng = map.unproject(targetPoint, zoom);
    map.flyTo(offsetLatLng, zoom);
};
