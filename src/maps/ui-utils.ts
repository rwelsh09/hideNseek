import * as L from "leaflet";

export const flyToWithOffset = (
    map: L.Map,
    latlng: L.LatLng,
    zoom: number,
    offset: [number, number] = [0, 100],
) => {
    const targetPoint = map.project(latlng, zoom);

    const isDialogVisible = document.querySelector('[role="dialog"]') !== null;
    const appliedOffset = isDialogVisible ? offset : [0, 0];

    targetPoint.x += appliedOffset[0];
    targetPoint.y += appliedOffset[1];

    const offsetLatLng = map.unproject(targetPoint, zoom);
    map.flyTo(offsetLatLng, zoom);
};
