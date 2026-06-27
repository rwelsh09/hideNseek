1. **Optimize `react-leaflet` props in `DraggableMarkers.tsx`**:
   - In `ColoredMarker`, memoize the `position` array using `useMemo` so that the reference remains stable across re-renders when the coordinates haven't changed. This prevents `react-leaflet` from unnecessary `setLatLng` calls.
2. **Optimize `react-leaflet` props in `ClosestPlaces.tsx`**:
   - Extract the inline array `[0, -10]` for `Tooltip`'s `offset` into a constant `TOOLTIP_OFFSET`.
   - In `ClosestPlaceMarker`, memoize the `center` array using `useMemo`.
3. **Optimize `react-leaflet` props in `PlaytestPlaces.tsx`**:
   - Extract the inline array `[0, -10]` for `Tooltip`'s `offset` into a constant `TOOLTIP_OFFSET`.
   - Extract the marker into a memoized sub-component `PlaytestPlaceMarker` (using `React.memo`) and memoize its `center` array, which avoids re-rendering the marker unnecessarily.
4. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done**.
5. **Submit the PR** with Bolt format.
