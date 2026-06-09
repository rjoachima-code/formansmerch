# TODO - Redesigned Pad Ownership & Evaluation Grid (Step 3+) Implementation

## Approved Scope
- [ ] Implement all requested Step 3 redesign updates and complete end-to-end.
- [ ] Add chatbot UI/logic scaffold for interactive in-app support.
- [ ] Add automated image description generation flow (Gemini-ready integration scaffold).
- [ ] Prepare commits as milestones once changes are completed.

## Work Breakdown

### 1) Step 3 Ownership / Evaluation Grid
- [ ] Confirm and keep "Clearance Owner" checkbox removed in UI.
- [ ] Remove stale `clearanceOwner` data key from JS draft persistence.
- [ ] Keep / validate sub-area ownership selector per row.
- [ ] Keep / validate performance grade dropdown (10 to 1) per row.
- [ ] Keep / validate manager training notes input per row.
- [ ] Keep / validate associate sign-off pledge card under each assignment row.

### 2) Expanded Training Gap Matrix Persistence
- [ ] Ensure submit payload includes:
  - [ ] `gap-sizing`
  - [ ] `gap-zlining`
  - [ ] `gap-hanger`
  - [ ] `gap-sets`
  - [ ] `gap-speed`
  - [ ] `gap-discipline`
  - [ ] `gap-dock`
  - [ ] `gap-showcase`
- [ ] Ensure draft auto-save includes all 8 gap flags.
- [ ] Ensure draft restore includes all 8 gap flags.
- [ ] Ensure reset clears all 8 gap flags.

### 3) Refactor Dock Safety SOPs (Module 6)
- [ ] Replace old conveyor-track checklist wording in audit schema.
- [ ] Add manual dock door bolting/locking safety standard language.
- [ ] Add mechanical dock plate & leveler bar deployment language.
- [ ] Keep wording aligned with real-world store safety SOP intent.

### 4) Walk Audit Camera Capture
- [ ] Add camera-capture input in Walk Audit section:
  - [ ] `type="file"`
  - [ ] `accept="image/*"`
  - [ ] `capture="environment"`
- [ ] Add lightweight preview + clear control.
- [ ] Add metadata hook into audit payload for captured evidence summary.
- [ ] Keep mobile-friendly UX.

### 5) Print Architecture (PWA-friendly printable operations document)
- [ ] Add `@media print` CSS for clean black-and-white output.
- [ ] Hide interactive-only UI during print (buttons/nav/toasts/modals).
- [ ] Optimize typography/spacing/borders for hardcopy binder output.
- [ ] Add/ensure `print:hidden` on non-print controls where needed.

### 6) Interactive Chatbot (In-App Assistant)
- [ ] Add chatbot launch button and panel UI.
- [ ] Add conversation log rendering with message history in-session.
- [ ] Add contextual quick-help prompts for app tabs/features.
- [ ] Add local FAQ intent routing fallback (offline/basic mode).
- [ ] Add placeholder Gemini API integration method for real responses.
- [ ] Add safe API key usage note (no hardcoded key in client).

### 7) Automated Content Generation for Uploaded Images
- [ ] Reuse camera/file upload to trigger description generation flow.
- [ ] Add "Generate Description" action.
- [ ] Add output field for generated caption/description.
- [ ] Add Gemini-ready request function scaffold (text+image multimodal).
- [ ] Add graceful fallback message when API not configured.

### 8) Validation
- [ ] Sanity-check core flows in browser:
  - [ ] Step 3 row add/remove + data capture.
  - [ ] Training gaps submit/save/restore/reset.
  - [ ] Module 6 revised wording visibility.
  - [ ] Camera capture preview behavior.
  - [ ] Print preview correctness.
  - [ ] Chatbot interaction baseline.
  - [ ] Image description generation fallback/scaffold behavior.

### 9) Git Milestone Commits
- [ ] Commit 1: Step 3 + training gaps + SOP refactor.
- [ ] Commit 2: Camera + print architecture.
- [ ] Commit 3: Chatbot + image description generation.
- [ ] Commit 4: Final polish/validation updates.
