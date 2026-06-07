# Accessibility & Compatibility Fix Plan

- [x] Add robust cross-browser scrollbar fallback styles in `index.html` (`::-webkit-scrollbar` support alongside existing rules).
- [x] Add explicit `id` + matching `for` attributes for visible labels where missing.
- [x] Add `aria-label` and `title` attributes to all form controls (`input`, `select`, `textarea`) in Planner, Audit, Dispatcher, and SOP sections.
- [x] Add placeholders to eligible text-capable fields where needed.
- [x] Preserve all existing business logic and data constants exactly (no logic rewrite).
- [x] Validate final HTML structure remains single-file deployable.
