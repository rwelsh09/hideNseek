## 2024-06-19 - [Leaflet properties caching]

**Learning:** Leaflet Icons and dynamic properties like `eventHandlers` or `pathOptions` instantiated inside a React component's render method will pass a new object reference to the react-leaflet `Marker` or `Polygon` props on every render. This forces React-Leaflet to update the Leaflet icon using `setIcon()` or update handlers and layer styles on the underlying DOM element continuously, which can dramatically hurt performance, especially when there are many markers.
**Action:** Extract the Leaflet `Icon` initialization and configuration objects like `pathOptions` to an external scope cache or use `useMemo()` to guarantee stable references are passed as props to the react-leaflet components.
