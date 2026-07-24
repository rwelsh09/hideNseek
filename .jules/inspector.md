## 2026-07-21 - [Fortified hot-cold.test.ts]

**Learning:** The previous implementation of the test for `adjustPerHotCold` was checking only that the return value from the function was of type `Feature` but entirely ignored area boundary verifications and point verifications. The mutation test revealed that modifying the actual application logic to fetch `voronoi.features[0]` instead of `[1]` passed perfectly without failing the test suite.
**Action:** When fixing test files asserting spatial boundaries and turf modifications, I should verify the bounding box, exact point intersections `turf.booleanPointInPolygon`, and bounds/area constraints instead of loosely matching for type definitions.

## 2026-07-22 - [Tautological Spatial Differences in Turf.js]

**Learning:** When testing geometric difference operations (e.g., subtracting a circle from a larger polygon), checking that a resulting area is less than the original area (`newArea < originalArea`) provides false confidence. An incorrect implementation returning the _intersection_ instead of the difference will also reduce the area, causing the test to falsely pass.
**Action:** When testing geometric subtractions (like `turf.difference` or manual clipping), explicitly verify that a point unique to the subtracted geometry (like the center of a subtracted circle) is _not_ present in the resulting polygon using `turf.booleanPointInPolygon`.

## 2024-05-18 - [Tautological Massive Polygon in Turf.js]

**Learning:** The previous implementation of the test "points near dateline should yield MultiPolygons and trigger massive polygon logic" in `tests/voronoi.test.ts` was not actually triggering the massive polygon logic in `geoSpatialVoronoi`, but the test passed because it only asserted that `MultiPolygon` geometries were returned. Additionally, the "1 point should return 1 polygon" test did trigger the logic, but had no assertions to verify the area reduction logic actually worked.
**Action:** Fortified the "1 point should return 1 polygon" test to assert that the `turf.area` of the returned feature is less than or equal to the area threshold of `255000000000000` to guarantee the massive polygon logic executes and reduces the area successfully.
