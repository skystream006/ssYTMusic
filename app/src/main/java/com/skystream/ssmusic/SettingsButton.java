package com.skystream.ssmusic;

import android.annotation.SuppressLint;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.view.View;

import androidx.appcompat.widget.AppCompatImageButton;

public final class SettingsButton extends AppCompatImageButton {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final SettingsButtonHold hold = new SettingsButtonHold(
            new SettingsButtonHold.Scheduler() {
                @Override
                public void postDelayed(Runnable action, long delayMs) {
                    handler.postDelayed(action, delayMs);
                }

                @Override
                public void removeCallbacks(Runnable action) {
                    handler.removeCallbacks(action);
                }
            }, () -> {
                cancelPendingInputEvents();
                setPressed(false);
                setVisibility(View.INVISIBLE);
            }, () -> setVisibility(View.VISIBLE));

    public SettingsButton(Context context, AttributeSet attributes) {
        super(context, attributes);
    }

    @Override
    @SuppressLint("ClickableViewAccessibility") // Super dispatches taps through performClick().
    public boolean onTouchEvent(MotionEvent event) {
        boolean handled = super.onTouchEvent(event);
        switch (event.getActionMasked()) {
            case MotionEvent.ACTION_DOWN:
                if (isPressed()) {
                    hold.press();
                }
                break;
            case MotionEvent.ACTION_MOVE:
                if (!isPressed()) {
                    hold.cancelPress();
                }
                break;
            case MotionEvent.ACTION_UP:
            case MotionEvent.ACTION_CANCEL:
            case MotionEvent.ACTION_POINTER_DOWN:
                hold.cancelPress();
                break;
            default:
                break;
        }
        return handled;
    }

    @Override
    public boolean performClick() {
        return !hold.isHidden() && super.performClick();
    }

    @Override
    public void onWindowFocusChanged(boolean hasWindowFocus) {
        super.onWindowFocusChanged(hasWindowFocus);
        if (!hasWindowFocus) {
            hold.cancelPress();
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        hold.reset();
        super.onDetachedFromWindow();
    }
}
