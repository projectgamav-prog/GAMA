# Positional Authoring Implementation Guide

Use this document when implementing a live structured editor that follows the
content-aware positional authoring pattern.

Read alongside:
- `docs/admin/content-aware-positional-authoring.md`
- `docs/admin-architecture.md`
- `docs/public-admin-page-authoring.md`
- `docs/admin-module-integration.md`

This guide is practical. It explains how to implement the pattern without
drifting back into detached workspace-first behavior.

## 1. Expected data shape

Positional authoring works best when the rendered structure already has a clear
tree or list model.

Typical minimum item shape:
- stable `id`
- display label/value
- ordering field
- optional parent reference
- optional children
- structured payload/config
- action hrefs for update/create/move/delete when live editing is allowed

If the item can link somewhere or carry richer structured data, keep that data
structured rather than flattening it for convenience.

Examples:
- navigation item:
  - `id`
  - `label`
  - `target`
  - `children`
  - `sort_order`
  - `update_href`
  - `destroy_href`
  - `move_up_href`
  - `move_down_href`
- CMS module row:
  - `id`
  - rendered summary data
  - module config/data
  - insertion context
  - edit/delete/move hrefs

## 2. Required UI states

Every positional authoring implementation should define explicit states.

Minimum states:
- display state
- editing state
- adding draft state
- processing state
- validation error state

Optional states:
- child list open/closed
- expanded structured target/config editor
- confirmation state for destructive actions

Do not blur these together through ad hoc booleans.

## 3. Display mode to edit mode swap

The normal pattern is:
1. render the real item
2. show tiny nearby controls
3. on edit, locally swap the item into edit mode
4. keep the item in the same real position in the layout
5. on save/cancel, return that same position to display mode

Rules:
- do not move the user into a detached builder shell for the common edit
- preserve the overall layout while the item swaps modes
- keep the control footprint small unless expanded detail is explicitly opened

## 4. Draft row insertion rules

When adding a new item:
- insert the draft row where the new item will actually live
- do not render the draft in a distant generic form elsewhere
- let the user type immediately

Expected behaviors:
- add item in this list:
  - insert after the last current item in that list
- add child:
  - open that parent’s child list if needed
  - insert the draft row inside that child list
- positional add based on top/bottom zones:
  - derive placement from the clicked zone

Draft rows should usually start small:
- immediate label or summary field
- local save/cancel
- optional inline expansion for structured target/config editing

## 5. Save and cancel behavior

Save behavior should be truthful and local:
- submit the request from the live surface
- keep the user on the same public-looking page when possible
- refresh the live item list/tree from real updated data
- exit edit/draft state on success

Cancel behavior should:
- discard only local edits
- close the local editing state
- not mutate unrelated live items

Validation behavior should:
- keep the editor open
- keep user input local
- surface the real error near the item or nearby expanded detail area

## 6. Delete behavior

Delete should stay close to the real item, but still be safe.

Recommended rules:
- use a tiny local delete control
- require a lightweight confirmation step when accidental loss is plausible
- remove the item from the same live structure after success
- reindex surrounding ordering if the backend model requires it

Do not route simple deletion into a detached workspace unless the live surface
truly cannot support it safely.

## 7. Move behavior

Move up/down should be simple, local, and bounded.

Recommended rules:
- use tiny nearby up/down controls
- keep moves within the current list/parent unless broader movement is clearly
  designed
- let the backend remain the source of truth for ordering
- refresh the visible structure after the move

Do not introduce drag/drop just because movement exists. Up/down is often the
correct first step.

## 8. Structured target/config editing near the item

Inline label editing is often appropriate.
Full structured payload editing may need a slightly deeper UI.

Good pattern:
- small inline field for the primary visible value
- compact “edit target” or “more details” expansion nearby
- keep the structured contract intact under that expansion

Use this for things like:
- link targets
- compact module config
- structured item metadata

Do not flatten structured data into a single string field just to keep the UI
small.

## 9. Choosing inline expansion vs drawer/sheet/full-edit

Use inline expansion when:
- the extra fields are still closely tied to the visible item
- the user benefits from seeing the item and its details together
- the expanded UI still fits the live surface honestly

Use drawer/sheet when:
- the secondary editor is still local in intent but too wide/tall for the item
- the user should stay on the same page while focusing on more fields

Use full-edit or workspace fallback when:
- the workflow is materially deeper
- the user needs a protected utility/editorial context
- the live surface would become cluttered or misleading

The escalation path should be honest, not accidental.

## 10. Shell stability rules

When positional authoring is used inside a stable shell:
- keep the shell structure protected
- make content locally editable without turning the shell into a free-form
  builder
- avoid large admin bands or detached control trays
- keep controls attached to the content seam, not the page edge

Examples:
- header shell remains header shell
- nav items become locally editable
- shell identity/navigation/utilities remain structurally stable

## 11. Guidance for future CMS modules

Future CMS modules should adopt this pattern when the module renders a
structured, position-meaningful list or tree.

Good CMS fits:
- button groups with list-like local insertion
- structured feature lists
- nested menu-like modules
- compact repeaters where position matters

For CMS module adoption:
- keep module data/config typed
- preserve the manifest-driven module boundary
- keep rendering/editor logic inside the module family
- keep live positional behavior attached to the rendered module output
- let deeper utility editing fall back only when the live affordance would
  become too heavy

Do not use this pattern as an excuse to bypass the CMS module contract.

## 12. Testing expectations

Positional authoring needs more than unit-level confidence.

Expected test layers:
- feature tests for create/update/move/delete routes and returned payload shape
- focused browser or browser-like smoke validation for the real live flow

The smoke layer should prove:
- the item becomes editable in place
- the browser submits a real request
- the update persists
- the live UI visibly changes after save
- add-item/add-child inserts in the correct position
- move up/down changes real order
- delete removes the real item

If a flow is user-facing and highly interactive, “feature tests passed” is not
enough by itself.

## 13. Common pitfalls to avoid

Avoid these mistakes:
- rendering a tiny edit button that still redirects into a workspace for the
  common case
- asking the user to manually enter position/order that the click already
  defined
- losing structured target/config data under inline label editing
- mounting the wrong semantic editor in the right visual position
- letting local state rehydrate from stale props while the user is typing
- leaving multiple competing editing paths visible on the same surface
- making the shell look like a general-purpose builder when it should stay
  stable

## 14. Practical checklist before merging

- The real rendered surface stayed the main editing context.
- Tiny controls attach near the actual item or list seam.
- Draft insertion happens in the truthful position.
- Save/cancel/delete/move stay local and predictable.
- Structured data remains structured.
- The shell stayed stable.
- Workspace/full-edit is fallback, not the default path.
- A browser or browser-like smoke proves the live path really works.
