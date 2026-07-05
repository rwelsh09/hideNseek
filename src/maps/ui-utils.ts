import * as L from "leaflet";

export const flyToWithOffset = (
    map: L.Map,
    latlng: L.LatLng,
    zoom: number,
    offset: [number, number] = [0, 150],
) => {
    const targetPoint = map.project(latlng, zoom);

    targetPoint.x += offset[0];
    targetPoint.y += offset[1];

    const offsetLatLng = map.unproject(targetPoint, zoom);
    map.flyTo(offsetLatLng, zoom);
};
