package com.skystream.ssmusic;

final class SettingsButtonHold {
    static final long HOLD_MS = 3000L;
    static final long HIDE_MS = 5000L;

    interface Scheduler {
        void postDelayed(Runnable action, long delayMs);
        void removeCallbacks(Runnable action);
    }

    private final Scheduler scheduler;
    private final Runnable hide;
    private final Runnable show;
    private boolean hidden;
    private final Runnable restore;
    private final Runnable held;

    SettingsButtonHold(Scheduler scheduler, Runnable hide, Runnable show) {
        this.scheduler = scheduler;
        this.hide = hide;
        this.show = show;
        restore = () -> {
            hidden = false;
            this.show.run();
        };
        held = () -> {
            hidden = true;
            this.hide.run();
            this.scheduler.postDelayed(restore, HIDE_MS);
        };
    }

    void press() {
        cancelPress();
        if (!hidden) {
            scheduler.postDelayed(held, HOLD_MS);
        }
    }

    void cancelPress() {
        scheduler.removeCallbacks(held);
    }

    boolean isHidden() {
        return hidden;
    }

    void reset() {
        cancelPress();
        scheduler.removeCallbacks(restore);
        hidden = false;
        show.run();
    }
}
