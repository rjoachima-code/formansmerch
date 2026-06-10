# TODO - FM611 App Stabilization, SOP Fixes, Camera Enhancements, Zeeky Upgrade

## Approved Scope
- [x] User approved implementation plan.
- [ ] Run full project tests and report results.
- [ ] Analyze full app and implement high-impact fixes/improvements.
- [ ] Fix SOP page associate dropdown selection issue.
- [ ] Improve camera capture feature for walk/training evidence.
- [ ] Normalize naming to FM611 where appropriate.
- [ ] Remove requested sentence/content.
- [ ] Improve Zeeky (He) chatbot behavior and utility.
- [ ] Deliver recommendations to make the app better.

## Work Breakdown

### 1) Stabilize Runtime / Data Sources
- [ ] Add/verify centralized `masterAssociates` array used by dropdown builders.
- [ ] Ensure `populateRosterDropdowns()` targets existing selectors only.
- [ ] Resolve `sync-status` null reference (guard or add element).
- [ ] Correct HTML attribute bug: `htmlFor` -> `for`.

### 2) SOP Associate Dropdown Bug Fix
- [ ] Ensure associate dropdown options are populated on initialization.
- [ ] Ensure dynamic assignment rows default to valid options.
- [ ] Verify SOP training associate selector is selectable and functional.

### 3) Camera Feature Upgrade
- [ ] Keep existing camera capture support for Walk Audit + SOP Training.
- [ ] Add lightweight preview/status metadata persistence.
- [ ] Save image metadata (filename/time/section) to localStorage.
- [ ] Surface attached-photo indicators in relevant logs/details where practical.

### 4) Requested Content Updates
- [ ] Replace/normalize “#611 / m611” references to “FM611” where needed.
- [ ] Remove sentence: “Big Men's department runs must have oversized visual tags to avoid mixing.”
- [ ] Keep Big Men language otherwise consistent and clean.

### 5) Zeeky (He) Chatbot Improvements
- [ ] Keep existing Zeeky tab and persona.
- [ ] Expand intent responses for SOP/training/walk support.
- [ ] Add concise help/quick-guide behavior for common prompts.
- [ ] Keep offline deterministic fallback responses.

### 6) Testing & Validation
- [ ] Run project test scripts from `package.json` (and build/lint if available).
- [ ] Validate no blocking console/runtime errors for key flows.
- [ ] Verify dropdown bug and camera feature behavior after changes.

### 7) Final App Analysis (What can be improved)
- [ ] Provide concise technical improvement report:
  - [ ] Reliability/bug risk
  - [ ] UX and accessibility
  - [ ] Data persistence/backup
  - [ ] Maintainability/refactor opportunities
  - [ ] Performance optimizations
