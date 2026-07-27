## 2025-02-09 - [Mobile Tactile Feedback]
**Learning:** Hover states don't work reliably on touchscreens, which can lead to users wondering if their tap registered, especially when moving or outdoors. Standard HTML buttons and even Shadcn UI buttons lack active press states by default.
**Action:** Always add `active:scale-95` (or similar active transform) alongside `transition-all` to buttons and other highly interactive elements to provide immediate, tactile visual feedback that mimics native mobile applications.
