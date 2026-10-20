# Browsing and navigation

## Read by symbol

- [MainActivity](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java): `onCreate` URL-selection/back-callback section; `onNewIntent`; `urlFromIntent`; `loadUrl`; `prepareForUrl`; `goHistory`; `historySteps`; `MusicWebViewClient.handleUrl`.
- [SiteScope](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/SiteScope.java): `normalizeInAppUrl`, `isGoogleAccountUrl`, `isPlaybackUrl`.
- [Preferences](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/Preferences.java): `homeUrl`, `restoreUrl`, `userAgent`.
- [NavigationHistory](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/NavigationHistory.java): `backSteps`, `forwardSteps`, `normalize`.
- For permissions, read only `configureWebView`, `applyUserAgentForUrl`, `grantWebPermissionsIfAllowed`, `isTrustedPermissionOrigin`, and `onRequestPermissionsResult` in the activity.
- [Manifest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/AndroidManifest.xml): activity VIEW intent filters and capture permission declarations, only when entry-point/permission behavior changes.

## Invariants

- Native settings Home calls `loadUrl(Preferences.homeUrl())`; exhausted Back uses that same gate, not a direct WebView load or activity exit. Forward without history does nothing. Normal history skips equivalent fragment/trailing-slash entries; Kid mode searches only permitted entries.
- `loadUrl` fails closed in Kid mode: missing document-start handler produces `about:blank`; disallowed destinations become Library. `MusicWebViewClient.handleUrl` also checks this before allowing navigation. Do not bypass either gate when adding native controls.
- `SiteScope` upgrades allowed HTTP URLs to HTTPS and rejects non-web schemes/out-of-scope hosts. Google account classification is separate from playback classification: account navigation gets the default WebView user agent; other allowed navigation gets the selected mobile/desktop agent. Account-agent transitions reload through `loadUrl`.
- `prepareForUrl` resets playback state/service and adjusts bridge availability before navigation. Do not treat it as merely a user-agent setter.
- Web capture permissions require a playback/account origin classification **and** the corresponding Android audio/camera permission. Grant only requested, recognized resources; recheck after a runtime permission result. The implementation uses `SiteScope` host classification, not an additional strict HTTPS-origin parser.
- Music Server callbacks are handled before warm-start URL logging; cold-start URL normalization rejects the callback scheme. Never route callback data into browsing.

## Conditional boundaries and device checks

Consult [kid-mode](/home/runner/work/ssYTMusic/ssYTMusic/Skills/kid-mode/SKILL.md) only for policy/gate changes, [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) for `prepareForUrl` lifecycle/bridge changes, or [music-server](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/SKILL.md) for callback ordering. Normally exclude player presentation, encrypted records, and updater networking.

On device, check cold/warm music links, Google sign-in and return in both site modes, duplicate history, exhausted Back, Forward, and Home with Kid mode on/off. Exercise missing document-start support where available and denied/granted camera/microphone requests. Pure URL and source-structure tests do not execute WebView navigation or Android permission dialogs; select checks from [tests](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/references/tests.md).
