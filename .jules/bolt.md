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

## $(date +%Y-%m-%d) - [React-Leaflet Array Prop Memoization]

**Learning:** In React-Leaflet, passing inline array references (like `center={[lat, lng]}`) to child components (e.g., `Marker`, `CircleMarker`) causes the underlying Leaflet instance to trigger expensive `setLatLng` updates on every React render because React-Leaflet checks object equality for array references. However, the `MapContainer` component explicitly ignores changes to its `center` prop after the initial render, so memoizing the `center` array for `MapContainer` provides zero performance benefit and just adds clutter.
**Action:** Always memoize inline arrays and object literals (e.g., `position`, `center`, `pathOptions`) passed to React-Leaflet child components that react to prop changes to prevent unnecessary DOM updates. Avoid applying this optimization to properties of `MapContainer` that are documented as immutable after initialization (like `center`).

## 2025-02-18 - Fix stuck Loading indicators during asynchronous Map operations

**Learning:** React component functions executing long asynchronous operations (like `refreshQuestions`) can cause two critical state bugs if not handled carefully: 1) Early failure in setup promises will cause subsequent `isLoading.set(false)` inside `catch` or `finally` blocks to be skipped if they are missing a wider `try...finally` block; 2) Using reactive hook variables (like `$questions` or `$isLoading`) directly inside asynchronous scopes leads to stale closures and race conditions. Furthermore, missing timeout configurations for native APIs (like `navigator.geolocation`) can hang forever without triggering callbacks.
**Action:** Always wrap the entirety of asynchronous execution logic within an encompassing `try...finally` block to guarantee state cleanup (e.g., reverting `isLoading`). Read reactive store data explicitly using `.get()` (like `questions.get()`) to fetch fresh values after await boundaries. Utilize `useRef` for concurrency locks and implement request queuing to prevent dropped updates. Always set timeouts on `getCurrentPosition`.

## 2024-07-04 - Dynamic Import for Large JSON Assets

**Learning:** The application was bundling a ~521KB JSON file (`calgary_transit_lines_clean.json`) into the main `Map.tsx` chunk even though it's only displayed when a user toggles an option (`$displayTransitLines`). Even if it's on by default, dynamic importing moves the ~500KB JSON file out of the critical rendering path for the main component, allowing the map to render sooner while the transit line data loads in the background!
**Action:** Use dynamic `import()` for large JSON datasets that aren't critical to the initial render. By moving the import inside a `useEffect` that triggers when the feature is enabled, we saved ~270KB on the initial bundle size for the Map component!

## 2024-05-18 - Replacing `turf.distance` with `fastDistance` in tight loops
**Learning:** `turf.distance` is highly unoptimized for heavy loops over large spatial datasets (e.g. evaluating distances against all OpenStreetMap nodes). It includes deep validations, feature creations, and object cloning that can easily freeze the main UI thread when iterated thousands of times per interaction.
**Action:** Always prefer the math-only trigonometric `fastDistance` utility function when processing N-body queries or massive data lists to save vast amounts of execution time.
