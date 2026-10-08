package com.skystream.ssmusic;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.junit.Test;

/** Structural regression checks for Android Back dispatch and WebView navigation. */
public class MainActivityNavigationTest {
    @Test
    public void systemBackAlwaysUsesSharedNavigationInsteadOfExiting() throws IOException {
        String activity = source();
        String callback = section(activity,
                "getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true)",
                "registerMediaCommandReceiver();");
        assertTrue(callback.contains("public void handleOnBackPressed()"));
        assertTrue(callback.contains("goHistory(false);"));
        assertFalse(activity.contains("public void onBackPressed()"));
        assertFalse(activity.contains("super.onBackPressed()"));
        assertFalse(callback.contains("setEnabled(false)"));
        assertFalse(callback.contains("finish("));
        assertFalse(callback.contains("moveTaskToBack("));
    }

    @Test
    public void settingsBackUsesTheSameNavigation() throws IOException {
        String backButton = section(source(),
                "content.findViewById(R.id.back_button).setOnClickListener",
                "content.findViewById(R.id.forward_button).setOnClickListener");
        assertTrue(backButton.contains("dialog.dismiss();"));
        assertTrue(backButton.contains("goHistory(false);"));
    }

    @Test
    public void historyTakesPriorityAndOnlyBackFallsHomeWhenExhausted() throws IOException {
        String navigation = section(source(), "private void goHistory(boolean forward)",
                "private int historySteps(boolean forward)");
        assertTrue(navigation.contains("int steps = historySteps(forward);"));
        assertTrue(navigation.contains("if (steps != 0) {\n"
                + "            webView.goBackOrForward(steps);\n"
                + "        } else if (!forward) {\n"
                + "            loadUrl(Preferences.homeUrl());\n"
                + "        }"));
        assertFalse(navigation.contains("finish("));
        assertFalse(navigation.contains("moveTaskToBack("));
    }

    @Test
    public void homeFallbackRetainsKidModeNavigationRestrictions() throws IOException {
        String activity = source();
        String load = section(activity, "private void loadUrl(String url)",
                "private void prepareForUrl(String url)");
        assertTrue(load.contains("if (isKidModeEnabled())"));
        assertTrue(load.contains("if (kidModeScriptHandler == null)"));
        assertTrue(load.contains("url = \"about:blank\";"));
        assertTrue(load.contains("else if (!KidModeNavigation.isAllowed(url))"));
        assertTrue(load.contains("url = KidModeNavigation.LIBRARY_URL;"));
        assertTrue(load.indexOf("url = KidModeNavigation.LIBRARY_URL;")
                < load.indexOf("webView.loadUrl(url);"));
    }

    private static String source() throws IOException {
        Path path = Paths.get("src/main/java/com/skystream/ssmusic/MainActivity.java");
        if (!Files.exists(path)) {
            path = Paths.get("app").resolve(path);
        }
        return new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
    }

    private static String section(String source, String start, String end) {
        int startIndex = source.indexOf(start);
        assertTrue("Missing section: " + start, startIndex >= 0);
        int endIndex = source.indexOf(end, startIndex);
        assertTrue("Missing section end: " + end, endIndex > startIndex);
        return source.substring(startIndex, endIndex);
    }
}
