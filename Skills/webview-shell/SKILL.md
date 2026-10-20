---
name: webview-shell
description: Use for WebView browsing, native Home and history, site scope and account user agents, permissions, themes, native settings composition, branding, ad scripts, or primary-container pointer recovery.
---

# WebView shell

Apply the [shared contract](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md) once, then choose the relevant reference:

- [Navigation](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/references/navigation.md): URL entry points, history, user agents, permissions, Kid-mode gate.
- [Presentation](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/references/presentation.md): native settings composition, logo/ad injection, pointer recovery.
- [Tests](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/references/tests.md): narrow selectors and device checks.

Locate the named symbols or resource sections; do not load all of shared activity/resources. Keep native Home routed through `loadUrl`, and keep pointer recovery limited to primary containers.

Consult [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) only when changing player visuals, swipe behavior, bridge scope, or playback lifecycle; those are not shell presentation. Consult [kid-mode](/home/runner/work/ssYTMusic/ssYTMusic/Skills/kid-mode/SKILL.md) for restricted-navigation policy changes. Consult [music-server](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/SKILL.md) when moving its settings panel or dismissal wiring, [diagnostics](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/SKILL.md) when changing logging/statistics controls or observation, or [delivery](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/SKILL.md) when changing updater-header bindings.

Normally exclude authentication internals, updater implementation, retention/crash internals, compact-player scripts, and media gesture recognition. A shared file or incidental logger call does not expand ownership.
