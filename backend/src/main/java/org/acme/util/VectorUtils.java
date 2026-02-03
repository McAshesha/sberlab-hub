package org.acme.util;

import jdk.incubator.vector.FloatVector;
import jdk.incubator.vector.VectorMask;
import jdk.incubator.vector.VectorOperators;
import jdk.incubator.vector.VectorSpecies;

/**
 * Utility class for fast vector operations using Java Vector API (Preview).
 * Requires --add-modules jdk.incubator.vector and --enable-preview flags.
 */
public class VectorUtils {

    private static final VectorSpecies<Float> SPECIES = FloatVector.SPECIES_PREFERRED;

    private VectorUtils() {
        // Utility class
    }

    /**
     * Calculates the squared Euclidean distance (L2^2) between two vectors.
     * This is faster than computing the actual distance and sufficient for comparison.
     *
     * @param a first vector
     * @param b second vector
     * @return sum of squared differences
     */
    public static float l2DistanceSquared(float[] a, float[] b) {
        // Use minimum length for safety (though vectors should always be same length)
        int len = Math.min(a.length, b.length);

        int i = 0;
        FloatVector acc = FloatVector.zero(SPECIES);

        // Vectorized loop - process multiple elements at once
        int upper = SPECIES.loopBound(len);
        for (; i < upper; i += SPECIES.length()) {
            FloatVector va = FloatVector.fromArray(SPECIES, a, i);
            FloatVector vb = FloatVector.fromArray(SPECIES, b, i);
            FloatVector diff = va.sub(vb);
            // Fused multiply-add: acc += diff * diff
            acc = diff.fma(diff, acc);
        }

        // Handle remaining elements with masked operation (no scalar loop needed)
        if (i < len) {
            VectorMask<Float> m = SPECIES.indexInRange(i, len);
            FloatVector va = FloatVector.fromArray(SPECIES, a, i, m);
            FloatVector vb = FloatVector.fromArray(SPECIES, b, i, m);
            FloatVector diff = va.sub(vb);
            acc = diff.fma(diff, acc); // Masked lanes are 0, so no impact
        }

        // Reduce all lanes to a single sum
        return acc.reduceLanes(VectorOperators.ADD);
    }

    /**
     * Calculates the actual Euclidean distance (L2) between two vectors.
     * For ranking/comparison, l2DistanceSquared is faster and equivalent.
     *
     * @param a first vector
     * @param b second vector
     * @return Euclidean distance
     */
    public static float l2Distance(float[] a, float[] b) {
        return (float) Math.sqrt(l2DistanceSquared(a, b));
    }

    /**
     * Converts a list of Float values to a float array.
     * GigaChat API returns List<Float>, but Vector API uses float[] for efficiency.
     *
     * @param list list of floats
     * @return float array
     */
    public static float[] toFloatArray(java.util.List<Float> list) {
        if (list == null) return new float[0];

        float[] result = new float[list.size()];
        for (int i = 0; i < list.size(); i++) {
            Float value = list.get(i);
            if (value == null) {
                throw new IllegalArgumentException("Null value at index " + i + " in embedding list");
            }
            result[i] = value;
        }
        return result;
    }

    /**
     * Converts a float array to a string representation for database storage.
     * PostgreSQL pgvector uses format: [0.1, 0.2, 0.3]
     *
     * @param vector float array
     * @return string representation
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
     *
     * @param vectorString string in format [0.1, 0.2, 0.3]
     * @return float array
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
