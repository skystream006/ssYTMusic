---
name: diagnostics
description: Use for optional logging modes, formatting, retention, crash serialization, log viewing/sharing, statistics lifecycle and unavailable values, or passive gesture diagnostics.
---

# Diagnostics

Apply the [shared contract](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md) once, then load only the relevant reference:

- [Logging](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/references/logging.md): mode selection, formatting/entry boundaries, bounded retention, crash serialization, viewer/share/clear.
- [Metrics and gestures](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/references/metrics-gestures.md): lifecycle-scoped statistics and opt-in structural observation.
- [Tests](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/references/tests.md): narrow coverage and manual gaps.

This domain owns observation, not the actions being observed. Read only named shared-activity/native-touch sections. Preserve indented stack continuation lines: reactive retention relies on their distinction from entry headers.

Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) only when changing settings composition or primary-container pointer recovery; recovery is not diagnostic logging. Consult [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) only for changes to touch consumption, swipe execution, or playback bridge/lifecycle semantics. Consult [music-server](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/SKILL.md) only when a diagnostic change touches its credential boundary.

Normally exclude player controls/visuals, authentication/storage, updater behavior, and unrelated logger callers. Simply calling `Logger` is not a reason to load this whole domain.
