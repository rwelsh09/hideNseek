## 2026-06-25 - [Testing Context Mocks]
**Learning:** In this project, `context.ts` uses nanostores. To cleanly mock global state such as `hiderMode` or `mapGeoJSON`, we can mock the entire `src/lib/context` module using `vi.mock()` and explicitly define the `.get()` methods rather than relying on actual nanostore implementations in unit tests, ensuring robust isolated testing for geospatial rules.
**Action:** Always use `vi.mock('../src/lib/context', () => ({ storeName: { get: vi.fn() } }))` for state dependencies inside non-UI logic testing.

## 2026-06-25 - [ArcGIS Geometry in Testing]
**Learning:** `arcBufferToPoint` heavily relies on `@arcgis/core` which creates significant overhead/issues in a pure JS test environment due to its complex inner structures. We can test the wrapping business logic by safely mocking `arcBufferToPoint` to return raw GeoJSON standard polygons directly.
**Action:** When testing spatial utility consumers, aggressively mock geospatial transformers (`src/maps/geo-utils/operators`) that depend on arcgis logic to return deterministic GeoJSON fixtures.
