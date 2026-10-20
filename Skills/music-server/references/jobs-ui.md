# HTTPS jobs and Music Server settings

## Source anchors

- [MusicServerClient](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MusicServerClient.java): `submitJob`, `validJobUrl`, `post`, `readBounded`, `finishHttpFailure`, `finish`, `deliver`, `logout`; `generation`/`active` state.
- [MusicServerUrls](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MusicServerUrls.java): `playlistUrl`, `songUrlForId`, `musicUri`, `parameter`.
- [MusicServerPreferences](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MusicServerPreferences.java): `CURRENT_SONG_SCRIPT`, `sendSong`, `bind`, `refresh`, `update`, `setButton`, `completed`, `destroy`.
- [Settings layout](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/layout/dialog_preferences.xml): `music_server_panel`, status and actions only. [Panel background](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/drawable/bg_preferences_panel.xml): theme-aware fill/rounded corners. [Strings](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/res/values/strings.xml): `music_server_*` entries.

## Transport invariants

- Serialize operations on the client executor; reject concurrent work and job submission during pending login. Restrict jobs to HTTPS music.youtube.com URLs with no user info and only default/443 authority.
- `post` uses HTTPS, disabled redirects/caching, fixed-length JSON, 15-second connect and 20-second read timeouts, and disconnects in `finally`. Token exchange reads at most 65,536 bytes with a 45-second monotonic deadline checked while reading. This is not a hard wall-clock watchdog for every network phase.
- Exchange must return 200 and a valid session with future expiry; job acceptance requires 202. Map 401 to session clearing, 403 to denied access, job 409 to duplicate, and redirects to a final-origin instruction. Do not surface raw server bodies as diagnostics.
- Generation checks reject stale operations. Logout increments generation, disconnects active transport, and clears records; exchange cancellation likewise invalidates in-flight work. This prevents stale client state updates, not rollback of work already accepted remotely.
- No automatic job retries: ambiguous transport failure tells the user to inspect the server before retrying, because a job may already exist.

## UI invariants

- “Send song” selects `#movie_player` and calls `getVideoData()` through `CURRENT_SONG_SCRIPT`, requires media, rejects ended/ad state, and validates the video ID. It does **not** derive the song from the browsing URL or stored playback position. Paused media is not rejected merely for being paused.
- “Send playlist” uses the current eligible playlist URL unchanged; it requires an unambiguous nonempty list parameter. Its button is visible only when logged in and the current page qualifies.
- The open panel refreshes once per second; busy/resolving-song state disables actions. `bind` owns the settings dialog dismiss listener and removes refresh work; `destroy` clears handlers/dialog references. Dismissal is not job cancellation.
- Keep the panel outside Advanced/Logging collapsed sections. Updater header cleanup uses detach callbacks; do not replace the Music Server dismiss listener.

## Boundaries and device checks

Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) only for panel/dialog composition; [playback](/home/runner/work/ssYTMusic/ssYTMusic/Skills/playback/SKILL.md) only for player identity/state changes. Exclude external server implementation and unrelated updater networking.

Check playlist eligibility changing while settings remain open, logged-out/expired/busy states, song selection while browsing a different page, ads/ended/no-player cases, panel dismiss/reopen during requests, and logout during exchange/job work. Use controlled server failures for 401/403/409/redirect, malformed/oversized token responses, timeout, and ambiguous job acceptance; ensure no duplicate automatic submission. See [coverage limits](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/references/tests.md).
