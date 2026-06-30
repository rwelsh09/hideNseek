import "leaflet-easyprint";

import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Add a generic type definition for easyPrint if it's missing from DefinitelyTyped
declare module "leaflet" {
    function easyPrint(options?: any): any;
}

export const MapPrint = (props: any) => {
    const map = useMap();

    useEffect(() => {
        const control = L.easyPrint({
            ...props,
        });
        map.addControl(control);
        return () => {
            map.removeControl(control);
        };
    }, [map, props]);

    return null;
};
