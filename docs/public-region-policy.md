# Public Region Policy

Use this document when deciding where global or page-level content is allowed to
live in the shared public shell.

Purpose:
- keep the shared frame stable
- keep canonical scripture structure protected
- declare where future CMS content may appear
- prevent ad hoc placement decisions

Read alongside:
- `docs/admin-architecture.md`
- `docs/cms-architecture.md`
- `docs/public-admin-page-authoring.md`
- `docs/admin/content-aware-positional-authoring.md`

## 1. Core rule

Global and page-level regions must be declared.

Future CMS or supplemental content should grow against known seams rather than
being attached ad hoc to whatever page happens to need content next.

Declared regions help us preserve:
- stable shells
- protected canonical structure
- thin pages
- truthful authoring placement

## 2. Official global regions

### Header

Header is a protected global shell region.

It currently owns:
- site identity
- structured header navigation
- utility area
- admin visibility toggle when available
- responsive mobile navigation shell

Allowed editing:
- structured navigation editing
- future controlled supplemental seams only if explicitly declared

Not allowed:
- arbitrary free-form CMS layout takeover
- canonical page-specific content inside the shell chrome

### Main content slot

This is the primary page-owned render slot.

It owns:
- the actual page content for home, scripture pages, and CMS pages

Rules:
- the slot belongs to the page type
- canonical scripture pages remain schema-driven inside this slot
- CMS pages render their own page/container/block composition inside this slot
- shared shell chrome should not leak into this slot as random unmanaged bands

### Footer

Footer is a protected global shell region.

It currently owns:
- structured footer navigation groups
- stable footer identity/copy
- stable footer closing strip

Allowed editing:
- structured footer navigation through the shared navigation system
- future controlled supplemental footer seams if explicitly declared

Not allowed:
- arbitrary free-form footer layout building
- page-specific canonical content inside the global footer

## 3. Future-safe global seams

These seams are allowed conceptually, but are not all implemented yet.

They exist so future work has named places to grow into.

### Header secondary strip

Purpose:
- small global announcement or utility content above or below the main header row

Rule:
- must stay a controlled declared seam
- must not become arbitrary shell composition

### Pre-footer callout

Purpose:
- a global callout or transitional content band before the footer

Rule:
- should be explicitly declared before use
- should not blur with page-owned supplemental zones

### Footer supplemental columns

Purpose:
- controlled expansion of footer content beyond link groups

Rule:
- should stay structured
- should not become a free-form footer builder

## 4. Page-level region policy

Each page type should have a declared structure with:
- canonical/protected zones
- supplemental/CMS-allowed zones
- areas that remain outside CMS control

### Home page

Protected/core zones:
- hero
- featured scripture area
- public onboarding flow

Supplemental/CMS-allowed zones:
- declared shared CMS region on the home page

Outside CMS control:
- shared shell
- the core home page structure and primary reading-path framing

### Books index

Protected/core zones:
- canonical library heading
- canonical book list/grid

Supplemental/CMS-allowed zones:
- none active yet beyond future declared page-level seams

Outside CMS control:
- book-card canonical structure
- shell chrome

### Book page

Protected/core zones:
- canonical book identity/intro
- canonical chapter list

Supplemental/CMS-allowed zones:
- supplemental book media area
- future declared page-level CMS seams only if explicitly added

Outside CMS control:
- canonical book structure
- chapter hierarchy
- shell chrome

### Chapter page

Protected/core zones:
- canonical chapter intro
- canonical grouped verse list

Supplemental/CMS-allowed zones:
- none active yet beyond future declared seams

Outside CMS control:
- chapter hierarchy
- verse ordering/structure
- shell chrome

### Verse detail page

Protected/core zones:
- canonical verse intro
- canonical verse text
- canonical study companion
- canonical translations/commentaries

Supplemental/CMS-allowed zones:
- declared supplementary CMS region below the canonical verse flow

Outside CMS control:
- canonical verse identity and reading structure
- shell chrome

### Public CMS page

Protected/core zones:
- shared shell
- page title and page framing

Supplemental/CMS-allowed zones:
- the CMS page/container/block composition inside the public CMS page

Outside CMS control:
- shell chrome
- global header/footer structural rules

## 5. Region policy and authoring

Region policy and authoring policy work together.

Rules:
- content should be authored where the declared region actually renders
- live positional controls should attach to the real seam when the pattern fits
- workspace remains supportive, not the default escape hatch
- if a region is not declared, future work should not quietly improvise one

## 6. Practical decision rule for future work

Before adding a new content placement, ask:

1. Is this global shell content or page-owned content?
2. Is the target region already declared?
3. Is the zone canonical/protected or supplemental/CMS-allowed?
4. Does the content belong in a structured global system, a declared CMS region,
   or not here at all?

If those answers are unclear, the correct next step is to declare the seam
before implementing the feature.
