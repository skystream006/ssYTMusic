---
name: kid-mode
description: Use when changing Kid mode enable/unlock passwords, verifier persistence, fail-closed navigation, playlist membership authorization, autoplay restrictions, protected controls, or the Kid-mode Home overlay.
---

# Kid mode

Read the [shared contract](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md) once, then the [policy reference](/home/runner/work/ssYTMusic/ssYTMusic/Skills/kid-mode/references/policy.md). Use the [test map](/home/runner/work/ssYTMusic/ssYTMusic/Skills/kid-mode/references/tests.md) to select only affected methods/classes and identify device-only gaps.

Kid mode is authoritative for restrictions. Native URL admission is necessary but insufficient: page enforcement must verify actual playlist membership and the currently playing track. Never authorize radio, standalone tracks, or arbitrary queue entries.

Keep password derivation off the UI thread, credentials out of page bridges, and state changes contingent on successful persistence. Retain document-start feature gating and fail-closed navigation.

Find the reference's named symbols before reading the shared activity; do not load its whole file. Consult [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) when changing transport, swipe dispatch, compact presentation, thumbnail controls, or playback restoration. Presentation must not weaken policy. Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) only when shared navigation or native settings/overlay composition changes. Route unrelated integrations through [repo-router](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/SKILL.md); do not expand this task into those domains.
