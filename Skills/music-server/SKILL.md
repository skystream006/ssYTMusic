---
name: music-server
description: Use for Music Server browser authentication, PKCE callbacks, encrypted session persistence, bounded HTTPS job submission, or Music Server settings actions and visibility.
---

# Music Server client

Apply the [shared contract](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md) once. This domain owns the Android client, not an external server implementation.

- Read [authentication and storage](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/references/auth-storage.md) for origin validation, pending login, callback consumption, expiry, and Keystore records.
- Read [jobs and settings](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/references/jobs-ui.md) for transport bounds/cancellation, player-derived song identity, playlist visibility, and dialog ownership.
- Use [tests](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/references/tests.md) for focused validation and explicit device-only gaps.

Inspect named methods and Music Server resource sections, not the whole shared activity/settings file. Keep callback codes away from WebView and logger; never retry an ambiguous job automatically.

Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) only for callback entry ordering or native dialog composition. Consult [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) only when changing player identity extraction or media-state assumptions. Consult [diagnostics](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/SKILL.md) only for a diagnostic-contract change, never to expose credentials.

Normally exclude YouTube account authentication, playback control/gesture implementation, updater transport, logging internals, and server-side job execution.
