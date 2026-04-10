Public/Admin Page Authoring Brief
Same-layout authoring rules for CMS and future eligible live pages

Use this document when work touches live authoring, in-place composition controls, or the public/admin relationship on content-managed pages.

## 1. Core rule
Public users and admins must use the same core page layout.

- the real page is the source layout
- admin mode augments that real page
- routine authoring must happen in place on the real page
- do not switch routine composition into a detached builder shell

## 2. In-place control attachment rule
Controls must attach to the actual eligible layout element they affect.

- default visible controls should stay compact and button-like
- chooser or configuration UI should expand only after the user clicks a compact control

- blank page or blank eligible region:
  - show only `Add Card`
  - show only `Add Button`
- existing container/card:
  - attach controls directly to that container/card area
  - top controls:
    - `Add Block`
    - `Add Button`
  - bottom controls:
    - `Add Block`
    - `Add Button`

Do not dump a full composition panel below the page content as the normal live editing experience.

## 3. Layout-aware insertion rule
Placement semantics should come from where the user clicked.

- blank-region adders create page-level container insertion
- container-top adders insert into that container at the top of its block area
- container-bottom adders insert into that container at the bottom of its block area
- the live authoring UI should not ask the user to manually enter ordering when the click location already defines it

## 4. Auto-derived position and order rule
The live authoring layer should derive insertion context automatically from the clicked control.

At minimum, the system should know:

- page
- container when applicable
- whether the click came from the top or bottom insertion zone
- insertion mode
- relative ordering target when needed

This keeps live authoring truthful to the actual layout and avoids fake builder-only positioning steps.

## 4.1 Attached CRUD rule
Live authoring should not stop at create-only controls when the affected element already exists.

- existing containers should expose compact attached edit and delete affordances
- existing blocks should expose compact attached edit and delete affordances
- deeper configuration may still open after click, but the default visible state should remain small

## 5. Dashboard/workspace rule
Dashboard and workspace remain supportive tools.

- valid uses:
  - listing
  - search
  - diagnostics
  - management
  - utility editing
  - deeper fallback editing when a live affordance is not built yet
- invalid use:
  - becoming the primary routine page composition surface
- routine add/edit flows on eligible pages must not redirect the user into dashboard/workspace pages when the live authoring layer can handle that interaction on the same page

## 6. Applicability
This rule applies to CMS pages now and should guide future eligible live pages.

- CMS pages are the active implementation target
- future eligible pages may expose the same authoring behavior through the universal content layer
- non-CMS pages may declare shared CMS regions that resolve supplementary CMS containers and blocks without turning those pages into CMS-owned routes
- canonical scripture structure remains protected
- universal content composition may appear on scripture-related pages only as augmentation, never as canonical schema mutation

## 7. Preservation rules
Keep these rules locked unless the architecture is being deliberately revised.

- same-layout public/admin rendering stays the default
- admin mode remains augmentation of the real page
- in-place controls attach to actual layout elements
- insertion context is auto-derived from click location where possible
- dashboard/workspace stays supportive rather than primary
- pages stay thin
- CMS remains independent from canonical scripture internals
