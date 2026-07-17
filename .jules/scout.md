## 2026-06-15 - Turf Circle Geometry Nesting
**Learning:** Turf.js `circle` features (e.g., `StationCircle`) generated from point features (e.g., `StationPlace`) store the original Point feature as their `properties` object. This creates a nested GeoJSON feature structure (`circleFeature.properties` is a complete GeoJSON `Point`).
**Action:** When extracting coordinates or properties from a feature that might be a circle (like map stations), always use `getFeatureCoords(feature) || getFeatureCoords(feature.properties)` or `getFeatureProperties` to avoid accessing the polygon geometry coordinates (which are triple-nested arrays) when a `[longitude, latitude]` tuple is expected, as this will lead to `NaN` text parsing or unhandled type errors.

