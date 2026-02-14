---
name: medieval-ui-designer
description: Visual design guidance for clean, usable interfaces with a medieval-inspired aesthetic. Use when asked to design or refine UI themes, information hierarchy, component styling, layout systems, or interaction patterns that should feel medieval-ish while staying modern, consistent, and practical. When design decisions depend on current in-app behavior, inspect the app first with Chrome DevTools MCP (optionally via $web-qa-devtools).
---

# Medieval UI Designer

## Design Goal

Create interfaces that feel grounded in medieval craft while remaining clear, fast to scan, and easy to use.

## Investigate First (When Needed)

- Inspect the running app before proposing changes if behavior, layout, or state handling is uncertain.
- Use Chrome DevTools MCP directly or run `$web-qa-devtools` for structured investigation.
- Capture only the evidence needed for design decisions:
- Current component patterns and variants.
- Information hierarchy on key screens.
- Breakpoint behavior (desktop/mobile).
- Interaction states (loading, error, success, empty).
- Console or network issues that affect UX recommendations.
- Skip investigation for purely conceptual or greenfield style-system requests.

## Core Rules

- Establish hierarchy first: primary action, supporting actions, metadata, then ornament.
- Keep readability non-negotiable: strong contrast, predictable spacing, and restrained decoration.
- Preserve consistency: define and reuse tokens for color, typography, spacing, radius, and elevation.
- Prefer existing patterns in the product before introducing new ones.
- Introduce new patterns only when current patterns cannot support the task cleanly.

## Visual Direction

- Use a restrained palette inspired by parchment, ink, iron, wood, and muted heraldic accents.
- Keep surfaces textured subtly, not noisy.
- Use medieval cues in trim, dividers, iconography, and headings, not in dense body text.
- Balance character with utility: decoration must never reduce clarity or tap targets.

## Typography

- Use a two-tier type system:
- Headings: expressive serif with medieval character.
- Body/UI text: highly legible serif or sans for long-form reading and controls.
- Keep line length and spacing comfortable; avoid compressed ornamental fonts for body copy.

## Layout and Components

- Build layouts on a spacing scale and consistent grid.
- Keep key actions visible without scrolling when possible.
- Use card, panel, table, and form patterns consistently.
- Define explicit states for components: default, hover, focus, active, disabled, error, success.
- Make focus states obvious and keyboard navigation reliable.

## Motion and Interaction

- Use motion with purpose: reinforce hierarchy changes and state transitions.
- Keep animation subtle and fast; avoid decorative motion loops.
- Confirm interactions with clear feedback messages and status indicators.

## Delivery Checklist

- Provide theme tokens (color, type, spacing, radius, shadow/border).
- Provide component usage rules and state styling.
- Explain hierarchy decisions for each key screen.
- Call out accessibility constraints (contrast, focus, target size, semantics).
- Keep proposals compatible with the existing design system unless asked to re-theme globally.
