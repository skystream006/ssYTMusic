package com.skystream.ssmusic;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.awt.image.BufferedImage;
import java.io.File;

import javax.imageio.ImageIO;

import org.junit.Test;

public class AppIconResourcesTest {
    private static final String[] DENSITIES = {"mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi"};
    private static final int[] LAUNCHER_SIZES = {48, 72, 96, 144, 192};
    private static final int[] NOTIFICATION_SIZES = {24, 36, 48, 72, 96};

    @Test
    public void launcherIconsHaveDensitySpecificDimensions() throws Exception {
        for (int i = 0; i < DENSITIES.length; i++) {
            for (String name : new String[]{"ic_launcher.png", "ic_launcher_round.png"}) {
                readIcon("mipmap-" + DENSITIES[i] + "/" + name, LAUNCHER_SIZES[i]);
            }
        }
    }

    @Test
    public void notificationIconsAreWhiteSilhouettesWithTransparentPadding() throws Exception {
        for (int i = 0; i < DENSITIES.length; i++) {
            BufferedImage image = readIcon("drawable-" + DENSITIES[i] + "/ic_notification.png",
                    NOTIFICATION_SIZES[i]);
            assertTrue("Notification icons need an alpha channel", image.getColorModel().hasAlpha());
            int opaquePixels = 0;
            int transparentInteriorPixels = 0;
            int padding = image.getWidth() / 12;
            for (int y = 0; y < image.getHeight(); y++) {
                for (int x = 0; x < image.getWidth(); x++) {
                    int pixel = image.getRGB(x, y);
                    int alpha = pixel >>> 24;
                    if (alpha > 0) {
                        assertEquals("Visible pixels must be white", 0xFFFFFF, pixel & 0xFFFFFF);
                    } else if (x >= padding && y >= padding && x < image.getWidth() - padding
                            && y < image.getHeight() - padding) {
                        transparentInteriorPixels++;
                    }
                    if (alpha == 255) {
                        opaquePixels++;
                    }
                    if (x < padding || y < padding || x >= image.getWidth() - padding
                            || y >= image.getHeight() - padding) {
                        assertEquals("Notification artwork must have transparent padding", 0, alpha);
                    }
                }
            }
            assertTrue("Notification artwork must not be empty", opaquePixels > 0);
            assertTrue("Artwork must have transparent negative space", transparentInteriorPixels > 0);
        }
    }

    private static BufferedImage readIcon(String path, int size) throws Exception {
        BufferedImage image = ImageIO.read(new File("src/main/res", path));
        assertNotNull("Invalid PNG: " + path, image);
        assertEquals(path + " width", size, image.getWidth());
        assertEquals(path + " height", size, image.getHeight());
        return image;
    }
}
