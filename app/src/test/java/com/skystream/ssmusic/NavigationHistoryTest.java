package com.skystream.ssmusic;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import java.util.Arrays;
import java.util.Collections;

public class NavigationHistoryTest {

    @Test
    public void backSkipsDuplicateEntries() {
        assertEquals(-2, NavigationHistory.backSteps(Arrays.asList(
                "https://music.youtube.com/",
                "https://music.youtube.com/watch?v=a",
                "https://music.youtube.com/watch?v=a#player"), 2));
    }

    @Test
    public void forwardSkipsDuplicateEntries() {
        assertEquals(2, NavigationHistory.forwardSteps(Arrays.asList(
                "https://music.youtube.com/",
                "https://music.youtube.com/",
                "https://music.youtube.com/watch?v=a"), 0));
    }

    @Test
    public void returnsZeroWhenNoDifferentEntryExists() {
        assertEquals(0, NavigationHistory.backSteps(Arrays.asList(
                "https://music.youtube.com/",
                "https://music.youtube.com/#home"), 1));
    }

    @Test
    public void backHasNoTargetBeforeLoadingOrAfterDirectLaunch() {
        assertEquals(0, NavigationHistory.backSteps(Collections.emptyList(), -1));
        assertEquals(0, NavigationHistory.backSteps(Collections.singletonList(
                "https://music.youtube.com/"), 0));
        assertEquals(0, NavigationHistory.backSteps(Collections.singletonList(
                "https://music.youtube.com/watch?v=a"), 0));
    }

    @Test
    public void backHasNoTargetAtFirstEntryEvenWithForwardHistory() {
        assertEquals(0, NavigationHistory.backSteps(Arrays.asList(
                "https://music.youtube.com/",
                "https://music.youtube.com/watch?v=a"), 0));
    }

    @Test
    public void forwardHasNoTargetAtEndOfHistory() {
        assertEquals(0, NavigationHistory.forwardSteps(Arrays.asList(
                "https://music.youtube.com/",
                "https://music.youtube.com/watch?v=a"), 1));
    }
}
