# Authentication and encrypted records

## Source anchors

- [MusicServerAuth](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MusicServerAuth.java): `normalizeOrigin`, `newPending`, `challenge`, `loginUrl`, `parseExpiry`, `Pending.isExpired`, `Pending.consumeCallback`.
- [MusicServerClient](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MusicServerClient.java): constructor restore, `beginLogin`, `completeLogin`, `exchange`, `cancelLogin`, `expireRecords`, `clearPending`, `clearSession`, `invalidateStoredRecords`.
- [MusicServerStore](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MusicServerStore.java): constructor, `read`/`write`/`clear`, `keyStore`, `wrappingCipher`, `Session`.
- [MusicServerPreferences](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MusicServerPreferences.java): `showLogin`, `handleIntent`; [MainActivity](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/java/com/skystream/ssmusic/MainActivity.java): only `onCreate`, `onNewIntent`, `urlFromIntent` callback integration.
- [Manifest](/home/runner/work/ssYTMusic/ssYTMusic/app/src/main/AndroidManifest.xml): callback VIEW filter. Preserve its existing identifier; do not infer a rename from branding.

## Contracts

- Accept a normalized HTTPS origin, not a URL containing credentials, a non-root path, query, or fragment. PKCE uses independent random verifier/state values and an S256 challenge; the verifier is not in the browser URL.
- Persist pending origin/verifier/state/start time before opening the external browser. Callback exchange always uses that **saved origin**, not callback-supplied host data. Pending login expires after ten minutes, including clock rollback rejection; sessions use server-provided expiry.
- `consumeCallback` validates the exact redirect shape, exactly one code/state pair, token syntax, and constant-time state comparison. A valid callback consumes the in-memory request once; invalid callbacks do not consume it. Clear the persisted verifier **before** sending the authorization code.
- `handleIntent` clears callback data from the activity intent before exchange. Warm-start handling precedes navigation/logging; cold-start normalization rejects the callback scheme. Do not add callback/code/verifier/token URLs to WebView, exception messages, or logger output. Sanitizing whitespace is not credential redaction.
- Records are app-private, under `getNoBackupFilesDir`, and use `AtomicFile`, bounded reads, fresh AES-GCM keys/nonces, record-name AAD, and Android Keystore RSA key wrapping. API 23+ uses OAEP; API 21–22 uses the existing `KeyPairGeneratorSpec`/PKCS1 compatibility path. Do not introduce an API-23-only assumption.
- Corrupt/unreadable/expired records clear client state. Failed deletion attempts invalidate the key; failed invalidation still fails closed **in memory**. Do not claim guaranteed disk erasure or hardware-backed storage on every device.

## Boundaries and checks

Consult [webview-shell](/home/runner/work/ssYTMusic/ssYTMusic/Skills/webview-shell/SKILL.md) only for intent ordering, and [diagnostics](/home/runner/work/ssYTMusic/ssYTMusic/Skills/diagnostics/SKILL.md) if changing diagnostic capture. Normally exclude Google WebView sign-in and external server source.

With an authorized test server, check browser cancellation/unavailability, cold/warm callbacks, malformed/replayed/expired callbacks, process restart during pending login, session restore/expiry, logout, and unavailable/corrupt keys on API 21–22 and a modern API. Verify callback data never appears in page navigation or logs. Existing JVM tests exercise parsing/PKCE, not real Keystore persistence or external-browser delivery; see [tests](/home/runner/work/ssYTMusic/ssYTMusic/Skills/music-server/references/tests.md).
