# Runtime APK updates

Read [common contracts](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md)
once; build/version generation stays in the
[build reference](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/build-release.md).

## Source map

| File | Starting symbols / responsibility |
| --- | --- |
| [AppUpdater](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/AppUpdater.java) | `checkForUpdates`, `checked`, `selectApk`, `downloaded`, `verifyArchive`, `maybeInstall`; activity-owned UI/state machine |
| AppUpdater, same file | Constructor, `onResume`, `onPause`, `destroy`; `bindProgress`, `renderProgress`, `downloadProgress`; persisted state and view lifecycle |
| [UpdateClient](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/UpdateClient.java) | `latestRelease`, `download`, `open`, `copy`, `saveAtomically`, `cancel`; bounded HTTPS and private-file writes |
| [UpdatePolicy](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/UpdatePolicy.java) | `LATEST_URL`, `compareVersions`, `isAllowedUrl`, `archiveMatches`; trust/version rules |
| [UpdateFileProvider](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/UpdateFileProvider.java) | Android provider subclass |
| [Provider paths](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/xml/update_file_paths.xml) | Only the private updates directory |
| [Preferences header](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/layout/preferences_header.xml) | `check_updates_button`, `app_version`, `update_download_progress`, progress bar/text |
| [Strings](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/values/strings.xml) | `update_*` messages |
| [MainActivity](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java) | `onCreate`, updater lifecycle forwarding, update-button/progress region of `showPreferences` only |

## Contracts

- Public updater entry points run on the UI thread; network/file work runs on
  its executor and posts UI results. Destroy cancels requests and releases views.
- A fresh activity launch checks for availability without downloading. Manual
  checks can download/install. Existing persisted pending-install state is a
  separate path: the constructor restores it **without a saved-instance gate**.
- Stable numeric versions only; metadata uses the exact repository endpoint.
  Initial APK URLs must be trusted repository release URLs; redirects remain
  explicitly validated. Keep HTTPS, response/deadline/size limits and cancellation.
- Require one unambiguous APK asset. Write complete downloads atomically; remove
  partial results on failure. Progress reflects written bytes and posts at
  bounded percentage changes rather than on every buffer.
- Verify package identity, strictly newer version code/name and agreement with
  the selected release before installation or cache reuse. Android's installer
  enforces signing-certificate continuity; the app is not a signature verifier.
- Installer handoff requires a resumed, non-finishing activity, requested
  installation and verified APK. Respect unknown-source permission and user
  confirmation; do not silently install or loop permission prompts.
- Successful installer handoff sets `pending`, `permission_requested` and
  `auto_install` false. It does not delete the APK at that point. Do not infer
  that installer launch proves installation succeeded.
- Closing Settings releases only its header via attachment callbacks, not the
  download. Reopening binds current progress. Preserve the shared dialog dismiss
  contract documented in common; do not replace it with updater cleanup.

## Adjacent domains and device checks

Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md)
for shared dialog/activity composition changes, not ordinary internal progress
changes. Consult Music Server only if its dialog cleanup contract is affected.
Normally exclude page scripts, playback logic, server credentials and logs.

Use the [test map](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/tests.md).
On-device, exercise close/reopen Settings during download, foreground/background,
activity recreation, cancellation/failure, permission denial and return, installer
cancellation, and retry as relevant. JVM structural checks do not cover those
Android transitions or the live GitHub service.
