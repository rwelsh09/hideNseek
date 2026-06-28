## YYYY-MM-DD - [Refactoring `useMemo` to `useRef`]

**Learning:** `useMemo` is strictly for performance optimizations of computed values and should never be used as a replacement for `useRef` to hold mutable references (e.g., `useMemo(() => ({ current: null }), [])`). Doing so can lead to unexpected bugs since React may clear `useMemo` cache during rendering to free memory.
**Action:** Always utilize `useRef` for maintaining state or mutable values (like Leaflet marker instances or watch IDs) that shouldn't trigger re-renders.

## 2025-06-21 - Extract Component for Stable Object References in React-Leaflet

**Learning:** `react-leaflet` instances like `CircleMarker` internally track object references for `pathOptions` and `eventHandlers`. When inline arrow functions or literal objects are passed in `map` loops, they create new object references on every render, causing slow underlying Leaflet method calls (like layer restyling and rebinding events).
**Action:** Always extract items rendered within loops (like maps returning Leaflet layers) into separate components, and memoize `eventHandlers` or `pathOptions` as static constants or with `useMemo` so their references remain stable across re-renders.

## 2026-06-24 - Remove unused map grouping and routing functions

**Learning:** Periodic codebase auditing using tools like `grep` or IDE references is essential. Complex algorithms (like grouping map objects or calculating line distances) may become orphaned when application architecture evolves, negatively impacting compilation times and theoretical bundle sizes without offering any runtime value.
**Action:** Safely remove unused exported functions to eliminate dead code and keep the codebase clean.

## 2026-06-26 - [Extract Inline Object Arrays in React-Leaflet Props]

**Learning:** Passing inline arrays or objects to `react-leaflet` components (such as `contextmenuItems={[...]}` on `MapContainer`) creates new array references on every single render. This forces React Leaflet and its underlying plugins to re-evaluate or re-bind event listeners, significantly increasing memory allocation overhead and rendering time.
**Action:** Extract inline arrays and large configuration objects into `useMemo` hooks or static constants outside of the render cycle. This provides stable object references, preventing unnecessary Leaflet DOM manipulations.

## 2026-06-28 - [Memoizing Loop Callbacks and Rules of Hooks]

**Learning:** When attempting to memoize props like inline arrays or style objects for items that are rendered inside a `.map()` loop (e.g., inside `LatLngPicker.tsx`), you cannot simply wrap the prop in `React.useMemo` directly within the loop callback. This strictly violates React's Rules of Hooks because hooks must be called at the top level of a component.
**Action:** Always extract the looped item into a separate, dedicated React component. Then, use `React.useMemo` or `React.memo` safely inside that new component, or pass the memoized values down as props from the parent if the values are globally shared.
