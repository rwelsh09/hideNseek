## 2026-07-19 - Asserting Geometric Differences in Turf.js
**Learning:** When testing geometric difference operations (e.g., subtracting a circle from a larger polygon), asserting that the resulting area is smaller than the original area provides false confidence. An incorrect implementation returning the *intersection* instead of the difference will also result in a smaller area, causing the test to falsely pass.
**Action:** When testing geometric differences, explicitly verify that a point unique to the subtracted geometry (like the center of a subtracted circle) is *not* present in the resulting polygon using `turf.booleanPointInPolygon`.

## 2026-07-21 - [Fortified hot-cold.test.ts]
**Learning:** The previous implementation of the test for `adjustPerHotCold` was checking only that the return value from the function was of type `Feature` but entirely ignored area boundary verifications and point verifications. The mutation test revealed that modifying the actual application logic to fetch `voronoi.features[0]` instead of `[1]` passed perfectly without failing the test suite.
**Action:** When fixing test files asserting spatial boundaries and turf modifications, I should verify the bounding box, exact point intersections `turf.booleanPointInPolygon`, and bounds/area constraints instead of loosely matching for type definitions.
## 2026-07-22 - Tautological Spatial Differences
**Learning:** Checking that a resulting area is less than the original area (`newArea < originalArea`) after a difference operation provides false confidence, as an intersection operation will also reduce the area.
**Action:** When testing geometric subtractions (like `turf.difference` or manual clipping), explicitly use `turf.booleanPointInPolygon` to assert that a coordinate unique to the subtracted geometry is completely absent from the resulting polygon.
