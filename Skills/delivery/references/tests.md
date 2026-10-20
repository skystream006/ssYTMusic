# Delivery test selection

Tests live in
`/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic`.
Use exact class/method filters with
[shared validation commands](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/validation.md).
These are candidate sets, not a mandatory domain-wide run.

| Changed behavior | Smallest relevant existing tests |
| --- | --- |
| Git version calculation / package identity | [BuildVersionTest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic/BuildVersionTest.java) |
| Version comparison, update URL trust or archive/cache policy | [UpdatePolicyTest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic/UpdatePolicyTest.java); select matching policy methods |
| Bounded copy, cancellation, atomic download, byte progress | [UpdateClientTest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic/UpdateClientTest.java); select affected download methods |
| Header rebind/detach only | [AppUpdaterProgressTest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic/AppUpdaterProgressTest.java).`reopeningSettingsBindsCurrentProgressAndDismissalReleasesOnlyItsView` |
| Broader updater progress/lifecycle wiring | `AppUpdaterProgressTest`; add `UpdateClientTest` if download reporting changes |
| Header layout | [PreferencesLayoutTest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic/PreferencesLayoutTest.java).`headerKeepsTitleLeftAndCompactUpdateControlsRight` |
| Progress XML | `PreferencesLayoutTest.updateProgressStartsHiddenBelowUpdateControls` |
| Dependency/SDK/build/package contracts | Build/lint and broader regression from shared validation; add affected runtime-owner tests |
| Workflow-only or Skill documentation edits | Review configuration/links/metadata; no dedicated workflow or Skill test harness exists |

`BuildVersionTest` actually invokes Git and checks generated BuildConfig.
`UpdatePolicyTest` exercises pure policy; `UpdateClientTest` exercises helpers,
bounds and cancellation, not a live release download.
`AppUpdaterProgressTest` reads source structure and layout tests parse XML.
No existing test proves installer/permission/lifecycle behavior on Android.
Use the affected device cases in
[updater](/home/runner/work/ssYTMusic/ssYTMusic/Skills/delivery/references/updater.md).
If changing a contract without behavioral coverage, add an appropriate regression
within the existing test setup rather than weakening structural guards.
