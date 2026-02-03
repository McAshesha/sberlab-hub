package org.acme.service;

import io.quarkus.cache.CacheResult;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import java.util.List;

/**
 * Service for caching query embeddings to avoid repeated API calls to GigaChat.
 * Query embeddings are deterministic (same text → same embedding), so they can be cached for long periods.
 */
@ApplicationScoped
public class QueryEmbeddingCache {

    private static final Logger LOG = Logger.getLogger(QueryEmbeddingCache.class);

    @Inject
    GigaChatService gigaChatService;

    /**
     * Get embedding for query text with Redis caching.
     * Cache key is the normalized query text (trimmed and lowercased).
     * TTL is 7 days as embeddings are deterministic.
     *
     * @param queryText search query text
     * @return embedding vector (1024 floats)
     */
    @CacheResult(cacheName = "query-embeddings")
    public List<Float> getQueryEmbedding(String queryText) {
        // Normalize the query text for consistent cache keys
        String normalized = normalizeQuery(queryText);

        LOG.infof("Cache miss for query: '%s' - calling GigaChat API", normalized);

        try {
            return gigaChatService.generateEmbedding(normalized);
        } catch (Exception e) {
            LOG.errorf(e, "Failed to generate embedding for query: %s", normalized);
            throw new RuntimeException("Failed to generate query embedding: " + e.getMessage(), e);
        }
    }

    /**
     * Normalize query text for consistent cache keys.
     * Trims whitespace and converts to lowercase.
     *
     * @param queryText raw query text
     * @return normalized query text
     */
    private String normalizeQuery(String queryText) {
        if (queryText == null) {
            return "";
        }
        return queryText.trim().toLowerCase();
    }
}
