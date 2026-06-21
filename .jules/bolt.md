## YYYY-MM-DD - [Refactoring `useMemo` to `useRef`]

**Learning:** `useMemo` is strictly for performance optimizations of computed values and should never be used as a replacement for `useRef` to hold mutable references (e.g., `useMemo(() => ({ current: null }), [])`). Doing so can lead to unexpected bugs since React may clear `useMemo` cache during rendering to free memory.
**Action:** Always utilize `useRef` for maintaining state or mutable values (like Leaflet marker instances or watch IDs) that shouldn't trigger re-renders.
## 2025-06-21 - Extract Component for Stable Object References in React-Leaflet
**Learning:** `react-leaflet` instances like `CircleMarker` internally track object references for `pathOptions` and `eventHandlers`. When inline arrow functions or literal objects are passed in `map` loops, they create new object references on every render, causing slow underlying Leaflet method calls (like layer restyling and rebinding events).
**Action:** Always extract items rendered within loops (like maps returning Leaflet layers) into separate components, and memoize `eventHandlers` or `pathOptions` as static constants or with `useMemo` so their references remain stable across re-renders.
