# Validation and discovery

Load the owning domain's test map first. All domains share one Android build;
test execution can be narrowed, but compilation is not modularized by Skill.

## Environment

Use Git with full history, JDK 17, Android SDK platform 34 and access to configured
Google/Maven/Gradle repositories. SDK location comes from the environment or
local SDK configuration; do not commit machine-local settings.
[App build](/home/runner/work/ssYTMusic/ssYTMusic/app/build.gradle) rejects shallow
history during configuration, including for filtered tests. If shallow, fetch
history before testing rather than editing version logic:

```sh
git -C /home/runner/work/ssYTMusic/ssYTMusic fetch --unshallow
```

The fixed baseline must be an ancestor of HEAD. Do not move it or manually bump
versions to make a build pass. See the
[build reference](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/build-release.md)
only when build/version behavior itself is relevant.

## Commands

Select the class or exact method from the domain test map. Repeat `--tests` to
form the deduplicated union of impacted tests:

```sh
/home/runner/work/ssYTMusic/ssYTMusic/gradlew \
  -p /home/runner/work/ssYTMusic/ssYTMusic \
  :app:testDebugUnitTest \
  --tests 'com.skystream.ssmusic.NavigationHistoryTest'
```

An exact-method filter uses `com.skystream.ssmusic.ClassName.methodName`.
Use Gradle rather than running structural tests from an arbitrary working
directory: some tests read files relative to the app project.

For changed native resources, production Java or packaging, as appropriate:

```sh
/home/runner/work/ssYTMusic/ssYTMusic/gradlew \
  -p /home/runner/work/ssYTMusic/ssYTMusic \
  :app:assembleDebug :app:lintDebug
```

Broaden to full regression for shared lifecycle/helper contracts, manifest,
dependencies or build changes:

```sh
/home/runner/work/ssYTMusic/ssYTMusic/gradlew \
  -p /home/runner/work/ssYTMusic/ssYTMusic \
  test assembleDebug
```

Do not run every domain's tests solely because a shared source file changed.
Inspect the changed symbols and their consumers. Never dispatch release or
cleanup workflows as a substitute for local validation.

## Coverage limits

- Pure Java tests exercise policy/formatting/URL/counter behavior.
- Many activity, JavaScript and XML regressions inspect source structure. They
  do not execute Chromium, Android lifecycle, a live page or real network flows.
- No separate JavaScript runner, instrumentation suite or Skill-specific
  lint/test harness is configured. Do not invent commands for one.
- Device-check changed live DOM, background playback, notifications, browser
  callbacks, Keystore and installer behavior. Each domain lists relevant cases.
- Documentation-only Skill changes require no APK build. Report checks actually
  performed and environmental limitations; a successful source assertion is not
  evidence of successful live behavior.

## Skill discovery and documentation checks

The canonical collection is
`/home/runner/work/ssYTMusic/ssYTMusic/Skills`. GitHub documents adding alternative
Skill locations in Copilot CLI:
[CLI Skill registration](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills).
Inside an interactive CLI session, run:

```text
/skills add /home/runner/work/ssYTMusic/ssYTMusic/Skills
/skills reload
/skills list
/skills info repo-router
```

Register the collection directory, not individual Markdown files: the CLI
discovers immediate child Skill directories. Directory registration leaves the
canonical files in place, unlike file/URL installation; do not use `--project`
to install copies. See [directory discovery](https://github.com/github/copilot-sdk/blob/main/docs/features/skills.md)
and the [CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference#managing-skills-non-interactively).
These are client commands, not shell commands or automatic repository hooks.
Repeat `/skills info` for each domain to inspect its location.

This documents a supported registration mechanism, **not a live discovery test**.
No Copilot CLI is installed in the authoring sandbox. Verify registration in a
fresh consumer session before relying on automatic routing.

GitHub cloud-agent documentation lists standard Skill roots, not this custom
root: [creating Skills](https://github.com/github/docs/blob/main/data/reusables/copilot/creating-adding-skills.md).
No cloud-specific custom-root loader, duplicate Skill tree, or unverified
symlink adapter is installed here. If cloud-native discovery is required,
agree on a supported placement/integration first. Do not assume a VS Code
setting configures the cloud agent; current VS Code documentation also
distinguishes Local and Copilot harnesses:
[VS Code Skills](https://code.visualstudio.com/docs/agent-customization/agent-skills).

For the intended consumer, check:

1. Register the collection and confirm exactly seven Skills: `repo-router`,
   `webview-shell`, `playback`, `kid-mode`, `music-server`, `diagnostics`, `delivery`.
2. Confirm each source location points to the canonical collection and its YAML
   name matches its folder. Only name/description should be initially exposed
   to model context; filesystem parsing need not be metadata-only.
3. Confirm the selected Skill body loads on demand and references are followed
   only as needed, not all injected up front.
4. Exercise the five
   [routing scenarios](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/routes.md#five-routing-acceptance-scenarios)
   in a fresh session without supplying domain knowledge in the prompt.

When maintaining these documents, inspect all seven frontmatters, resolve local
links, verify named source symbols/test methods, review the scenario routes, and
check the diff for unintended application changes. Keep SKILL.md a compact
control plane; update detailed knowledge only in its owning reference. The
architecture and commands should have one authoritative copy.
