1. **Add `populateCache` to `src/maps/api/cache.ts`**:
   - Creates a helper function to manually write JSON objects into the cache as `Response` objects.

2. **Extract query building in `src/maps/api/overpass.ts`**:
   - Refactor `findPlacesInZone` by extracting the query generation logic into a new `buildOverpassQueryForZone` function.
   - Create a new `buildBatchedOverpassQueryForZone` function that accepts an array of filters and returns a combined Overpass query string.

3. **Update `cacheAllPlaces` in `src/maps/api/overpass.ts`**:
   - Define a helper function `matchesFilter` to evaluate whether an Overpass element's tags match a specific filter query.
   - Collect all filters for `LOCATION_FIRST_TAG` and `QuestionSpecificLocation`.
   - Use `buildBatchedOverpassQueryForZone` to generate one single query for all these filters.
   - Execute the batched query using `getOverpassData`.
   - Iterate over each filter, filter the results based on tags, generate the specific single query, and use `populateCache` to store the subset in the browser cache.
   - Handle the single `admin_level=10` request separately since it uses a different `out geom` output type.
   - Update toast notification text to reflect the batched requests (e.g., "Caching places (Batched Request 1/2)...").

4. **Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.**
