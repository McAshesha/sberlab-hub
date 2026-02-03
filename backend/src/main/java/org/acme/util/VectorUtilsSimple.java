package org.acme.util;

/**
 * Simplified utility class for vector operations without Vector API.
 * This version uses standard Java for compatibility.
 */
public class VectorUtilsSimple {

    private VectorUtilsSimple() {
        // Utility class
    }

    /**
     * Calculates the squared Euclidean distance (L2^2) between two vectors.
     * Simple implementation without SIMD optimization.
     */
    public static float l2DistanceSquared(float[] a, float[] b) {
        int len = Math.min(a.length, b.length);
        float sum = 0.0f;

        for (int i = 0; i < len; i++) {
            float diff = a[i] - b[i];
            sum += diff * diff;
        }

        return sum;
    }

    /**
     * Calculates the actual Euclidean distance (L2) between two vectors.
     */
    public static float l2Distance(float[] a, float[] b) {
        return (float) Math.sqrt(l2DistanceSquared(a, b));
    }

    /**
     * Converts a list of Float values to a float array.
     */
    public static float[] toFloatArray(java.util.List<Float> list) {
        System.out.println("[VectorUtilsSimple] toFloatArray called with list: " + (list != null ? list.size() + " elements" : "null"));
        if (list == null) return new float[0];

        float[] result = new float[list.size()];
        System.out.println("[VectorUtilsSimple] Created array of size: " + result.length);

        for (int i = 0; i < list.size(); i++) {
            if (i % 100 == 0) {
                System.out.println("[VectorUtilsSimple] Processing element " + i + "/" + list.size());
            }
            Float value = list.get(i);
            if (value == null) {
                System.out.println("[VectorUtilsSimple] ERROR: Null value at index " + i);
                throw new IllegalArgumentException("Null value at index " + i + " in embedding list");
            }
            result[i] = value;
        }

        System.out.println("[VectorUtilsSimple] toFloatArray completed successfully");
        return result;
    }

    /**
     * Converts a float array to a string representation for database storage.
     * PostgreSQL pgvector uses format: [0.1, 0.2, 0.3]
     */
    public static String toVectorString(float[] vector) {
        if (vector == null || vector.length == 0) return null;
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(vector[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    /**
     * Parses a pgvector string representation to float array.
     */
    public static float[] fromVectorString(String vectorString) {
        if (vectorString == null || vectorString.isEmpty()) return new float[0];

        // Remove brackets and split by comma
        String cleaned = vectorString.substring(1, vectorString.length() - 1);
        String[] parts = cleaned.split(",");

        float[] result = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            result[i] = Float.parseFloat(parts[i].trim());
        }
        return result;
    }
}
