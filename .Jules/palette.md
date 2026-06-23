## 2025-02-27 - Icon-only buttons lacking ARIA labels

**Learning:** Found several native and custom `Button` icon-only buttons without `aria-label`s or semantic `type="button"` attributes. In an accessible UI, screen readers need descriptive text when content is purely visual or uses icons.
**Action:** Always verify icon-only buttons (`<button>`, `<Button>`) include a descriptive `aria-label` (and `aria-expanded` if functioning as a toggle) and ensure native buttons specify `type="button"` to avoid implicit form submission issues and improve accessibility across the app.

## 2026-06-23 - Icon-only buttons lacking ARIA labels

**Learning:** Found several native and custom `Button` icon-only buttons in `LatLngPicker.tsx` without `aria-label`s. While they had `title` attributes, assistive technologies like screen readers rely heavily on `aria-label` for accurate announcements of purely visual controls.
**Action:** Always verify icon-only buttons (`<button>`, `<Button>`) include a descriptive `aria-label` mirroring their visual intent or `title` attribute to ensure proper accessibility for screen readers across the app.
