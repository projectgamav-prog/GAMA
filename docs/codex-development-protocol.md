# Codex Development Protocol

## Purpose

This document defines the default implementation hygiene Codex should follow
during architecture-preserving work.

## Cleanup Rule

- Dead code removal is encouraged, but only inside the scope already being
  refactored.
- When touching an area, remove obsolete imports, unused helpers, abandoned
  branches, stale comments, and duplicate paths that the refactor has replaced.
- Do not expand cleanup into unrelated systems, adjacent modules, or future
  phases.
- Do not keep parallel old/new implementations unless they are intentionally
  transitional and clearly documented in the same batch.
- Leaving dead architecture behind is itself a project anti-pattern because it
  teaches future contributors the wrong structure.

## Default Constraint

Cleanup should clarify the intended architecture, not broaden the work.
