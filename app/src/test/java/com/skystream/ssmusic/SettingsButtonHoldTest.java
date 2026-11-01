package com.skystream.ssmusic;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.TreeMap;

import org.junit.Test;

public class SettingsButtonHoldTest {
    private final FakeScheduler scheduler = new FakeScheduler();
    private int hides;
    private int shows;
    private final SettingsButtonHold hold = new SettingsButtonHold(
            scheduler, () -> hides++, () -> shows++);

    @Test
    public void hidesAtExactlyThreeSecondsAndRestoresFiveSecondsLater() {
        hold.press();
        scheduler.advance(2999);
        assertFalse(hold.isHidden());
        assertEquals(0, hides);
        scheduler.advance(1);
        assertTrue(hold.isHidden());
        assertEquals(1, hides);
        scheduler.advance(4999);
        assertTrue(hold.isHidden());
        assertEquals(0, shows);
        scheduler.advance(1);
        assertFalse(hold.isHidden());
        assertEquals(1, shows);
        assertTrue(scheduler.pending.isEmpty());
    }

    @Test
    public void releasingOrCancellingAShortPressNeverHides() {
        hold.press();
        scheduler.advance(2999);
        hold.cancelPress();
        scheduler.advance(8000);
        assertFalse(hold.isHidden());
        assertEquals(0, hides);
        assertEquals(0, shows);
    }

    @Test
    public void newPressRequiresItsOwnFullThreeSeconds() {
        hold.press();
        scheduler.advance(2000);
        hold.cancelPress();
        hold.press();
        scheduler.advance(2999);
        assertEquals(0, hides);
        scheduler.advance(1);
        assertEquals(1, hides);
    }

    @Test
    public void releaseAndFurtherPressesWhileHiddenDoNotShortenOrExtendRestore() {
        hold.press();
        scheduler.advance(3000);
        hold.cancelPress();
        scheduler.advance(2000);
        hold.press();
        scheduler.advance(3000);
        assertFalse(hold.isHidden());
        assertEquals(1, hides);
        assertEquals(1, shows);
    }

    @Test
    public void detachingCancelsBothTimersAndAllowsAnotherHold() {
        hold.press();
        hold.reset();
        scheduler.advance(8000);
        assertEquals(0, hides);
        hold.press();
        scheduler.advance(3000);
        assertTrue(hold.isHidden());
        hold.reset();
        assertFalse(hold.isHidden());
        assertTrue(scheduler.pending.isEmpty());
        scheduler.advance(5000);
        assertEquals(2, shows);
        hold.press();
        scheduler.advance(3000);
        assertEquals(2, hides);
    }

    @Test
    public void nativeWiringPreservesTapsCancelsInterruptedHoldsAndPageLoadsCannotReveal() throws Exception {
        String button = source("SettingsButton");
        assertTrue(button.contains("super.onTouchEvent(event)"));
        assertTrue(button.contains("case MotionEvent.ACTION_MOVE:"));
        assertTrue(button.contains("case MotionEvent.ACTION_UP:"));
        assertTrue(button.contains("case MotionEvent.ACTION_CANCEL:"));
        assertTrue(button.contains("case MotionEvent.ACTION_POINTER_DOWN:"));
        assertTrue(button.contains("cancelPendingInputEvents();"));
        assertTrue(button.contains("setPressed(false);"));
        assertTrue(button.contains("setVisibility(View.INVISIBLE)"));
        assertTrue(button.contains("!hold.isHidden() && super.performClick()"));
        assertTrue(button.contains("if (!hasWindowFocus)"));
        assertTrue(button.contains("hold.reset();"));
        String activity = source("MainActivity");
        String pageFinished = activity.substring(activity.indexOf("public void onPageFinished("),
                activity.indexOf("@TargetApi(Build.VERSION_CODES.M)", activity.indexOf("public void onPageFinished(")));
        assertFalse(pageFinished.contains("settingsButton.setVisibility"));
        assertTrue(activity.contains("settingsButton.setOnClickListener"));
    }

    private static String source(String name) throws Exception {
        return new String(Files.readAllBytes(Paths.get(
                "src/main/java/com/skystream/ssmusic/" + name + ".java")), StandardCharsets.UTF_8);
    }

    private static final class FakeScheduler implements SettingsButtonHold.Scheduler {
        private final TreeMap<Long, Runnable> pending = new TreeMap<>();
        private long now;

        @Override
        public void postDelayed(Runnable action, long delayMs) {
            pending.put(now + delayMs, action);
        }

        @Override
        public void removeCallbacks(Runnable action) {
            pending.values().removeIf(candidate -> candidate == action);
        }

        void advance(long delta) {
            long target = now + delta;
            while (!pending.isEmpty() && pending.firstKey() <= target) {
                Map.Entry<Long, Runnable> next = pending.pollFirstEntry();
                now = next.getKey();
                next.getValue().run();
            }
            now = target;
        }
    }
}
