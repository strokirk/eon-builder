---
name: web-qa-devtools
description: Comprehensive browser QA investigation for web apps using Chrome DevTools MCP. Use when asked to find bugs, validate functional correctness, verify edge cases, analyze console/network/runtime failures, or assess UX issues with reproducible evidence and severity-ranked findings.
---

# Web QA DevTools

## Overview

Run a structured QA investigation of a web app with Chrome DevTools MCP. Prioritize reproducibility, user impact, and evidence quality.

## Inputs to Confirm

Collect before testing:

- Target URL or route list.
- Build/runtime mode to test (local, staging, production-like).
- Primary user journeys to prioritize.
- Browser/device constraints (desktop/mobile, viewport sizes).
- Any known risk areas or recent changes.

If inputs are missing, make explicit assumptions and continue.

## Workflow

### 1. Establish Baseline

- Open page and wait for stable content.
- Capture initial snapshot.
- Record viewport, user agent (if changed), and environment assumptions.
- Check console and network immediately for load-time failures.

### 2. Run Core Correctness Pass

Validate expected behavior for the highest-value flows first:

- Navigation and routing behavior.
- Form input, validation, and submission behavior.
- State transitions after interactions (success, empty, error states).
- Data rendering integrity and consistency.
- Recovery behavior after transient failures or refresh.

For each potential defect, verify at least once with a clean repeat.

### 3. Run Reliability and Failure Pass

- Inspect console errors/warnings and identify user-visible impact.
- Inspect failed/slow network requests and response details.
- Test with degraded conditions (slow network, smaller viewport) when relevant.
- Validate loading indicators, retries, and failure messaging.

### 4. Run UX Pass

Evaluate usability and clarity, not only visual polish:

- Discoverability of primary actions.
- Feedback timing and status visibility after user actions.
- Error message clarity and recovery guidance.
- Layout integrity at mobile and desktop breakpoints.
- Keyboard/focus flow for critical interactions.

### 5. Triaging and Reporting

Assign severity by user impact and reach:

- `P0`: blocks core task, data loss/corruption risk, crash-level behavior.
- `P1`: major feature broken, high-friction workflow failure.
- `P2`: moderate degradation with workaround.
- `P3`: minor issue, polish, or low-impact inconsistency.

Do not report speculative issues without evidence.

## Evidence Standard

For every confirmed finding, include:

- Reproduction steps (short, deterministic).
- Actual behavior and expected behavior.
- Evidence source:
  - console message details
  - network request/response details
  - DOM/snapshot observation
  - screenshot path when visual proof matters
- Environment context (URL/route, viewport, emulation if used).
- Severity (`P0`-`P3`) and rationale.

## Tooling Guidance (Chrome DevTools MCP)

Use the minimal tool set needed per issue:

- Navigation/interactions: `navigate_page`, `take_snapshot`, `click`, `fill`, `press_key`, `wait_for`.
- Rendering checks: `resize_page`, `emulate`, `take_screenshot`.
- Runtime diagnostics: `list_console_messages`, `get_console_message`.
- Request diagnostics: `list_network_requests`, `get_network_request`.

Prefer snapshot + targeted diagnostics over repeated broad actions.

## Reporting Format

Return findings sorted by severity, then confidence:

1. `[Severity] Title`
2. Impact summary (one sentence)
3. Reproduction steps
4. Expected vs actual
5. Evidence
6. Confidence and open questions

If no defects are confirmed, explicitly state that no reproducible issues were found and list residual coverage gaps.

## References

- Use the detailed checklist: `references/web-qa-checklist.md`.
