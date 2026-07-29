1. **Import `extractStationLines`**:
    - Update imports in `src/components/AdvancedStationManagement.tsx` to include `extractStationLines` from `@/maps/geo-utils`.

2. **Compute available and disabled lines**:
    - Inside `AdvancedStationManagement`, compute `allLines` using `useMemo` by mapping over `stations` and extracting unique lines using `extractStationLines`. Sort them for consistent ordering.
    - Compute `disabledLines` using `useMemo`. A line is considered disabled if all of its stations are disabled (excluding stations that share lines, unless those other lines are also implicitly disabled).
    - Actually, a simpler and more precise approach for computing `disabledLines` based on user requirement:
      "if I choose to disable the red line, if there's a zone that is in the red and the blue then that zone should remain but if I was to choose to disable the red line and the blue line well then that zone that is in the red line and the blue line will then be disabled."
      This means a station is enabled if it has AT LEAST ONE line that is NOT disabled. Therefore, a station is disabled if ALL of its lines ARE disabled.
      So to determine if a line is disabled in the UI, we can check if its *exclusive* stations (stations on ONLY this line) are disabled. If a line has no exclusive stations, we can check if *all* stations on it are disabled. Let's implement the logic exactly as tested in `test_line_logic.cjs`.

3. **Render Line Toggles**:
    - Render a list of buttons/menu items for each line in `allLines` below the "Disable All" button.
    - Give them the same `SidebarMenuItem` styling.
    - If the line is in `disabledLines`, apply `line-through` and `opacity-50` to visually indicate it's disabled.

4. **Implement Toggle Logic**:
    - When a line toggle is clicked, calculate `newDisabledLines` (toggle the clicked line in the `disabledLines` array).
    - Then iterate through all `stations`.
    - If a station has no lines, skip it.
    - For each station, evaluate: `shouldBeDisabled = stationLines.every(l => newDisabledLines.includes(l))`.
    - Only update the station's disabled status in a `newDisabledStationsSet` if `stationLines.includes(toggledLine)` (this ensures we don't accidentally enable/disable stations that have nothing to do with the toggled line).
    - Finally, update the `$disabledStations` store with the result.

5. **Pre-commit**: Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
6. **Submit**:
    - Title: ✂️ Feature: Add options to disable hiding zones by transit line.
    - Description: What: Added toggles for each transit line in Advanced Station Management. Why: To allow users to easily disable/enable entire transit lines. Impact: Users can now manage hiding zones more efficiently at the line level, with proper logic for stations that belong to multiple lines.
