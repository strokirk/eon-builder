# Web QA Checklist

Use this checklist to drive thorough and repeatable investigations.

## Contents

1. Session Setup
2. Functional Correctness
3. Error Handling and Resilience
4. UX and Interaction Quality
5. Cross-Viewport Checks
6. Evidence Capture
7. Exit Criteria

## 1) Session Setup

- Confirm target URL and route scope.
- Confirm test mode/environment assumptions.
- Start at desktop viewport (`1440x900`) unless constrained.
- Capture initial snapshot and baseline console/network state.

## 2) Functional Correctness

Test top user journeys first:

- Critical page loads successfully without blocking failures.
- Navigation paths reach intended destinations.
- Forms:
  - required-field enforcement
  - invalid-format handling
  - successful submission and post-submit state
- State transitions:
  - empty -> loading -> populated
  - error -> retry -> recovery
- Destructive actions require clear confirmation and reflect final state.
- Refresh/revisit preserves or intentionally resets state as expected.

## 3) Error Handling and Resilience

- Check for uncaught exceptions and repeated console errors.
- Review failed requests (4xx/5xx/network) and affected UI behavior.
- Verify user-facing error states:
  - clear cause
  - actionable next step
  - no dead-end workflows
- Validate loading spinners/skeletons are not stuck indefinitely.
- Optionally emulate slower network for race/timing sensitivity.

## 4) UX and Interaction Quality

- Primary actions are visually and semantically clear.
- Click/tap targets are sufficiently sized and not overlapped.
- Feedback appears after actions (busy, success, failure).
- Labels, helper text, and errors are concise and understandable.
- Keyboard flow for critical controls:
  - tab order is logical
  - focus is visible
  - Enter/Escape behavior is sane

## 5) Cross-Viewport Checks

At minimum test:

- Desktop (`1440x900`)
- Tablet-ish (`1024x768`)
- Mobile (`390x844` or similar)

For each:

- No clipped primary content.
- No hidden controls needed for core flows.
- No unintended horizontal scrolling in common states.
- Sticky headers/footers do not block actions.

## 6) Evidence Capture

For each finding, capture:

- Short deterministic repro steps.
- Exact route and viewport.
- Expected vs actual behavior.
- Console/network evidence IDs or excerpts.
- Screenshot path when visual impact exists.
- Severity (`P0`-`P3`) and confidence (`high`, `medium`, `low`).

## 7) Exit Criteria

Investigation is complete when:

- All priority journeys were exercised.
- Console/network anomalies were triaged for user impact.
- UX pass completed for primary flows on at least desktop + mobile.
- Findings list is severity-ranked and reproducible.
- Residual risks or untested areas are explicitly listed.
