package com.skystream.ssmusic;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashSet;
import java.util.Set;

import org.junit.Test;

public class PageElementBlockTest {
    @Test
    public void allSevenOptionsHaveStableIndependentKeysAndRequestedDefaults() {
        Set<String> keys = new HashSet<>();
        Set<Integer> ids = new HashSet<>();
        assertEquals(7, PageElementBlock.values().length);
        for (PageElementBlock block : PageElementBlock.values()) {
            assertTrue(keys.add(block.preferenceKey()));
            assertTrue(ids.add(block.switchId));
            assertEquals("block_youtube_" + block.scriptKey, block.preferenceKey());
            assertEquals(block != PageElementBlock.THUMBNAILS && block != PageElementBlock.RECOMMENDED
                            && block != PageElementBlock.DISTRACTIONS,
                    block.defaultEnabled);
        }
    }

    @Test
    public void savedValuesDriveBothTheUiAndScriptAndChangesDoNotReloadPlayback() throws Exception {
        String activity = activity();
        assertTrue(activity.contains("blockSwitch.setChecked(preferences.getBoolean("
                + "block.preferenceKey(), block.defaultEnabled))"));
        assertTrue(activity.contains(".append(preferences.getBoolean("
                + "block.preferenceKey(), block.defaultEnabled))"));
        assertTrue(activity.contains("preferences.edit().putBoolean(block.preferenceKey(), checked).apply()"));
        String update = activity.substring(activity.indexOf("private void updatePageElementScript()"),
                activity.indexOf("private void showPreferences()"));
        assertTrue(update.contains("pageElementScriptHandler.remove()"));
        assertTrue(update.contains("WebViewFeature.DOCUMENT_START_SCRIPT"));
        assertTrue(update.contains("\"https://music.youtube.com\""));
        assertTrue(update.contains("SiteScope.isPlaybackUrl(webView.getUrl())"));
        assertTrue(update.contains("webView.evaluateJavascript(script, null)"));
        assertFalse(update.contains(".reload()"));
    }

    @Test
    public void scriptsRunAtDocumentStartAndReapplyAfterLoadForOlderWebViews() throws Exception {
        String activity = activity();
        String configure = activity.substring(activity.indexOf("private void configureWebView()"),
                activity.indexOf("private boolean isKidModeEnabled()"));
        assertTrue(configure.contains("updatePageElementScript()"));
        assertTrue(configure.contains("webView, AD_JSON_PRUNE_SCRIPT, origins"));
        String inject = activity.substring(activity.indexOf("private void injectPageScripts("),
                activity.indexOf("private void scheduleAppLogoReinjection("));
        assertTrue(inject.contains("view.evaluateJavascript(pageElementScript(), null)"));
        assertTrue(inject.contains("view.evaluateJavascript(AD_JSON_PRUNE_SCRIPT, null)"));
        assertTrue(inject.indexOf("pageElementScript()") < inject.indexOf("AD_JSON_PRUNE_SCRIPT"));
    }

    private static String activity() throws Exception {
        return new String(Files.readAllBytes(Paths.get(
                "src/main/java/com/skystream/ssmusic/MainActivity.java")), StandardCharsets.UTF_8);
    }
}
