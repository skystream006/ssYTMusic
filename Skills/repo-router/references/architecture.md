# Repository architecture

Load for architectural questions or unresolved routing, not every change.
These are context boundaries, not separate build modules. Ownership is detailed
in [routes](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/routes.md).

## Shape

One Android application module, Java/AppCompat native shell, and a remote YouTube
Music application in Chromium WebView. There is no local React frontend, backend,
application database, worker deployment or independent JavaScript build.

```text
Android intents/lifecycle/settings
                |
           MainActivity
                |
     +----------+-------------+------------------+
     |          |             |                  |
 WebView    MusicServer    AppUpdater       Logger/StatsMonitor
     |      Preferences       |
 YouTube        |         UpdateClient + UpdatePolicy
 Music + JS MusicServer       |
     |       Client       GitHub releases
 Playback       |             |
 Bridge     Auth + Store  UpdateFileProvider → Android installer
     |          |
 Playback   external Music Server + browser login
 KeepAlive
 Service
     |
 MediaSession/notification → commands → MainActivity → WebView
```

Kid mode constrains navigation and playback at native and page boundaries.
WebView owns audio output; the service is not a replacement media engine.

## Components and entry points

All Java classes below live in
`/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic`.

| Owner | Files and entry points | Dependencies |
| --- | --- | --- |
| webview-shell | `MainActivity` lifecycle, `MusicWebViewClient`, settings/navigation/ad/branding methods; `AdBlocker`, `NavigationHistory`, `SiteScope`; general `Preferences`/`Urls` methods | Android UI/WebView, restricted-route and playback contracts |
| playback | `PlaybackWebView`, `PlaybackKeepAliveService`, `MediaSwipeGesture`, `SongRefreshCounter`; activity playback script/bridge/commands; playback `Preferences`/`Urls` methods | WebView/page media, Android service/MediaSession, Kid mode |
| kid-mode | `KidModeNavigation`, `KidModePassword`; activity password dialog and document-start setup | Native routes, page membership, playback commands |
| music-server | `MusicServerPreferences`, `MusicServerClient`, `MusicServerAuth`, `MusicServerStore`, `MusicServerUrls` | External HTTPS API/browser, Keystore, intent/settings hooks |
| diagnostics | `Logger`, `LogFormat`, `ReactiveLogFile`, `LogViewer`, `StatsMonitor`, `StatsValues` | Private files, Android metrics, lifecycle and observational bridge hooks |
| delivery | `AppUpdater`, `UpdateClient`, `UpdatePolicy`, `UpdateFileProvider` | Git-derived build identity, GitHub releases, private files, Android installer |

Page assets:
- `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/compact_player.js`: playback presentation.
- `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/kid_mode.js`: restricted page policy.
- `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/pointer_events.js`: shell interaction recovery.
- `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets/gesture_diagnostics.js`: passive diagnostics.

Embedded scripts remain in
[MainActivity](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java);
route by symbol, not the activity's size. Native UI lives in
`/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res`.
The [manifest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/AndroidManifest.xml)
declares the launcher/singleTop activity, supported links, server callback,
media-playback service, log/update providers and Android permissions.

## State and external configuration

| State/integration | Location or requirement |
| --- | --- |
| App preferences and saved playback position | SharedPreferences through `MainActivity`, with shared legacy names from `Logger` |
| Website sign-in/history/storage | WebView cookies, history and DOM storage; separate from Music Server login |
| Kid mode | Native password verifier plus page sessionStorage for previously verified playlist membership |
| Music Server | Keystore-protected pending/session records in private no-backup storage; user-supplied HTTPS origin with trusted certificate and approved external account |
| Server callback | `com.ssytdlp.app:/oauth/callback`; registered by the manifest and validated/consumed by the integration |
| Diagnostics | Private log files; enabled/mode preferences; foreground-only statistics sampling |
| Updates | `app_updates` preferences, private update files, trusted GitHub endpoints, Android install permission/consent |

`PASSKEY_ORIGIN` is configuration on the external Music Server, not an app
environment variable. WebView document-start support is required for Kid mode;
account navigation also depends on cookies, allowed hosts and user-agent choice.

## Build and tests

Sources of truth:
[settings](/home/runner/work/ssYTMusic/ssYTMusic/settings.gradle),
[root build](/home/runner/work/ssYTMusic/ssYTMusic/build.gradle),
[app build](/home/runner/work/ssYTMusic/ssYTMusic/app/build.gradle),
[Gradle properties](/home/runner/work/ssYTMusic/ssYTMusic/gradle.properties),
[wrapper configuration](/home/runner/work/ssYTMusic/ssYTMusic/gradle/wrapper/gradle-wrapper.properties).

The inspected build uses Gradle 8.7, AGP 8.5.2, JDK 17 in release CI, Java 8
source/target, Android min 21 and compile/target 34. AppCompat 1.6.1 and WebKit
1.11.0 are production dependencies; JUnit 4.13.2 is the test dependency.
Recheck the configuration before dependency work; these values are not upgrade
instructions. Full Git history is required for version calculation.

The 35 JVM test classes mix pure helper behavior with structural Java/JS/XML
checks. No separate instrumentation suite or JavaScript test runner is present.
Every component shares the same build; use its domain test map and
[central commands/coverage limitations](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/validation.md).

## Release automation and documentation

- [Manual Android Release](/home/runner/work/ssYTMusic/ssYTMusic/.github/workflows/manual-release.yml):
  manual dispatch, full-history latest-main checkout, tests/debug APK build,
  metadata-derived version, artifact upload and release creation.
- [Cleanup Releases](/home/runner/work/ssYTMusic/ssYTMusic/.github/workflows/cleanup-releases.yml):
  scheduled/manual retention of five newest releases and associated tag cleanup.
- [README](/home/runner/work/ssYTMusic/ssYTMusic/README.md): user behavior and build
  documentation. Its Build section mentions an “Android APK” workflow absent
  from the inspected checkout; do not invent that workflow or assume PR CI exists.

No separate Skills for authentication, persistence, shared helpers or tests:
their contracts stay with the feature owners above. Exclusions and stable
identifier contracts are centralized in
[common](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/common.md).
