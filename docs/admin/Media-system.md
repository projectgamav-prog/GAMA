# Media System

## Status

This document is now a **light reference note**, not a planned-phase roadmap.

The media system already exists in the repo. The current truth is:

- media records are real and reusable
- book-level media authoring now supports inline attach / replace / remove for
  common actions
- advanced media-assignment editing still lives in Full edit where appropriate
- the active product-facing direction is incremental improvement of picker and
  authoring UX, not a media-system redesign

Use `docs/current-state.md` for the live behavior snapshot and
`docs/admin-architecture.md` for the architecture boundary.

## Current Direction

Media should remain:

- a reusable shared resource
- referenced by CMS modules and canonical admin flows
- separate from page-specific ownership logic

The current repo direction is:

- improve common media authoring actions inline where the surface already has
  the right seams
- preserve advanced assignment metadata in deeper edit flows
- avoid inventing a second media authoring system beside the existing admin/CMS
  architecture

## Still Reasonable Future Improvements

These are still valid later improvements, but they are not the current phase:

- richer picker search/filtering
- upload/create flow improvements
- better media library browsing
- stronger preview and reuse ergonomics on more surfaces

## Keep In Mind

- do not tightly couple media to one module family
- do not redesign schema ownership just to improve editor UX
- do not treat this doc as the active roadmap for current implementation work

