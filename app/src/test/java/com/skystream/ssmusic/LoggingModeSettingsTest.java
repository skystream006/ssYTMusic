package com.skystream.ssmusic;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.junit.Test;

public class LoggingModeSettingsTest {
    @Test
    public void pageElementsStartCollapsedAndStillAllowManualToggling() throws Exception {
        String source = source("MainActivity");
        String section = source.substring(source.indexOf("TextView blockElementsButton ="),
                source.indexOf("Switch kidModeSwitch"));
        assertTrue(section.contains(
                "setBlockElementsExpanded(blockElementsButton, blockElementsSettings, false);"));
        assertTrue(section.contains("blockElementsButton.setOnClickListener"));
        assertTrue(section.contains(
                "boolean expanded = blockElementsSettings.getVisibility() != View.VISIBLE;"));
        assertTrue(section.contains(
                "setBlockElementsExpanded(blockElementsButton, blockElementsSettings, expanded);"));
    }

    @Test
    public void loggingAndAdvancedNoLongerHaveExpansionState() throws Exception {
        String source = source("MainActivity");
        assertFalse(source.contains("setAdvancedExpanded"));
        assertFalse(source.contains("setLoggingExpanded"));
        assertFalse(source.contains("R.id.advanced_settings"));
        assertFalse(source.contains("R.id.logging_settings"));
    }

    @Test
    public void pageElementsExpansionKeepsVisibilityLabelAndAccessibilityInSync() throws Exception {
        String source = source("MainActivity");
        String helper = source.substring(source.indexOf("private void setBlockElementsExpanded("),
                source.indexOf("private void updateLoggingSummary("));
        assertTrue(helper.contains("settings.setVisibility(expanded ? View.VISIBLE : View.GONE)"));
        assertTrue(helper.contains("button.setText(expanded\n"
                + "                ? R.string.block_page_elements_expanded : R.string.block_page_elements_collapsed)"));
        assertTrue(helper.contains("button.setContentDescription(getString(expanded\n"
                + "                ? R.string.block_page_elements_collapse_accessibility\n"
                + "                : R.string.block_page_elements_expand_accessibility))"));
    }

    @Test
    public void switchStaysOffUntilSelectionAndCancelDoesNotEnableLogging() throws Exception {
        String source = source("MainActivity");
        String listener = source.substring(source.indexOf("Switch loggingSwitch"),
                source.indexOf("R.id.share_log_button"));
        assertTrue(listener.contains("if (checked == Logger.isEnabled())"));
        assertTrue(listener.indexOf("loggingSwitch.setChecked(false)")
                < listener.indexOf(".setItems(R.array.logging_modes"));
        assertTrue(listener.contains("which == 1 ? Logger.Mode.REACTIVE : Logger.Mode.FULL"));
        assertTrue(listener.contains(".setNegativeButton(android.R.string.cancel, null)"));
        assertTrue(listener.contains("Logger.setEnabled(MainActivity.this, false);\n"
                + "                updateGestureLogging();"));
        assertTrue(listener.contains("which == 1 ? Logger.Mode.REACTIVE : Logger.Mode.FULL);\n"
                + "                        updateGestureLogging();"));
    }

    @Test
    public void modeAndEnabledStateArePersistedTogetherAndRestored() throws Exception {
        String source = source("Logger");
        assertTrue(source.contains("preferences.getBoolean(KEY_LOGGING_ENABLED, false)"));
        assertTrue(source.contains("Mode.fromPreference(preferences.getString(KEY_LOGGING_MODE, null))"));
        assertTrue(source.contains(".putBoolean(KEY_LOGGING_ENABLED, value)\n"
                + "                    .putString(KEY_LOGGING_MODE, mode.name())"));
        assertTrue(source.contains("if (file.length() > LogFormat.MAX_FILE_BYTES)"));
        assertTrue(source.contains("new FileOutputStream(file, true)"));
        assertTrue(source.contains("appendToFile(entry)"));
    }

    private static String source(String name) throws Exception {
        return new String(Files.readAllBytes(Paths.get(
                "src/main/java/com/skystream/ssmusic/" + name + ".java")), StandardCharsets.UTF_8);
    }
}
