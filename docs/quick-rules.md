# Quick Rules

## Daily Rules

1. Canonical scripture is protected. CMS must not control canonical identity,
   hierarchy, or truth.
2. Controllers orchestrate, builders assemble, mappers normalize.
3. Pages stay thin. Editor workflows belong in modules or support layers, not
   in page files.
4. Prefer modules over page-local editing logic.
5. Registries should be declarative lookup and composition points, not
   business-rule switchboards.
6. Prefer distributed definitions over growing central registry files.
7. Preserve payload shape within a refactor batch unless the batch explicitly
   changes contracts.
8. Do not mix refactor streams in one batch. Keep controller extraction,
   registry cleanup, CMS decomposition, and type hardening separate.
9. Do not introduce false abstraction. Add abstraction only when it protects a
   real architectural boundary.
10. Canonical scripture pages remain intentional exceptions. Do not flatten
    them into generic CMS patterns.
11. Remove dead code within the touched scope. Clean up obsolete imports,
    unused helpers, abandoned branches, stale comments, and duplicate paths
    that the refactor replaces.
12. Do not broaden cleanup into unrelated systems, and do not leave parallel
    old/new implementations behind unless they are intentionally transitional
    and clearly documented.

## Default Decision Rule

When unsure, choose the smaller move that preserves boundaries, reduces file
pressure, and avoids architectural drift.
