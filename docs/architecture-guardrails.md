# Architecture Guardrails

## Non-Negotiable Rules

- Canonical scripture schema is protected.
- CMS must not control canonical truth.
- Canonical scripture pages are schema-driven exceptions, not generic CMS pages.
- Admin remains hybrid: inline-first where safe, full-edit fallback where
  needed.
- Reusable editing behavior belongs in modules, not primarily in pages.
- Pages and controllers should trend thinner over time.
- Prefer distributed definitions over growing central switchboards.
- Canonical scripture specialness is intentional and must not be abstracted away
  for false generic purity.

## Must Never Be Done

- Do not move canonical scripture hierarchy into CMS page/container/block
  composition.
- Do not let CMS become the source of canonical routes, identity, or structure.
- Do not bypass the admin module host with page-local editor imports as the
  default pattern.
- Do not centralize more behavior into already-large registries.
- Do not build new god controllers, god pages, or god editor components.
- Do not duplicate editor systems for the same semantic responsibility.

## Must Always Be Respected

- Controller responsibility: orchestrate.
- Builder responsibility: assemble page/admin payloads.
- Mapper responsibility: normalize model data.
- Surface responsibility: expose semantic editing seams.
- Module responsibility: attach reusable editing behavior.
- CMS responsibility: compose supplemental and generic page content.
- Canonical responsibility: preserve protected scripture truth.

## Boundary Rules

- Canonical truth boundary: owned by scripture schema.
- CMS composition boundary: owned by page/container/block system.
- Admin attachment boundary: owned by surfaces and modules.
- Payload assembly boundary: owned by builders and mappers, not thick
  controllers.

## Architectural Enforcement Rules

- CMS must not persist or mutate canonical identity or canonical hierarchy.
- Page files must not become permanent homes for editor workflows.
- Registries must not contain business-rule switchboards.
- Canonical mutations must go through schema-specific workflows, not generic CMS
  composition paths.
