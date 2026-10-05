package com.skystream.ssmusic;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.ByteBuffer;
import java.nio.file.Files;
import java.util.zip.Inflater;

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
            String path = "drawable-" + DENSITIES[i] + "/ic_notification.png";
            int size = NOTIFICATION_SIZES[i];
            readIcon(path, size);
            byte[] rgba = decodeRgba(path, size);
            int opaquePixels = 0;
            int transparentInteriorPixels = 0;
            int padding = size / 12;
            for (int y = 0; y < size; y++) {
                for (int x = 0; x < size; x++) {
                    int offset = (y * size + x) * 4;
                    int alpha = rgba[offset + 3] & 0xFF;
                    if (alpha > 0) {
                        assertEquals("Visible pixels must be white", 0xFFFFFF,
                                ((rgba[offset] & 0xFF) << 16) | ((rgba[offset + 1] & 0xFF) << 8)
                                        | (rgba[offset + 2] & 0xFF));
                    } else if (x >= padding && y >= padding && x < size - padding
                            && y < size - padding) {
                        transparentInteriorPixels++;
                    }
                    if (alpha == 255) {
                        opaquePixels++;
                    }
                    if (x < padding || y < padding || x >= size - padding || y >= size - padding) {
                        assertEquals("Notification artwork must have transparent padding", 0, alpha);
                    }
                }
            }
            assertTrue("Notification artwork must not be empty", opaquePixels > 0);
            assertTrue("Artwork must have transparent negative space", transparentInteriorPixels > 0);
        }
    }

    private static ByteBuffer readHeader(String path) throws Exception {
        byte[] data = Files.readAllBytes(new File("src/main/res", path).toPath());
        assertTrue("Invalid PNG: " + path, data.length > 33 && (data[0] & 0xFF) == 0x89
                && data[1] == 'P' && data[2] == 'N' && data[3] == 'G');
        return ByteBuffer.wrap(data);
    }

    private static void readIcon(String path, int size) throws Exception {
        ByteBuffer png = readHeader(path);
        assertEquals(path + " width", size, png.getInt(16));
        assertEquals(path + " height", size, png.getInt(20));
    }

    private static byte[] decodeRgba(String path, int size) throws Exception {
        ByteBuffer png = readHeader(path);
        assertEquals(path + " must be 8-bit RGBA", 8, png.get(24));
        assertEquals(path + " must be 8-bit RGBA", 6, png.get(25));
        assertEquals(path + " must not be interlaced", 0, png.get(28));
        ByteArrayOutputStream compressed = new ByteArrayOutputStream();
        int pos = 8;
        while (pos + 12 <= png.capacity()) {
            int length = png.getInt(pos);
            String type = new String(png.array(), pos + 4, 4, "US-ASCII");
            if (type.equals("IDAT")) {
                compressed.write(png.array(), pos + 8, length);
            }
            pos += 12 + length;
        }
        int stride = size * 4;
        byte[] raw = new byte[(stride + 1) * size];
        Inflater inflater = new Inflater();
        inflater.setInput(compressed.toByteArray());
        int total = 0;
        while (total < raw.length && !inflater.finished()) {
            int n = inflater.inflate(raw, total, raw.length - total);
            if (n == 0 && (inflater.needsInput() || inflater.needsDictionary())) {
                break;
            }
            total += n;
        }
        inflater.end();
        assertEquals(path + " pixel data", raw.length, total);
        byte[] out = new byte[stride * size];
        for (int y = 0; y < size; y++) {
            int filter = raw[y * (stride + 1)];
            for (int i = 0; i < stride; i++) {
                int cur = raw[y * (stride + 1) + 1 + i] & 0xFF;
                int left = i >= 4 ? out[y * stride + i - 4] & 0xFF : 0;
                int up = y > 0 ? out[(y - 1) * stride + i] & 0xFF : 0;
                int upLeft = y > 0 && i >= 4 ? out[(y - 1) * stride + i - 4] & 0xFF : 0;
                int value;
                switch (filter) {
                    case 0: value = cur; break;
                    case 1: value = cur + left; break;
                    case 2: value = cur + up; break;
                    case 3: value = cur + ((left + up) >> 1); break;
                    case 4: value = cur + paeth(left, up, upLeft); break;
                    default: throw new IllegalStateException("Bad PNG filter " + filter);
                }
                out[y * stride + i] = (byte) value;
            }
        }
        return out;
    }

    private static int paeth(int a, int b, int c) {
        int p = a + b - c;
        int pa = Math.abs(p - a);
        int pb = Math.abs(p - b);
        int pc = Math.abs(p - c);
        return pa <= pb && pa <= pc ? a : (pb <= pc ? b : c);
    }
}
