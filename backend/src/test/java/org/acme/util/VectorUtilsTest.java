package org.acme.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.ArrayList;
import java.util.List;

public class VectorUtilsTest {

    @Test
    public void testToFloatArray() {
        // Create a list of 1024 floats (simulating GigaChat embedding)
        List<Float> floatList = new ArrayList<>();
        for (int i = 0; i < 1024; i++) {
            floatList.add((float) Math.random());
        }

        // Convert to array
        float[] result = VectorUtils.toFloatArray(floatList);

        // Verify
        assertNotNull(result);
        assertEquals(1024, result.length);

        // Check values match
        for (int i = 0; i < 1024; i++) {
            assertEquals(floatList.get(i), result[i], 0.0001f);
        }
    }

    @Test
    public void testToFloatArrayWithNull() {
        List<Float> floatList = new ArrayList<>();
        floatList.add(1.0f);
        floatList.add(null); // Null value
        floatList.add(3.0f);

        assertThrows(IllegalArgumentException.class, () -> {
            VectorUtils.toFloatArray(floatList);
        });
    }

    @Test
    public void testToVectorString() {
        float[] array = new float[]{0.1f, 0.2f, 0.3f};
        String result = VectorUtils.toVectorString(array);

        assertNotNull(result);
        assertTrue(result.startsWith("["));
        assertTrue(result.endsWith("]"));
        assertTrue(result.contains("0.1"));
        assertTrue(result.contains("0.2"));
        assertTrue(result.contains("0.3"));
    }

    @Test
    public void testFromVectorString() {
        String vectorString = "[0.1,0.2,0.3]";
        float[] result = VectorUtils.fromVectorString(vectorString);

        assertNotNull(result);
        assertEquals(3, result.length);
        assertEquals(0.1f, result[0], 0.0001f);
        assertEquals(0.2f, result[1], 0.0001f);
        assertEquals(0.3f, result[2], 0.0001f);
    }

    @Test
    public void testRoundTrip() {
        // Test that we can convert to string and back
        float[] original = new float[1024];
        for (int i = 0; i < 1024; i++) {
            original[i] = (float) Math.random();
        }

        String vectorString = VectorUtils.toVectorString(original);
        float[] restored = VectorUtils.fromVectorString(vectorString);

        assertEquals(original.length, restored.length);
        for (int i = 0; i < original.length; i++) {
            assertEquals(original[i], restored[i], 0.0001f);
        }
    }
}
