# Statistics and passive gesture observation

## Source anchors

- [StatsMonitor](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/StatsMonitor.java): `setEnabled`, `onStart`, `onStop`, `destroy`, `updateSampling`, `SamplingSession.sample`, `formatBytes`, `formatRate`.
- [StatsValues](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/StatsValues.java): `UNAVAILABLE`, `bytesPerSecond`, `NetworkTracker.sample`, `storageBytes`.
- [MainActivity](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java): statistics calls in `onStart`/`onStop`/`onDestroy` and `setStatsForNerdsEnabled`; `gestureDiagnosticsScript`, `updateGestureLogging`, injection call in `injectPageScripts`, `PlaybackBridge.logDiagnostic`.
- [Activity layout](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/layout/activity_main.xml): `stats_overlay`/`stats_values`; [settings layout](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/layout/dialog_preferences.xml): `stats_for_nerds_switch`; [strings](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/values/strings.xml): `stats_*`.
- [Gesture observer](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/gesture_diagnostics.js): `enabled`, `describe`, `ancestors`, `hitTest`, `capture`, `__ssmusicGestureHitTest`.
- [PlaybackWebView](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/PlaybackWebView.java): only diagnostic tail of `dispatchTouchEvent`, `logTouchTarget`, and diagnostic messages around cancellation. Touch recognition/consumption is playback-owned.

## Statistics contracts

Sampling requires enabled **and** started **and** not destroyed. It uses a per-session worker with one-second fixed delay; storage is refreshed approximately every 30 seconds. Stop/disable destroys the sampling session and removes posted work. Identity checks reject stale results before posting and before updating UI; a new session gets new network baselines.

Memory is this process's PSS; network counters are application-UID counters, not guaranteed totals for every WebView renderer. Rates use elapsed time and independent receive/transmit baselines. First samples, unsupported/reset counters, and invalid elapsed time are unavailable, not zero. UI renders the unavailable resource. Storage traversal deduplicates canonical entries, excludes linked entries/cycles, and returns unavailable for interruption/read errors; do not follow arbitrary symlinks or scan on the UI thread.

## Gesture contracts

The page observer installs once on the top-level HTTPS music origin and records only when logging is enabled, events are trusted, and fewer than 16 deferred observations are pending. Capture/bubble listeners are passive; deferred observation records cancellation/bubble outcome without consuming or synthesizing events.

Log only bounded structural information: element tag/state/style/geometry, up to four hit-test nodes/ancestors, event metadata. Do not add page text, form values, IDs/classes, hrefs, or page URLs to observer output. Moves are not page events here; native diagnostics aggregate move counts and log non-move outcomes.

Native hit testing uses finite viewport fractions and checks page identity before evaluating/accepting a response. Diagnostic additions must preserve the existing dispatch result and playback-owned swipe cancellation behavior. This observer does not repair `pointer-events`.

## Conditional boundaries and device checks

Consult [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) only if changing gestures/bridge behavior, or [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) for pointer recovery or native overlay placement. Normally exclude media actions, auth, and updater work.

Check stats enable/disable, background/foreground, recreation, loading/unavailable values, and no stale updates after stop. Compare touch behavior with logging off/on in both modes: scrolling, taps, cancelled/multitouch input, modal/fullscreen/player states, and navigation during async hit testing. Inspect output for sensitive content. [Existing gesture tests](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/references/tests.md) are structural, not proof of Chromium event-dispatch behavior.
