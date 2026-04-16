# Current Phase

## Active Phase

Phase 1 - Controller Payload Extraction

## Objective

Reduce SRP pressure in scripture controllers by extracting nested page/admin
payload assembly into focused support builders while preserving current
behavior.

## Exact Scope

The active scope is:

- [app/Http/Controllers/Scripture/BookController.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Http/Controllers/Scripture/BookController.php:23>)
- [app/Http/Controllers/Scripture/ChapterController.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Http/Controllers/Scripture/ChapterController.php:28>)
- [app/Http/Controllers/Scripture/VerseController.php](</c:/Users/SHREENATHJI/Documents/malay/gama/app/Http/Controllers/Scripture/VerseController.php:27>)

Expected new support layers may live under a focused namespace such as:

- `App\\Support\\Scripture\\PageData\\`
- `App\\Support\\Scripture\\Admin\\PagePayloads\\`

## Allowed In This Phase

- behavior-preserving extraction of nested payload building logic
- dedicated payload builder classes
- reuse of existing route-context, mapper, and support classes
- small supporting tests that lock current payload behavior

## Forbidden In This Phase

- no application behavior redesign
- no route changes
- no response prop contract changes unless strictly unavoidable
- no registry redesign
- no CMS architecture refactor
- no admin surface/module architecture changes
- no frontend page decomposition as the main purpose of the batch
- no merging canonical and editorial concerns

## Success Criteria

- controllers are materially thinner
- current Inertia prop shapes stay stable
- canonical/editorial separation stays intact
- route-context ownership stays intact
- extracted builders are focused and not god services

## Failure Signals

This phase has failed if:

- controller logic is merely moved into one giant replacement class
- payload names or shapes drift accidentally
- query/access logic becomes harder to find
- the extraction starts redesigning unrelated systems
