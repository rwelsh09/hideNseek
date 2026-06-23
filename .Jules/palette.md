## 2025-02-27 - Icon-only buttons lacking ARIA labels

**Learning:** Found several native and custom `Button` icon-only buttons without `aria-label`s or semantic `type="button"` attributes. In an accessible UI, screen readers need descriptive text when content is purely visual or uses icons.
**Action:** Always verify icon-only buttons (`<button>`, `<Button>`) include a descriptive `aria-label` (and `aria-expanded` if functioning as a toggle) and ensure native buttons specify `type="button"` to avoid implicit form submission issues and improve accessibility across the app.

## 2026-06-23 - Icon-only buttons lacking ARIA labels

**Learning:** Found several native and custom `Button` icon-only buttons in `LatLngPicker.tsx` without `aria-label`s. While they had `title` attributes, assistive technologies like screen readers rely heavily on `aria-label` for accurate announcements of purely visual controls.
**Action:** Always verify icon-only buttons (`<button>`, `<Button>`) include a descriptive `aria-label` mirroring their visual intent or `title` attribute to ensure proper accessibility for screen readers across the app.

## 2025-06-23 - Warning messages relying on color alone

**Learning:** Discovered a performance warning message in the sidebar component that relied solely on the color class `text-orange-500` to convey its critical 'warning' state. This fails WCAG 1.4.1 Use of Color guidelines, as colorblind users might not distinguish the orange hue from surrounding text, causing them to miss the warning entirely.
**Action:** Always supplement color-coded states (like alerts, warnings, or errors) with redundant visual cues. In this case, an `AlertTriangle` icon was added to ensure the warning meaning is conveyed through shape and icon semantics as well as color.
