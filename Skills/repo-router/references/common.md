# Common contracts

Read once per task, not once per domain. Detailed behavior stays with its owner.

## Roots and discovery

- Checkout: `/home/runner/work/ssYTMusic/ssYTMusic`.
- Java: `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic`.
- Assets: `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/assets`.
- Resources: `/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res`.
- Tests: `/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic`.
- Canonical Skills: `/home/runner/work/ssYTMusic/ssYTMusic/Skills`.

Repository links use this checkout's absolute paths. In another checkout, resolve
the suffix after this root against the actual repository root before opening it;
do not create a second checkout or duplicate Skill tree to satisfy a path.

The supported custom-root integration is **Copilot CLI registration**; see the
[discovery procedure](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/validation.md#skill-discovery-and-documentation-checks).
Root placement alone does not enable discovery. Cloud-agent discovery of this
custom root is **not verified**; no native cloud auto-loading is claimed.
Discovery exposes names/descriptions; read a selected control plane and then only
the necessary references. Do not inject all Markdown into the initial context.

## Compatibility

Preserve `com.skystream.ssmusic`, `ssmusic_prefs`, existing preference keys,
`ssmusicPlayback`, internal `__ssmusic…` hooks, storage names and provider
authorities unless a deliberate migration is part of the request.
Branding is ssYTMusic; a display-name change is not an identifier migration.
Evidence: [build identity](/home/runner/work/ssYTMusic/ssYTMusic/app/build.gradle),
[Logger constants](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/Logger.java),
[bridge registration](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java)
(`setPlaybackBridgeEnabled`), and
[identity regression](/home/runner/work/ssYTMusic/ssYTMusic/app/src/test/java/com/skystream/ssmusic/BuildVersionTest.java).

## Shared-file ownership

- Locate symbols before reading regions of
  [MainActivity](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java).
  Do not load the entire activity simply because multiple domains live there.
- Assign manifest declarations, layouts, strings, preferences and helper methods
  to the behavior being changed. File ownership is not blanket authority.
- `Preferences` splits navigation/user-agent rules from playback persistence;
  `Urls` splits general parsing from thumbnail trust rules. The
  [route map](/home/runner/work/ssYTMusic/ssYTMusic/Skills/repo-router/references/routes.md)
  identifies these seams.
- Settings composition has one dismiss listener:
  [MusicServerPreferences.bind](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MusicServerPreferences.java)
  uses it to stop refresh work. Preserve it;
  [AppUpdater.bindProgress](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/AppUpdater.java)
  releases the header using attachment callbacks instead.

## Working agreement

Start with one behavior, one reference, and the nearest source/test. Expand only
for an actual dependency; consult the adjacent owner before changing a shared
contract. Existing Logger calls do not require the diagnostics implementation.
Keep pure policy helpers JVM-testable and Android/page effects at their existing
boundaries. Do not introduce a module/package refactor to use these Skills.
Preserve UI-thread handoffs, cancellation and lifecycle cleanup in affected code.

Normally exclude caches, generated outputs, IDE/local SDK files, keystore bytes,
runtime credentials/logs/cookies, binary artwork and the loose root image.
Open artwork only for a relevant branding task. External YouTube Music and Music
Server implementations are outside this repository. Read only relevant sections
of the README, manifest and resources.
