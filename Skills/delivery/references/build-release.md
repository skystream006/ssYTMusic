# Android build and release

For runtime downloads/installers, start with
[updater](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/updater.md)
instead. Shared identifiers and cross-domain rules live in
[common](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md).

## First files and anchors

| File | Inspect first |
| --- | --- |
| [App build](/home/runner/work/ssYTMusic/ssYTMusic/app/build.gradle) | `gitOutput`, `versionBaseline`, `versionIncrement`, `defaultConfig`, `signingConfigs`, `dependencies` |
| [Root build](/home/runner/work/ssYTMusic/ssYTMusic/build.gradle) | Android Gradle plugin version |
| [Settings](/home/runner/work/ssYTMusic/ssYTMusic/settings.gradle) | Repository resolution, root name, single `:app` module |
| [Gradle properties](/home/runner/work/ssYTMusic/ssYTMusic/gradle.properties) | JVM memory and AndroidX/resource settings |
| [Wrapper properties](/home/runner/work/ssYTMusic/ssYTMusic/gradle/wrapper/gradle-wrapper.properties) | Gradle distribution/connection settings |
| [Manifest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/AndroidManifest.xml) | Package-level deployment, installation permission, update provider |
| [ProGuard rules](/home/runner/work/ssYTMusic/ssYTMusic/app/proguard-rules.pro) | Placeholder; release minification is currently disabled |
| [Manual release](/home/runner/work/ssYTMusic/ssYTMusic/.github/workflows/manual-release.yml) | Trigger, full-history checkout, build, APK metadata, publish guards |
| [Release cleanup](/home/runner/work/ssYTMusic/ssYTMusic/.github/workflows/cleanup-releases.yml) | Retention selection, deletion by ID, retained-tag protection |

## Contracts

- Git must be available and the checkout must not be shallow. Baseline
  `23d6b35ce12bad18592c85b3d6ff48f9e9ba8092` must remain fixed and be an ancestor
  of HEAD. The first-parent commit count after it increments code from 36 and
  the numeric version from 1002, with patch/minor rollover at 100.
- Do not manually edit version fields for a feature or release. Rebuilding a
  commit produces the same version; a PR artifact's version is not reserved.
- Preserve installed identity and signing continuity. Debug signing uses
  `/home/runner/work/ssYTMusic/ssYTMusic/app/debug.keystore`; do not load its bytes,
  replace it, or describe these artifacts as production-key release builds.
- Changing SDK/dependencies requires checking affected API guards across the
  relevant domain. Existing configuration uses AppCompat/WebKit/JUnit, not a
  separate web build.
- Manual release always checks out latest main with full history, runs the
  shared test/build command, reads APK output metadata, uploads the
  `ssYTMusic-v<versionName>.apk` artifact and publishes that version if absent.
  Existing releases are left unchanged.
- Cleanup runs scheduled or manual, retains five newest releases (including
  drafts/prereleases in selection), deletes releases by ID, and protects tags
  shared by a retained release. Treat execution as destructive, not validation.
- Both workflows need repository contents-write permission for their intended
  operation. Do not expand permissions or add credentials for unrelated work.

The [README Build section](/home/runner/work/ssYTMusic/ssYTMusic/README.md) mentions
an “Android APK” workflow not present in the inspected checkout. The two linked
workflow files are the source of truth; do not assume a PR test workflow exists.

## Scope and validation

Do not load application domains for a workflow-only edit unless a packaging or
runtime compatibility contract changes. Consult the owning domain for service,
callback or permission changes; the manifest is section-owned.

Use [delivery tests](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/tests.md)
and the [shared build/validation commands](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/validation.md).
For SDK/package changes, device-check installation over a compatible existing
build and affected platform entry points without resetting user data. Do not
publish or delete releases just to validate documentation or application changes.
