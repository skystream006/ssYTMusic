# Routing and ownership

Use metadata first. This table resolves ambiguous symptoms; it is not a
requirement to load every domain. Java classes are files within
`/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic`.

## Shared symbols and symptoms

| Symptom or contract | Lead Skill | First source anchors |
| --- | --- | --- |
| Back/Home, supported links, Google account navigation, permissions | [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) | `NavigationHistory`; `SiteScope`; `MainActivity.goHistory`, `loadUrl`, `configureWebView`, `MusicWebViewClient`, `grantWebPermissionsIfAllowed` |
| Native settings composition, themes, site mode, app branding | webview-shell | `MainActivity.showPreferences`, `applyTheme`, `applyUserAgentForUrl`, `APP_LOGO_SCRIPT`; relevant XML control |
| Ads, Open app banner, non-player touch blocking | webview-shell | `AdBlocker`; `AD_HIDING_SCRIPT`, `AD_JSON_PRUNE_SCRIPT`, `OPEN_APP_HIDING_SCRIPT`; `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/pointer_events.js` |
| Audio stops in background, notification controls, restoration | [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) | `PlaybackKeepAliveService`; `PlaybackWebView.onWindowVisibilityChanged`; `BACKGROUND_PLAYBACK_SCRIPT`, `PlaybackBridge`, `applyMediaCommand` |
| Player swipes, compact mode, thumbnail/video geometry | playback | `MediaSwipeGesture`; `PlaybackWebView.checkMediaHit`; `videoDisplayScript`; `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/compact_player.js` |
| Listening refresh / repeated song counts | playback | `SongRefreshCounter`; `SONG_REFRESH_SCRIPT`, `backgroundSongCheck`, `PlaybackBridge.songStarted` |
| Restricted navigation/playback, Kid password dialog | [kid-mode](/home/runner/work/ssYTMusic/ssYTMusic/Skills/kid-mode/SKILL.md) | `KidModeNavigation`, `KidModePassword`; `isKidModeEnabled`, `updateKidModeScript`, `showKidModePasswordDialog`; `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/kid_mode.js` |
| Server login, callback, expiry, encrypted sessions | [music-server](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/SKILL.md) | `MusicServerAuth`, `MusicServerClient`, `MusicServerStore`, `MusicServerPreferences.handleIntent` |
| Send song/playlist, server button visibility | music-server | `MusicServerPreferences.CURRENT_SONG_SCRIPT`, `sendSong`, `bind`, `update`; `MusicServerUrls`; `MusicServerClient.submitJob` |
| Crash/retention/sharing, statistics, observing touch delivery | [diagnostics](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/SKILL.md) | `Logger`, `LogFormat`, `ReactiveLogFile`, `LogViewer`, `StatsMonitor`, `StatsValues`; `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/gesture_diagnostics.js` |
| Build/version/signing/releases, APK update/progress/install | [delivery](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/SKILL.md) | `/home/runner/work/ssYTMusic/ssYTMusic/app/build.gradle`; `AppUpdater`, `UpdateClient`, `UpdatePolicy`, `UpdateFileProvider` |

### Helpers, resources and tests with multiple owners

- `Preferences.userAgent`, `homeUrl`, `restoreUrl`: webview-shell.
  `playbackIdentityUrl`, `buildPersistedPlaybackUrl`, `isSamePlaybackItem`: playback.
- `Urls.hostOf`, `pathOf`, `queryParameterOf`: webview-shell general parsing;
  thumbnail host/HTTPS validation and sanitization: playback.
- `MainActivity.injectPageScripts`: shared orchestration. Change the owning script
  first; consult other owners only if ordering/scope or a hook contract changes.
- `MainActivity.onCreate/onNewIntent`: shell owns entry orchestration, Music Server
  owns callback consumption, Kid mode owns restricted entry, delivery owns updater
  startup, playback owns restored media state.
- `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/values/strings.xml` and
  `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/layout/dialog_preferences.xml`:
  route by control/resource name. Shell owns layout composition, not all behavior.
- `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/AndroidManifest.xml`:
  navigation/activity permissions → shell; service/media permissions → playback;
  callback → Music Server; log provider → diagnostics; installer/update provider
  and package/SDK configuration → delivery.
- `MainActivityAppLogoTest` contains branding **and** thumbnail/swipe regressions.
  `PreferencesLayoutTest` contains controls for multiple domains. Select methods
  from the owner's test reference rather than treating either as shell-only.

## Conditional dependency map

| Lead | Consult | Condition |
| --- | --- | --- |
| webview-shell | playback | Injection order, page transitions, player interaction or lifecycle contract changes |
| webview-shell | kid-mode | Accepted routes, Home, document-start setup or recovery guards change |
| playback | kid-mode | Commands or DOM changes can affect restricted playback |
| playback | webview-shell | Navigation, injection or shared preference composition changes |
| kid-mode | playback / webview-shell | Media/skip authorization / native routes, deep links or settings integration change |
| music-server | webview-shell / playback | Callback or shared settings contract / current-track identification changes |
| diagnostics | playback / webview-shell | Touch/bridge observation / overlay or settings lifecycle changes |
| delivery | webview-shell | Update presentation or activity integration changes |
| any domain | delivery | Dependency, SDK, packaging or installation contract changes |

Keep each owner authoritative. Form the union of impacted tests and deduplicate;
do not automatically load every dependency's references or all of its tests.

## Five routing acceptance scenarios

Tests below live in
`/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic`.
They are proposed filters, not claims that the tests execute Android behavior.

| Request | Initial Skills and source | Expansion condition | Initial validation |
| --- | --- | --- | --- |
| Hide the relocated Open app banner | webview-shell; `OPEN_APP_HIDING_SCRIPT` | playback only if selectors overlap player controls | `MainActivityOpenAppTest` |
| Next-song controls escape the selected playlist in Kid mode | kid-mode + playback; membership/skip guards, `applyMediaCommand` | webview-shell if native navigation enforcement changes | `KidModeScriptTest`; changed command/gesture regression; device notification test |
| Send song exports the browsed playlist instead of the playing track | music-server; `CURRENT_SONG_SCRIPT`, `MusicServerUrls` | playback only if current-track contract changes | `MusicServerUrlsTest`, `MusicServerPreferencesTest` |
| Reactive logging splits multiline crash entries | diagnostics; `LogFormat`, `ReactiveLogFile`, crash writes | none by default | `LogFormatTest`, `ReactiveLogFileTest`, `LoggerCrashTest` |
| Update download progress disappears after reopening Settings | delivery; `bindProgress`, `renderProgress` | shell if dialog composition changes; music-server only if dismiss cleanup is affected | `AppUpdaterProgressTest`; relevant `PreferencesLayoutTest` methods; device lifecycle check |

For the Kid mode scenario: policy → page enforcement → native/notification
commands → regression/device checks. For update progress: updater state → header
attachment → shared composition only if necessary → progress/layout/device checks.
No scenario should initially load unrelated authentication, workflows or the
entire test suite.
