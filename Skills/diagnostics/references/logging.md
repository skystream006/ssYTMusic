# Logging, retention, and crash ordering

## Source anchors

- [Logger](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/Logger.java): `Mode.fromPreference`, `init`, `enable`, `setEnabled`, `write`, `queueReactiveEntry`, `executeFileOperation`, `readCurrentLog`, `clear`, `appendCrashToFile`, `appendToFile`, `installCrashHandler`.
- [LogFormat](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/LogFormat.java): `entry`, `reactiveEntry`, `sanitize`, `stackTraceOf`, `indent`.
- [ReactiveLogFile](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/ReactiveLogFile.java): `append`, `bound`, `prefix`, `retain`.
- [LogViewer](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/LogViewer.java): `show`.
- [MainActivity](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java): logging subsection of `showPreferences`, `setLoggingExpanded`, `updateLoggingSummary`, `shareLog`, `clearLog`.
- [Settings layout](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/layout/dialog_preferences.xml): `logging_settings` and `log_actions`; [strings](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/values/strings.xml): logging modes/summaries and log messages; [provider paths](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/xml/file_paths.xml): log-sharing scope.

## Invariants

- Logging is optional and disabled by default. Enabling requires a mode choice; cancel leaves it off. Enabled state and mode persist together. Missing/unrecognized mode values retain Full behavior.
- Full logging rotates the active file to one backup when its existing size exceeds 512 KiB before append; this is not a strict post-write size cap. Reactive logging retains the latest 100 complete entries, each bounded to 16 Ki characters, with Unicode-safe truncation and no retained Full-mode backup.
- Entries have one unindented header; **every** throwable/caller-stack continuation is tab-indented, including multiline exception text. Reactive parsing relies on that boundary, not timestamps or line counts. Preserve indented truncation markers; do not confuse 100 entries with 100 lines.
- Reactive replacement writes a sibling pending file then renames it; incomplete trailing messages are ignored. Retention works after restart without an in-memory index.
- Normal writes, reads, and clear operations share one executor even when logging is disabled. Reads/clears seal pending reactive batches; the pending backlog itself is bounded. Clear is asynchronous, and the UI logs a new “cleared” event when enabled.
- Crash append takes queue lock then file lock, marks `crashLoggingStarted`, freezes queued/detached batches, and writes synchronously without awaiting the executor. Keep the same serialization/lock order; an executor-thread crash must not wait on itself. Delegate to the previous uncaught handler afterward. Do not claim this captures OS kills or native crashes.
- Disabled warnings/errors may produce one enable-logging reminder; routine debug/gesture messages remain silent. `sanitize` normalizes/truncates text, **not** secrets.
- Viewer reads an off-UI-thread snapshot and ignores callbacks for closed/destroyed UI. Share grants read access through the existing FileProvider; it shares the current file, not a newly frozen snapshot.

## Boundaries and device checks

Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) for settings placement only, [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) for changed playback behavior, or [music-server](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/SKILL.md) if credential handling is implicated. Normally exclude ordinary logger callers.

Check mode-picker cancellation, both modes across restart, independently expanded sections, refresh/view/share after disabling, clear ordering, and a controlled Java crash on a disposable test instance. Verify Full/Reactive limits and post-crash retention without promising OS-level durability. Choose [tests](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/references/tests.md) before escalating validation.
