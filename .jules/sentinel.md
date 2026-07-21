## 2026-06-25 - [Testing Context Mocks]
**Learning:** In this project, `context.ts` uses nanostores. To cleanly mock global state such as `hiderMode` or `mapGeoJSON`, we can mock the entire `src/lib/context` module using `vi.mock()` and explicitly define the `.get()` methods rather than relying on actual nanostore implementations in unit tests, ensuring robust isolated testing for geospatial rules.
**Action:** Always use `vi.mock('../src/lib/context', () => ({ storeName: { get: vi.fn() } }))` for state dependencies inside non-UI logic testing.

## 2026-06-25 - [ArcGIS Geometry in Testing]
**Learning:** `arcBufferToPoint` heavily relies on `@arcgis/core` which creates significant overhead/issues in a pure JS test environment due to its complex inner structures. We can test the wrapping business logic by safely mocking `arcBufferToPoint` to return raw GeoJSON standard polygons directly.
**Action:** When testing spatial utility consumers, aggressively mock geospatial transformers (`src/maps/geo-utils/operators`) that depend on arcgis logic to return deterministic GeoJSON fixtures.
## 2026-06-25 - [Testing GeoJSON Measure Bounds]
**Learning:** In the  question logic,  returns raw OSM elements, not standard Turf Features. The helper  internally converts these into points and merges them into a  geometry using . Consequently, when writing tests for , the mock for  must return raw OSM objects (e.g.,  or ), as providing pre-formatted GeoJSON features will result in parsing errors down the line.
**Action:** When mocking  for non-station Measure questions, supply an array of raw OSM node objects, never Turf features.
## 2026-06-25 - [Testing GeoJSON Measure Bounds]
**Learning:** In the `measure.ts` question logic, `findPlacesInZone` returns raw OSM elements, not standard Turf Features. The helper `determineMeasureBoundary` internally converts these into points and merges them into a `MultiPoint` geometry using `turf.combine`. Consequently, when writing tests for `calculateMeasureDistance`, the mock for `findPlacesInZone` must return raw OSM objects (e.g., `{ center: { lat: 51, lon: -114 } }` or `{ lat: 51, lon: -114 }`), as providing pre-formatted GeoJSON features will result in parsing errors down the line.
**Action:** When mocking `findPlacesInZone` for non-station Measure questions, supply an array of raw OSM node objects, never Turf features.
## 2026-06-25 - [Git Merge Diff Tool]
**Learning:** When applying code edits using search/replace conflict markers (`<<<<<<< SEARCH`, `=======`, `>>>>>>> REPLACE`), use the agent`s internal `replace_with_git_merge_diff` tool directly. Do not output this syntax into a temporary `.diff` file and run the bash `patch` utility, as bash `patch` only accepts standard unified diffs and will fail with a "garbage was found" error.
**Action:** Use `replace_with_git_merge_diff` for all search/replace file edits instead of creating patch files.
