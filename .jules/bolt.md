## 2026-06-18 - [Refactoring `useMemo` to `useRef`]

**Learning:** `useMemo` is strictly for performance optimizations of computed values and should never be used as a replacement for `useRef` to hold mutable references (e.g., `useMemo(() => ({ current: null }), [])`). Doing so can lead to unexpected bugs since React may clear `useMemo` cache during rendering to free memory.
**Action:** Always utilize `useRef` for maintaining state or mutable values (like Leaflet marker instances or watch IDs) that shouldn't trigger re-renders.

## 2026-06-24 - [Remove unused map grouping and routing functions]

**Learning:** Periodic codebase auditing using tools like `grep` or IDE references is essential. Complex algorithms (like grouping map objects or calculating line distances) may become orphaned when application architecture evolves, negatively impacting compilation times and theoretical bundle sizes without offering any runtime value.
**Action:** Safely remove unused exported functions to eliminate dead code and keep the codebase clean.

## 2026-06-18 - [React-Leaflet Object & Array Prop Memoization]

**Learning:** In React-Leaflet, passing inline array references (like `center={[lat, lng]}`) or inline objects/arrow functions to child components (e.g., `Marker`, `CircleMarker`, `MapContainer` context menus) causes the underlying Leaflet instance to trigger expensive updates on every React render because React-Leaflet checks object equality for references. This forces re-evaluation or re-binding of event listeners and slow restyling. However, the `MapContainer` component explicitly ignores changes to its `center` prop after the initial render, so memoizing the `center` array for `MapContainer` provides zero performance benefit and just adds clutter.
**Action:** Always memoize inline arrays and object literals (e.g., `position`, `center`, `pathOptions`, `eventHandlers`) passed to React-Leaflet child components that react to prop changes to prevent unnecessary DOM updates. Extract items rendered within loops into separate components. Avoid applying this optimization to properties of `MapContainer` that are documented as immutable after initialization (like `center`).

## 2026-06-18 - [Fix stuck Loading indicators during asynchronous Map operations]

**Learning:** React component functions executing long asynchronous operations (like `refreshQuestions`) can cause two critical state bugs if not handled carefully: 1) Early failure in setup promises will cause subsequent `isLoading.set(false)` inside `catch` or `finally` blocks to be skipped if they are missing a wider `try...finally` block; 2) Using reactive hook variables (like `$questions` or `$isLoading`) directly inside asynchronous scopes leads to stale closures and race conditions.
**Action:** Always wrap the entirety of asynchronous execution logic within an encompassing `try...finally` block to guarantee state cleanup (e.g., reverting `isLoading`). Read reactive store data explicitly using `.get()` (like `questions.get()`) to fetch fresh values after await boundaries. Utilize `useRef` for concurrency locks and implement request queuing to prevent dropped updates.

## 2026-06-04 - [Dynamic Import for Large JSON Assets]

**Learning:** The application was bundling a ~521KB JSON file (`calgary_transit_lines_clean.json`) into the main chunk (previously `Map.tsx`) even though it's only displayed when a user toggles an option (`$displayTransitLines`). Even if it's on by default, dynamic importing moves the ~500KB JSON file out of the critical rendering path for the main component, allowing the map to render sooner while the transit line data loads in the background!
**Action:** Use dynamic `import()` for large JSON datasets that aren't critical to the initial render. By moving the import inside a `useEffect` that triggers when the feature is enabled, we saved ~270KB on the initial bundle size by extracting it into `TransitLinesOverlay.tsx` and dynamically importing it!

## 2026-07-16 - [Math.random() usage]

**Learning:** `Math.random()` is used throughout the codebase for non-cryptographic purposes such as generating random temporary numerical IDs (`key`), UI cache breaking, and styling (e.g., color selection, random widths).
**Action:** Do not replace `Math.random()` with `crypto.randomUUID()` or similar secure alternatives. Doing so would introduce string-based IDs which break existing Zod validation schemas that strictly type `key` as a `number`.
## 2026-07-19 - [Pool concurrent dynamic imports for offline places]
**Learning:** When dynamically importing large local JSON datasets (like `offline_places.json`), if `import()` is called concurrently multiple times before the first import completes, it can cause memory spikes and redundant processing.
**Action:** Use a module-level Promise variable to pool concurrent requests and prevent redundant reads. Always include a `.catch()` block to reset this promise to `null` on failure, allowing subsequent calls to retry and avoiding permanent cache locking on transient errors.

## 2026-07-20 - [Optimize useEffect triggers for nanostores]

**Learning:** Passing a full reactive store object (like `$questions`) to a `useEffect` dependency array can trigger excessive and expensive side-effects (e.g., redundant API requests or map data processing) during rapid state changes like dragging a map marker.
**Action:** Use `useMemo` to extract a stable primitive representation of the exact required state (like a stringified hash of active types) and use that hash as the `useEffect` dependency. This ensures the expensive effect only runs when the strictly necessary data requirements actually change.
## 2026-07-21 - [Optimize useEffect triggers using locked state hash]
**Learning:** Extracting complex nanostore state (like $questions) via `JSON.stringify($questions.filter(q => q.data.locked))` instead of `JSON.stringify($questions)` significantly optimizes map component rendering when only locked questions affect rendering state. This reduces heavy operations on map marker dragging.
**Action:** When filtering objects for useMemo hashes in React component dependencies, apply precise property filters that represent the necessary trigger conditions rather than just stringifying the whole store.
