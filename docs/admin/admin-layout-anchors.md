# Admin Layout Anchors

## Purpose

Admin layout anchors give the Super Conscious Admin Layer stable places to attach controls without redesigning the public page or placing buttons by route-page hand.

The public renderer remains responsible for content. The admin layer reads anchor levels and slots to decide where controls belong.

## Anchor Levels

The universal levels are:

- Page
- Region
- Section
- Card
- Block
- Field

This gives the admin layer a predictable hierarchy:

`Page -> Region -> Section -> Card / Block -> Field`

## Slots

Field slots:

- `field.top-right`
- `field.bottom-right`
- `field.top-left`
- `field.bottom-left`

Card and block slots:

- `card.top-right`
- `card.top-left`
- `card.bottom-right`
- `card.bottom-left`
- `card.bottom-edge`

Section slots:

- `section.header-right`
- `section.header-left`
- `section.bottom-edge`
- `section.between-items`

Region slots:

- `region.top`
- `region.bottom`
- `region.empty-state`
- `region.between-sections`

Page slots:

- `page.header`
- `page.footer`
- `page.settings`

## Action Placement Rules

- Field quick edit, accept, and discard belong to a field corner.
- Full field edit belongs to the secondary field corner.
- Block full edit, duplicate, delete, and move belong to card/block corners or the bottom edge.
- Add controls belong to section/card bottom edges, between-item slots, or empty-region slots.
- Reorder controls belong to item boundaries and section between-item slots.
- Page settings belong to page anchors.

## Current Implementation

The first passive anchor layer is implemented in reusable components:

- `AdminOverlayFrame` can expose an anchor level and key.
- Schema field quick-edit controls use field-level slots.
- `ChroniclePaperPanel`, `ChronicleEditorialGrid`, `ChronicleSideRail`, and `ChronicleSectionHeading` expose passive anchor boundaries.
- `ContentBlockRenderer` exposes block-level anchors.
- `UniversalSectionRenderer` exposes section-level anchors.

These anchors do not render heavy UI by themselves. They provide stable local positioning containers and metadata for future resolver-owned controls.

## Rule

Do not place admin buttons with page-specific JSX. Renderers expose anchors; awareness/resolver/control layers decide the controls and their slots from schema, content, block, layout, ordering, and action metadata.
