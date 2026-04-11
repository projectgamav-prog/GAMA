# Content-Aware Positional Authoring

Use this document when designing or evaluating live authoring that happens on
the real rendered surface instead of in a detached workspace-first editor.

This is now a reusable project pattern, not a header-only trick.

Read alongside:
- `docs/admin-architecture.md`
- `docs/public-admin-page-authoring.md`
- `docs/admin/positional-authoring-implementation-guide.md`

## 1. What this pattern is

Content-aware positional authoring is a live editing model where:
- the real rendered surface stays visible
- the rendered item remains the main editing context
- tiny contextual controls attach near the actual item or list position
- edit/create/reorder/delete actions happen locally in place
- deeper configuration expands only when needed

This pattern is especially useful for structured content that already has a
clear visual position:
- navigation trees
- structured lists
- hierarchical menus
- small CMS module lists
- card/section compositions where placement is meaningful

## 2. Why we use it

We use this pattern because detached workspace-first editing creates distance
between:
- what the user is seeing
- what the user is editing
- where the edited item actually lives in the layout

That distance causes common problems:
- editing feels indirect
- “add item” actions feel detached from the real list position
- ordering becomes abstract instead of visual
- users lose trust because the rendered surface and the authoring surface feel
  like two different systems

Positional authoring keeps the editing truth close to the rendered truth.

## 3. Core philosophy

The real rendered surface is the primary authoring surface.

That means:
- the header should be edited in the real header
- a CMS list should be edited in the real list
- a structured tree should be edited in the real tree
- the user should see the actual layout while editing

Workspace, dashboard, and full-edit pages still matter, but they are support
tools rather than the routine editing surface.

## 4. Core behaviors

### Tiny contextual controls

Default visible controls should be small and local.

Typical controls:
- edit
- add child
- add item in this list
- move up
- move down
- delete

They should:
- attach near the real item
- stay visually subordinate to the content
- avoid turning the page into heavy admin chrome

### In-place editing

When the user edits an item:
- the rendered label/value swaps into a local editable state
- the user stays in the same rendered layout context
- save/cancel are nearby and obvious
- the user does not need to jump to a detached editor for the common case

### Context-aware insertion

Add actions should come from the structural context, not from a generic form.

Examples:
- add item in this list inserts into that list
- add child inserts into that parent’s child list
- add block at top/bottom derives placement from the clicked zone

The click position should define as much insertion context as possible.

### Nearby ordering controls

Move up/down belongs near the item it affects.

This keeps ordering truthful and avoids fake builder-only ordering workflows.

### Structured data preservation

Inline editing should not flatten the data model just because the UI is local.

For example:
- a nav item label may edit inline
- the nav item target may still use a structured target contract
- a CMS module may edit a compact field inline while preserving richer config
  behind an inline expansion or secondary panel

Local editing must not destroy structural integrity.

## 5. Relationship to workspace and full-edit

Positional authoring does not eliminate supportive tools.

Workspace/fallback tools are still appropriate for:
- listing/search/diagnostics
- batch management
- deeper utility editing
- rare complex configuration
- fallback when a local live affordance is intentionally not built

But the rule is:
- routine editing should stay on the live surface when the pattern fits
- workspace should not become the default just because it already exists

## 6. Where this pattern is appropriate

Use positional authoring when all of these are true:
- the user can point to a real visible item or list position
- the structure is meaningful to the user
- small local controls can express the main actions clearly
- the content does not need a large dedicated editor for the common case
- the page can stay stable while the item locally swaps into edit mode

Good fits:
- shared header navigation
- footer navigation
- structured list/tree editing
- CMS list-style modules
- small card stacks with clear insertion zones
- list rows where ordering and parent/child context matter

## 7. Where this pattern is not appropriate

Do not force positional authoring when:
- editing requires a large multi-field workflow
- the rendered surface is too dense for local controls to stay readable
- the item is not meaningfully positioned on screen
- the interaction would become cramped or misleading
- the user needs a broader protected workflow than the live surface can safely
  carry

In those cases:
- use inline expansion only for the small part that is local
- move the deeper workflow into a drawer, sheet, or full-edit fallback
- keep the live surface truthful about that escalation

## 8. How this fits our architecture

This pattern fits the current project architecture because it preserves:
- thin pages
- same-layout public/admin behavior
- stable shells
- semantic attachment
- reusable module/editor infrastructure
- truthful live editing instead of page-local hacks

It is compatible with both:
- canonical admin surfaces
- future CMS modules

Important boundary:
- canonical scripture structure remains protected
- CMS remains independent from canonical scripture internals
- positional authoring is a UX/system pattern, not a reason to blur those
  domain boundaries

## 9. Reuse beyond header navigation

The header is only the first strong example.

This same model is expected to guide future work such as:
- footer navigation
- structured CMS lists
- tree-shaped CMS editors
- compact module lists with local insertion points
- other shell-adjacent structured content that must stay stable but editable

The reuse point is:
- real surface first
- tiny contextual controls
- local draft insertion
- structural context preserved
- supportive workspace second

## 10. Preservation rules

Keep these rules stable unless the architecture is deliberately revised:

- the real rendered surface remains the active editing surface
- controls stay tiny and contextual by default
- insertion should be derived from real position where possible
- structured data contracts stay intact under inline editing
- workspace and full-edit remain support/fallback tools, not routine defaults
- shell structure stays stable while content becomes locally editable
