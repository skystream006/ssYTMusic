# Media presentation and gestures

Follow the [shared contract](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md), [validation guidance](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/validation.md), and behavior-specific [test map](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/references/tests.md). These are playback concerns, not generic UI work. Search the named symbols before reading the shared activity.

## Native/page swipe handshake

- [PlaybackWebView.dispatchTouchEvent/checkMediaHit/dispatchMediaSwipe](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/PlaybackWebView.java#L51) receives Android touches; [MediaSwipeGesture.start/resolveEligibility/move/finish](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MediaSwipeGesture.java#L21) owns recognition. Both native eligibility and the page action must match the current gesture generation and URL. A delayed hit test cannot take over a drag already passed to WebView or authorize a later touch.
- Keep single-pointer, dominant-axis, density-based distance thresholds and permanent cancellation for reversal, diagonal motion, navigation, pointer changes, and Android cancellation. Send Chromium a synthetic cancellation when intercepting, never an `UP` that could click media. Do not add parallel DOM swipe listeners.
- [MainActivity.videoDisplayScript: __ssmusicNativeSwipeStart/__ssmusicNativeSwipeEnd](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java#L718) converts padded-view fractions into the visible CSS viewport, including viewport offsets. Eligibility uses the **media container's bounds**, not hidden/transparent video bounds, and requires connected expanded/fullscreen presentation at both ends.
- Preserve controls: reject nested native/DOM controls, sliders, tabs, menus, and the thumbnail toggle. A media surface with `role="button"` can accept a swipe; a nested `role="button"` cannot. Left invokes previous, right next, up only Up Next, and down the compact controller's minimize path. Keep end-of-gesture guards before dispatch.

## Compact player

- [compact_player.js: current/geometry/present/compact/expand](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/compact_player.js#L38) scales the existing player and exposes browse content through owned CSS/role markers. Preserve original marker values and remove only owned presentation. Do not clone media, change source/time/play state, mutate site player-state attributes, rewrite history, or bypass Kid mode.
- [minimize and presentation-control interception](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/compact_player.js#L275) target dedicated presentation controls, not transport or arbitrary player-bar content. Unsupported compact geometry leaves normal controls usable; swipe-down may fall back to an eligible native minimize control.
- [update](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/compact_player.js#L195) retains compact CSS through transient zero/hidden geometry; changed media/structure/state invalidates it. [pagehide/pageshow handling](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/compact_player.js#L339) suspends observation, retains cached-page presentation, and cleans up unloaded pages. Thumbnail refresh follows actual geometry changes, not every observer tick.

## Video thumbnails

- [MainActivity.videoDisplayScript](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java#L533) reuses the installed controller's closure on reinjection. Creating a new closure would lose the original opacity bookkeeping and install stale observers.
- [restore/reveal/conceal/place](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java#L612) preserves both original inline opacity **and priority**; reveal restores/removes exactly that property. Only conceal after artwork has loaded; errors or missing artwork reveal the original video.
- Position the cover in untransformed host coordinates, accounting for host border and scroll offsets. Zero-size hosts fall back to the video's own scale before the full-size fallback. Keep artwork observation beyond the player and reconnect without mutation loops.
- [injectPageScripts](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java#L1715) installs Kid mode before presentation and compact before swipe handlers. [onResume](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java#L931) refreshes installed controllers: background playback spoofs page visibility, so page visibility events cannot be the sole recovery mechanism.

## Boundaries and device checks

Consult [kid-mode](/home/runner/work/ssYTMusic/ssYTMusic/Skills/kid-mode/SKILL.md) for hidden/disabled controls, authorization, or transport restrictions; presentation must never relax them. Consult [lifecycle](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/references/lifecycle.md) when touching background/resume behavior. Branding, non-media touch handling, and generic settings are excluded; consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) only if the change also affects those surfaces.

On device, target the changed behavior in mobile and desktop site modes:

- Swipe expanded media versus nested controls, including a role-button media surface; try diagonals, reversal, multitouch, rapid navigation, and delayed eligibility. Controls must remain clickable; no late gesture may dispatch.
- Compact/expand while playing and paused; browse, rotate, background/resume, and enter/exit fullscreen. Audio/position must survive; transient bounds must not expose the full player.
- Toggle thumbnails, change artwork, simulate missing artwork, reinject, and restore video opacity. Check scaled/bordered/scrolled hosts and absolutely positioned video with a zero-size host. Verify labels/accessibility and that Kid-mode restrictions remain intact.
