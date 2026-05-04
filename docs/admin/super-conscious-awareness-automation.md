# Super Conscious Awareness Automation

## Purpose

Super Conscious Admin should become increasingly automated, metadata-driven,
and aware of the content and UI it is attached to. Automation may discover,
describe, report, and suggest awareness. It must not enable protected,
destructive, structural, or workflow-changing behavior by discovery alone.

The core rule is:

```text
Discovery can suggest awareness.
Policy must enable action.
```

This blueprint is architecture/foundation only. It does not add controls,
routes, migrations, renderer behavior, or automatic action enablement.

## Awareness Inputs

Admin awareness should come from durable contracts, not page-specific wiring.
The expected inputs are:

- schema metadata
- model and entity definitions
- field definitions
- relationship definitions
- renderer surface contracts
- CMS component contracts
- diagnostics and coverage reports
- explicit policies

Route pages may pass data into reusable renderers, but route pages must not own
admin behavior. If a future schema, renderer, or CMS component becomes
admin-aware, it should do so by registering metadata or emitting surfaces
through shared contracts.

## Backend Awareness Automation

Backend awareness should describe what an entity is, what fields and
relationships it exposes, and which actions may exist. It should not decide
dangerous enablement by convention.

The backend awareness model should support:

- `schemaFamily`
- `entityType`
- `modelClass`
- `tableName`
- fields and field names
- field kind
- field labels
- editable mode
- protected and canonical fields
- parent/child relationships
- relation metadata
- action capabilities
- validation rules
- Conscious Full Edit categories
- import/export boundaries

Future backend helpers may include:

| Helper | Responsibility |
| --- | --- |
| `SchemaDiscoveryService` | Read declared schema metadata and safe conventions from models/tables. |
| `ModelFieldIntrospector` | Inspect model casts, fillable/guarded settings, database columns, labels, and field kinds. |
| `ConsciousEntityDefinitionRegistry` | Store explicit entity definitions by schema family and entity type. |
| `ConsciousRelationshipRegistry` | Store parent/child and relation definitions independent from controllers. |
| `ConsciousActionCapabilityRegistry` | Declare possible actions, required policies, backend readiness, and risk level. |
| `ConsciousCoverageReporter` | Report missing field, relationship, policy, Full Edit, import/export, and action coverage. |

Explicit schema/entity definitions override discovered conventions. Discovery
may fill safe descriptive gaps, but explicit policy is the only source of truth
for protected fields and action enablement.

## Backend Automation Rules

Safe field suggestions may be convention-based when they are descriptive or
diagnostic. A discovered string column may be suggested as a possible text field,
for example, but that suggestion must not make it editable.

Protected or canonical fields must be explicitly policy-gated. This includes:

- slugs
- canonical numbers
- parent relation ids
- canonical ordering
- structural path fields
- block type
- media assignment structure
- relation/source fields
- raw JSON/meta blobs unless explicitly classified safe

Destructive and structural actions must be explicitly policy-gated. Create,
reorder, reparent, duplicate, move, delete, media mutation, relation mutation,
import, and export must never be enabled only because a model, table, relation,
or route exists.

Validation must remain separate from discovery. Discovery can identify likely
constraints; field/action policies and validators decide what payloads are
accepted.

## Frontend UI Awareness Automation

Frontend awareness should describe where content is displayed, what kind of
surface it is, and whether visible content is stored, computed, or
presentation-only.

Frontend awareness should support:

- field surfaces
- entity/card surfaces
- block surfaces
- section surfaces
- region surfaces
- page surfaces
- CMS renderer surfaces
- admin anchor slots
- action menu capability detection
- presentation-only, computed, and stored display distinctions

Future frontend helpers may include:

| Helper | Responsibility |
| --- | --- |
| `RendererAwarenessContract` | Describes reusable renderer-emitted schema/content surfaces. |
| `CmsComponentAwarenessContract` | Describes CMS module/container/page surfaces without coupling CMS to scripture internals. |
| `SurfaceEmissionRegistry` | Collects emitted UI surface facts from reusable renderers. |
| `UiSurfaceCoverageReporter` | Reports visible stored content without schema-aware surfaces and surfaces without policy-backed actions. |
| `SchemaFieldDisplayDescriptor` | Distinguishes stored schema displays from computed and presentation-only displays. |
| `AdminAnchorDescriptor` | Describes page, region, section, card, block, and field anchor slots. |
| `ConsciousActionResolver` | Resolves available UI actions from contracts, registries, capability metadata, and policies. |

These helpers should stay contract- and registry-driven. The UI should depend
on awareness contracts, registries, and resolvers, not concrete pages or
controllers.

## Renderer Rules

If a reusable renderer displays stored schema content, it must emit a
schema-aware surface. The visible value should be traceable to a declared schema
family, entity type, entity id, and field name.

If a reusable renderer displays computed or presentation-only content, it must
mark that display as non-editable. Computed labels, badges, aliases,
translations, formatted values, helper copy, and section headings must not
pretend to be directly editable schema fields unless an explicit safe mapping
exists.

Future CMS components must register admin-aware surface contracts when they
render editable CMS-owned content. CMS contracts must stay independent from
canonical scripture admin internals.

No page-specific admin control attachment is allowed. Missing controls should
usually be fixed by adding renderer coverage, schema definitions, or policy
metadata, not by attaching a button in a route page.

## CMS Component Awareness

CMS awareness should describe CMS pages, containers, blocks, modules, and module
fields through CMS-owned contracts:

- page identity and status
- container ownership and ordering
- block ownership and ordering
- module key and manifest metadata
- stored module data fields
- computed module output
- presentation-only module chrome
- anchor slots for live editing
- explicit action capability and risk

CMS modules may expose admin-aware surfaces through module manifests and
renderer contracts. They must not rely on canonical scripture schema families
unless a dedicated bridge module explicitly declares that relationship.

## Safe Automation vs Dangerous Automation

Safe automation may:

- discover candidate fields, labels, field kinds, and display descriptors
- report missing schema, relationship, renderer, CMS, or policy coverage
- suggest Full Edit categories
- suggest import/export boundary candidates
- detect that a renderer displays stored schema content without a surface
- detect that a surface has no policy-backed actions
- hide unavailable actions

Dangerous automation may not:

- enable create, delete, reorder, reparent, duplicate, move, import, or export
- enable protected/canonical field editing
- infer destructive permission from model existence
- infer structural mutation from relation existence
- attach controls directly to a page because the URL matches
- bypass field/action validation
- remove transitional backend endpoints
- change schema, migrations, CMS behavior, or UI behavior

Dangerous actions become possible only when all of these exist:

- explicit entity/action definition
- explicit policy approval
- backend service implementation
- validation rules
- UI resolver support
- diagnostics/coverage confidence
- intentional product decision to expose the action

Current enabled protected action:

- `protected_identity.update` for scripture `book`, `book_section`, `chapter`,
  `chapter_section`, and `verse`

This action is explicitly policy-gated and limited to `slug` and `number`.
Parent/reparent fields, canonical ordering, create, delete, reorder, media,
content-block, verse-support, translation, and commentary actions remain
blocked.

## SOLID Rules

SRP: discovery, registries, policies, resolvers, renderers, diagnostics, and
action execution must remain separate. A discovery helper does not execute an
action, and a renderer does not decide permission.

OCP: new schemas, fields, relations, CMS modules, and renderers should register
definitions or contracts without modifying central switchboards.

LSP: entity definitions, field definitions, relationship definitions, action
definitions, and surface definitions must share stable contracts so callers can
work with any supported schema/component without special-case behavior.

ISP: field, action, relationship, UI surface, anchor, CMS, diagnostics, and
import/export contracts should be focused. Avoid one giant awareness object.

DIP: UI and action layers should depend on contracts, registries, and policy
interfaces, not concrete route pages, controllers, or renderer implementations.

## Future Implementation Phases

1. Documentation lock
   - Keep this blueprint as the policy boundary for automation work.
   - Cross-reference it from backend, renderer coverage, cleanup, state, phase,
     and next-step docs.

2. Backend read-only discovery
   - Add discovery/introspection helpers that produce reports only.
   - Do not wire discovery output into action enablement.
   - Phase 1 has added inert action and relationship registries as explicit
     metadata foundations; registered dangerous actions remain disabled.

3. Explicit entity and relationship registries
   - Expand declared schema/entity/relationship metadata.
   - Let explicit declarations override discovery.

4. Coverage diagnostics
   - Report missing fields, relationships, renderer surfaces, Full Edit
     categories, CMS contracts, and policy gaps.

5. Renderer and CMS surface contracts
   - Expand reusable renderer and CMS module contracts for stored, computed,
     and presentation-only displays.
   - Keep page-specific attachment out of route files.

6. Capability resolver hardening
   - Resolve possible actions from metadata, but keep unavailable or unapproved
     actions hidden.
   - Require policy, backend readiness, validation, and diagnostics before any
     protected action can appear.
   - The backend action route may exist before execution services, but it must
     reject unavailable actions.
   - The active dispatcher may execute only registered enabled handlers after
     policy checks.

7. Policy-gated action implementation
   - Implement create/reorder/reparent/delete/import/export only as explicit,
     protected action services.
   - Add browser and backend verification before exposing any new control.

## Non-Goals

- Do not add controls.
- Do not implement create, delete, reorder, reparent, duplicate, import, or
  export.
- Do not auto-enable actions.
- Do not change schema or migrations.
- Do not redesign UI.
- Do not remove backend endpoints.
- Do not change CMS behavior.
- Do not create page-specific wiring.
