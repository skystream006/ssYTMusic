---
name: repo-router
description: >-
  Route ssYTMusic changes to the smallest relevant engineering domain. Use for
  ambiguous requests, unfamiliar entry points, MainActivity changes without a
  clear feature owner, or changes spanning multiple domains.
---

1. Match the requested behavior against the discovered domain names and
   descriptions. If the owner is clear, load only that domain Skill.
2. Otherwise read the relevant row in
   [routes](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/routes.md).
   Route shared files by symbol or behavior, not filename alone.
3. Establish [common contracts](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md)
   once, then read one relevant domain reference and its mapped source region.
4. Load an adjacent Skill only when its contract changes or needs investigation;
   an unchanged helper call does not require its whole domain.
5. Use the owning domain's test map and the shared
   [validation guide](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/validation.md).
   Deduplicate impacted tests across domains.
6. Keep the [architecture map](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/architecture.md)
   closed unless the request is architectural or routing remains unresolved.
7. Do not preload source trees, every reference, unrelated tests, binaries,
   generated files, or external repositories.

For Skill maintenance, use the five routing acceptance scenarios in the route
reference. This router owns no production code or separate application tests.
