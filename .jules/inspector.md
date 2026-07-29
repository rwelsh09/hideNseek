## 2026-07-21 - [Fortified hot-cold.test.ts]

**Learning:** The previous implementation of the test for `adjustPerHotCold` was checking only that the return value from the function was of type `Feature` but entirely ignored area boundary verifications and point verifications. The mutation test revealed that modifying the actual application logic to fetch `voronoi.features[0]` instead of `[1]` passed perfectly without failing the test suite.
**Action:** When fixing test files asserting spatial boundaries and turf modifications, I should verify the bounding box, exact point intersections `turf.booleanPointInPolygon`, and bounds/area constraints instead of loosely matching for type definitions.

## 2026-07-22 - [Tautological Spatial Differences in Turf.js]

**Learning:** When testing geometric difference operations (e.g., subtracting a circle from a larger polygon), checking that a resulting area is less than the original area (`newArea < originalArea`) provides false confidence. An incorrect implementation returning the _intersection_ instead of the difference will also reduce the area, causing the test to falsely pass.
**Action:** When testing geometric subtractions (like `turf.difference` or manual clipping), explicitly verify that a point unique to the subtracted geometry (like the center of a subtracted circle) is _not_ present in the resulting polygon using `turf.booleanPointInPolygon`.

## 2026-07-28 - [Tautological Massive Polygon in Turf.js]

**Learning:** The previous implementation of the test "points near dateline should yield MultiPolygons and trigger massive polygon logic" in `tests/voronoi.test.ts` was not actually triggering the massive polygon logic in `geoSpatialVoronoi`, but the test passed because it only asserted that `MultiPolygon` geometries were returned. Additionally, the "1 point should return 1 polygon" test did trigger the logic, but had no assertions to verify the area reduction logic actually worked.
**Action:** Fortified the "1 point should return 1 polygon" test to assert that the `turf.area` of the returned feature is less than or equal to the area threshold of `255000000000000` to guarantee the massive polygon logic executes and reduces the area successfully.

## 2026-07-28 - [Weak Geographic Bounds Assertions]

**Learning:** Some geospatial tests evaluate massive geometries (like a 1-point voronoi covering the earth) using absolute area comparisons with enormous integer thresholds (`turf.area(feature) <= 255000000000000`). These are brittle, hard to read, and can easily mask regressions where the function returns `0` or an unrelated shape.
**Action:** Replace arbitrary area thresholds for global/massive shapes with bounding box assertions (`turf.bbox`) that assert the geometry actually spans the expected coordinates (e.g., `[-180, -90, 180, 90]`).

## 2026-07-28 - [Exposing Reference-Sharing Flaws in Nanostores Persistent Mocks]
**Learning:** When mocking `@nanostores/persistent` in Vitest to avoid writing to actual storage while preserving serialization checks, returning or internalizing the exact memory reference of the mutated object completely invalidates the test. It causes the test to pass even if the decoding logic is fundamentally broken, providing false confidence.
**Action:** Always intercept the payload inside the mocked `set()` function, reassign `val = options.decode(options.encode(val))` to actually capture the transformation pipeline, and deeply clone the result (e.g., `JSON.parse(JSON.stringify(val))`) before committing it to the dummy store to simulate the natural boundaries of `localStorage`.
