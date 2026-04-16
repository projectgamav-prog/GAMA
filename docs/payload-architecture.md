# Payload Architecture

## Purpose

This document defines how server-side payload assembly should be structured in
the project.

The goal is to keep controllers thinner, keep payload logic reusable, and avoid
mixing querying, mapping, and admin composition inside large controller files.

## Core Thesis

Controllers should orchestrate.

Builders should assemble view-specific payload structures.

Mappers should normalize model data into stable output shapes.

Those roles are related, but they are not the same concern.

## Layer Responsibilities

### Controllers

Controllers should own:

- route entrypoints
- request-level access decisions
- query orchestration
- high-level response assembly
- selecting which builders/mappers to call

Controllers should not become the permanent home for:

- large nested array-building logic
- repeated admin payload composition
- repeated route-context mapping
- view-specific transformation trees

### Payload Builders

Payload builders should own:

- composing nested view payloads
- combining multiple mapped fragments
- admin payload assembly for a page or section
- page-specific but reusable response structures

Builders are appropriate when the logic is:

- more than simple field mapping
- tied to one page family or response family
- repeated or large enough to make controllers thick

### Mappers

Mappers should own:

- stable model-to-array transformations
- normalized public/admin field shape
- link and sub-record normalization

Good current mapper examples:

- [app/Support/Scripture/PublicScriptureData.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Scripture/PublicScriptureData.php:30>)
- [app/Support/Cms/PublicPageData.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Cms/PublicPageData.php:9>)
- [app/Support/Scripture/Admin/VerseRelationAdminData.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Scripture/Admin/VerseRelationAdminData.php:11>)
- [app/Support/Scripture/Admin/RegisteredContentBlockData.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Support/Scripture/Admin/RegisteredContentBlockData.php:7>)

## Separation Of Concerns

The preferred relationship is:

- controller queries and delegates
- builder assembles response-specific shape
- mapper converts records into stable fragments

## Rules For Adding New Payload Logic

- If the logic is just model normalization, add it to a mapper.
- If the logic is page or section specific and nested, add a payload builder.
- If the logic is request orchestration or access control, keep it in the
  controller.
- If the logic is route ownership or editability, prefer route-context or
  related support classes.
- If the same nested admin payload appears in multiple places, do not duplicate
  it in controllers.

## What Must Stay Unchanged

When refactoring payload architecture:

- preserve response prop names unless a deliberate contract change is being made
- preserve canonical/editorial separation
- preserve route-context ownership of href/editability rules
- preserve the distinction between public data mapping and admin payload
  assembly

## Current Direction

The near-term architectural move is:

- extract payload assembly out of thick scripture controllers
- preserve current output shape
- add focused support builders instead of giant replacement services

## Anti-Drift Rules

Do not:

- move more logic into already-thick controllers
- turn a mapper into a page assembler
- create one mega builder for every page family in the project
- collapse public mapping and admin payload composition into one undefined layer

Do:

- keep builder scope narrow
- keep mapper scope stable
- keep controllers readable
