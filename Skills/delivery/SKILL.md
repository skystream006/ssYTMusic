---
name: delivery
description: >-
  Handles Android build and dependencies, SDK and package configuration,
  signing, Git-derived versions, release workflows, and in-app update discovery,
  APK download, validation, progress and installation. Use for build, release
  or app-update changes.
---

- Establish [common contracts](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md)
  once. Start with [build/release](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/build-release.md)
  for Gradle, dependencies, packaging or workflows; use
  [updater](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/updater.md)
  for runtime update behavior. Do not load both unless the contract crosses them.
- Preserve package/signing compatibility, the fixed Git version baseline,
  bounded trusted downloads, archive checks and Android installer consent.
- Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md)
  only when activity or settings composition contracts change.
- Normally exclude page scripts, Music Server credentials, Kid mode and
  diagnostics internals. Do not read keystore bytes or generated outputs unless
  specifically necessary for the requested diagnosis.
- Select the smallest cases from the [test map](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/tests.md)
  and follow [shared validation](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/validation.md).
  Device-check installer/progress lifecycle changes; never publish a release
  merely to validate an unrelated change.
