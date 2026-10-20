---
name: playback
description: Use when changing background audio, playback notifications or media commands, the native/page playback bridge, song refresh, playback restoration, media swipes, video thumbnails, or compact-player presentation.
---

# Playback

Read the [shared contract](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md) once, then open only the reference matching the change:

- [Lifecycle](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/references/lifecycle.md): backgrounding, service state, notifications, transport commands, bridge reporting, song refresh, and saved position.
- [Presentation](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/references/presentation.md): native/page media gestures, thumbnail replacement, compact/expanded presentation, and foreground geometry recovery.

Use the [test map](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/references/tests.md) to select the smallest existing checks, not a blanket playback suite. Distinguish executable Java behavior from source-string assertions and device-only behavior.

Locate named symbols before reading the shared activity; do not load its whole file. WebView owns playback and audio focus; the service mirrors state. Presentation changes must not replace media or weaken restrictions.

Normally exclude unrelated server authentication/storage, updater/release workflows, and diagnostics internals.

Consult [kid-mode](/home/runner/work/ssYTMusic/ssYTMusic/Skills/kid-mode/SKILL.md) whenever transport, navigation, or injected controls affect restricted playback. Kid mode remains authoritative for authorization. Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) only for shared origin/navigation boundaries or native settings/branding changes. Route unrelated build or integration work through [repo-router](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/SKILL.md).
