## 2024-06-19 - [Leaflet Icon caching]
**Learning:** Leaflet Icons instantiated inside a React component's render method will pass a new object reference to the react-leaflet `Marker` icon prop on every render. This forces React-Leaflet to update the Leaflet icon using `setIcon()` on the underlying DOM element continuously, which can dramatically hurt performance, especially when there are many markers.
**Action:** Extract the Leaflet `Icon` initialization to an external scope cache or use `useMemo()` to guarantee stable references are passed as props to the react-leaflet `Marker`.
