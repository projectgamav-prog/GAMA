# Architecture Guardrails

## Non-Negotiable Rules

- Canonical scripture schema is protected.
- CMS must not control canonical truth.
- Canonical scripture pages are schema-driven exceptions, not generic CMS pages.
- Admin remains hybrid: inline-first where safe, full-edit fallback where
  needed.
- Reusable editing behavior belongs in Super Conscious Admin schema/action
  surfaces or CMS modules, not primarily in pages.
- Pages and controllers should trend thinner over time.
- Prefer distributed definitions over growing central switchboards.
- Canonical scripture specialness is intentional and must not be abstracted away
  for false generic purity.

## Must Never Be Done

- Do not move canonical scripture hierarchy into CMS page/container/block
  composition.
- Do not let CMS become the source of canonical routes, identity, or structure.
- Do not bypass Super Conscious Admin schema surfaces/action resolution with
  page-local editor imports as the default pattern.
- Do not centralize more behavior into already-large registries.
- Do not build new god controllers, god pages, or god editor components.
- Do not duplicate editor systems for the same semantic responsibility.

## Must Always Be Respected

- Controller responsibility: orchestrate.
- Builder responsibility: assemble page/admin payloads.
- Mapper responsibility: normalize model data.
- Surface responsibility: expose semantic editing seams.
- Conscious action responsibility: attach reusable scripture editing behavior.
- CMS responsibility: compose supplemental and generic page content.
- Canonical responsibility: preserve protected scripture truth.
- Cleanup responsibility: remove dead code safely inside the touched scope.

## Boundary Rules

- Canonical truth boundary: owned by scripture schema.
- CMS composition boundary: owned by page/container/block system.
- Admin attachment boundary: owned by surfaces, schema metadata, action
  registries, and CMS modules where CMS is the architecture.
- Payload assembly boundary: owned by builders and mappers, not thick
  controllers.

## Architectural Enforcement Rules

- CMS must not persist or mutate canonical identity or canonical hierarchy.
- Page files must not become permanent homes for editor workflows.
- Registries must not contain business-rule switchboards.
- Canonical mutations must go through schema-specific workflows, not generic CMS
  composition paths.
- Refactor batches should remove obsolete imports, unused helpers, abandoned
  branches, stale comments, and duplicate replaced paths inside the touched
  scope.
- Refactor cleanup must not expand into unrelated systems or leave accidental
  parallel implementations behind.
