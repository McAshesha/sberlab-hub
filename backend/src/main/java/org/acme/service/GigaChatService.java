package org.acme.service;

import chat.giga.client.GigaChatClient;
import chat.giga.client.auth.AuthClient;
import chat.giga.client.auth.AuthClientBuilder;
import chat.giga.model.Scope;
import chat.giga.model.embedding.EmbeddingRequest;
import chat.giga.model.embedding.EmbeddingResponse;
import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.List;

/**
 * Service for interacting with GigaChat API to generate text embeddings.
 * Embeddings are used for semantic search of projects.
 */
@ApplicationScoped
public class GigaChatService {

    private static final Logger LOG = Logger.getLogger(GigaChatService.class);
    private static final String EMBEDDING_MODEL = "Embeddings";

    private final GigaChatClient client;

    public GigaChatService(
            @ConfigProperty(name = "gigachat.auth.key") String authKey,
            @ConfigProperty(name = "gigachat.verify.ssl", defaultValue = "false") boolean verifySsl
    ) {
        this.client = GigaChatClient.builder()
                .verifySslCerts(verifySsl)
                .logRequests(false)
                .logResponses(false)
                .authClient(AuthClient.builder()
                        .withOAuth(AuthClientBuilder.OAuthBuilder.builder()
                                .scope(Scope.GIGACHAT_API_PERS)
                                .authKey(authKey)
                                .verifySslCerts(verifySsl)
                                .build())
                        .build())
                .build();

        LOG.info("GigaChatService initialized");
    }

    /**
     * Generate embedding vector for a single text input.
     *
     * @param text input text to vectorize
     * @return embedding vector (1024 dimensions)
     * @throws RuntimeException if API call fails
     */
    public List<Float> generateEmbedding(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Text cannot be null or blank");
        }

        try {
            EmbeddingRequest request = EmbeddingRequest.builder()
                    .model(EMBEDDING_MODEL)
                    .input(List.of(text))
                    .build();

            EmbeddingResponse response = client.embeddings(request);

            if (response.data() == null || response.data().isEmpty()) {
                throw new RuntimeException("Empty embedding response from GigaChat API");
            }

            return response.data().get(0).embedding();

        } catch (Exception ex) {
            LOG.errorf(ex, "GigaChat API error: %s", ex.getClass().getName());
            throw new RuntimeException("Failed to generate embedding: " + ex.getMessage(), ex);
        }
    }

    /**
     * Generate embeddings for multiple texts in a single API call (more efficient).
     *
     * @param texts list of input texts
     * @return list of embedding vectors
     * @throws RuntimeException if API call fails
     */
    public List<List<Float>> generateEmbeddings(List<String> texts) {
        if (texts == null || texts.isEmpty()) {
            throw new IllegalArgumentException("Texts list cannot be null or empty");
        }

        try {
            EmbeddingResponse response = client.embeddings(EmbeddingRequest.builder()
                    .model(EMBEDDING_MODEL)
                    .input(texts)
                    .build());

            if (response.data() == null || response.data().isEmpty()) {
                throw new RuntimeException("Empty embedding response from GigaChat API");
            }

            return response.data().stream()
                    .map(chat.giga.model.embedding.Embedding::embedding)
                    .toList();

        } catch (Exception ex) {
            LOG.errorf(ex, "GigaChat API error");
            throw new RuntimeException("Failed to generate embeddings: " + ex.getMessage(), ex);
        }
    }

    /**
     * Generate a combined text representation of a project for embedding.
     * Combines title, goal, tasks, and tags into a single searchable text.
     *
     * @param title project title
     * @param goal project goal
     * @param keyTasks key tasks description
     * @param tags comma-separated tags
     * @return combined text for embedding
     */
    public String buildProjectText(String title, String goal, String keyTasks, String tags) {
        StringBuilder sb = new StringBuilder();

        if (title != null && !title.isBlank()) {
            sb.append(title).append(". ");
        }
        if (goal != null && !goal.isBlank()) {
            sb.append(goal).append(". ");
        }
        if (keyTasks != null && !keyTasks.isBlank()) {
            sb.append(keyTasks).append(". ");
        }
        if (tags != null && !tags.isBlank()) {
            sb.append("Tags: ").append(tags).append(".");
        }

        return sb.toString().trim();
    }
}
