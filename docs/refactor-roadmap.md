# Historical Refactor Roadmap

## Status

This document is now **historical context only**.

The phased SOLID-oriented cleanup wave it described is no longer the active
working stream. The current source of truth is:

- `docs/current-phase.md` for the active phase
- `docs/current-state.md` for the live repo snapshot
- `docs/next-step.md` for immediate direction

## What This Roadmap Covered

The earlier roadmap was centered on five incremental cleanup areas:

1. controller payload extraction
2. structural registry cleanup
3. controller and page thinning
4. workspace and editor decomposition
5. later contract hardening

That cleanup wave is now complete enough to pause. Most of the architecture
work tracked here has already been absorbed into the current repo state.

## What To Read Instead

Use the active docs set for current truth:

- `admin-architecture.md`
- `current-phase.md`
- `current-state.md`
- `next-step.md`

Use this file only when you need historical context on how the cleanup wave was
sequenced.

## Closure Note

The remaining refactor pressure points are now selective only. In particular:

- `resources/js/pages/scripture/chapters/full-edit.tsx`
- `resources/js/pages/scripture/chapters/verses/full-edit.tsx`

These are reassess-later files, not the next automatic phase of work.

