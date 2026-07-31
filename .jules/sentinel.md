## 2026-07-17 - [Testing Context Mocks]

**Learning:** In this project, `context.ts` uses nanostores. To cleanly mock global state such as `hiderMode` or `mapGeoJSON`, we can mock the entire `src/lib/context` module using `vi.mock()` and explicitly define the `.get()` methods rather than relying on actual nanostore implementations in unit tests, ensuring robust isolated testing for geospatial rules.
**Action:** Always use `vi.mock('../src/lib/context', () => ({ storeName: { get: vi.fn() } }))` for state dependencies inside non-UI logic testing.

## 2026-07-18 - [ArcGIS Geometry in Testing]

**Learning:** `arcBufferToPoint` heavily relies on `@arcgis/core` which creates significant overhead/issues in a pure JS test environment due to its complex inner structures. We can test the wrapping business logic by safely mocking `arcBufferToPoint` to return raw GeoJSON standard polygons directly.
**Action:** When testing spatial utility consumers, aggressively mock geospatial transformers (`src/maps/geo-utils/operators`) that depend on arcgis logic to return deterministic GeoJSON fixtures.

## 2026-07-20 - [Testing GeoJSON Measure Bounds]

**Learning:** In the `src/maps/questions/measure.ts` question logic, `findPlacesInZone` returns raw OSM elements, not standard Turf Features. The helper `determineMeasureBoundary` internally converts these into points and merges them into a `MultiPoint` geometry using `turf.combine`. Consequently, when writing tests for `calculateMeasureDistance`, the mock for `findPlacesInZone` must return raw OSM objects (e.g., `{ center: { lat: 51, lon: -114 } }` or `{ lat: 51, lon: -114 }`), as providing pre-formatted GeoJSON features will result in parsing errors down the line.
**Action:** When mocking `findPlacesInZone` for non-station Measure questions, supply an array of raw OSM node objects, never Turf features.

## 2026-07-22 - [Testing nanostores atom setter and DOM window matching]

**Learning:** Testing nanostores `atom` logic with custom setters using timeouts requires explicitly flushing fake timers `vi.runAllTimers()` and stepping through with `vi.advanceTimersByTime()`. Testing `matchMedia` requires a manual mock of `window.matchMedia` maintaining an internal list of listeners to manually call when triggering simulated DOM resize events.
**Action:** Reuse this `mockMatchMedia` pattern when testing other responsive hooks. Use `vi.useFakeTimers()` systematically for any state variables applying throttling/debouncing.

## 2026-07-23 - [Leaflet Testing in Vitest]

**Learning:** Leaflet requires `window` to be defined to load without crashing, even if we are only using its math functions like `L.point` or `L.latLng`.
**Action:** Add `// @vitest-environment jsdom` to the top of any test file importing `leaflet`.

## 2026-07-29 - [Zod Testing Gotchas]

**Learning:** `z.ZodEffects` is an interface/type in newer versions of Zod, not a runtime class, making `instanceof z.ZodEffects` fail with a `TypeError`. However, modifying the source code to fix this is forbidden when assigned to purely test a component as "Sentinel". Any runtime checks like that in the source must be left alone.
**Action:** Only write tests for how the component actually behaves currently, and ensure to never patch or fix bugs in the source files during a strict Sentinel testing task unless explicitly authorized.

## 2026-07-30 - [Strict Assertions for Sentinel]

**Learning:** Sentinel's philosophy ("If a test doesn't fail when the underlying business logic is broken, it is a useless test") mandates strict assertions. Using weak assertions like `expect(result.same).toBeDefined()` for boolean logic allows tests to pass even if the function erroneously returns the opposite value (e.g. `false` instead of `true`), rendering the test tautological and useless.
**Action:** When testing boolean conditions or specific state outputs, always assert the exact expected value (e.g., `expect(result.same).toBe(true)`) based on the arranged mock data. Never use `.toBeDefined()` for core business logic validation.

## 2026-07-30 - [Mocking Context State Safely]

**Learning:** When mocking `@/lib/context` to manipulate state like `hiderMode` or `mapGeoJSON`, completely overwriting the module using `vi.mock("@/lib/context", () => ({...}))` can break tests if the SUT relies on other unmocked exports from that file.
**Action:** Always use the `importActual` pattern (e.g., `vi.mock("@/lib/context", async (importOriginal) => { const actual = await importOriginal(); return { ...actual, mockTarget: ... }; })`) when mocking context state to preserve unmocked dependencies.
