package org.acme.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.event.TransactionPhase;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import org.acme.entity.Project;
import org.acme.event.ProjectEvent;
import org.acme.util.VectorUtils;
import org.jboss.logging.Logger;

import java.util.Comparator;
import java.util.List;
import java.util.concurrent.ExecutorService;

/**
 * Service for semantic search of projects using embeddings.
 * Uses GigaChat API for text vectorization and Euclidean distance for similarity.
 */
@ApplicationScoped
public class ProjectSearchService {

    private static final Logger LOG = Logger.getLogger(ProjectSearchService.class);

    @Inject
    EntityManager em;

    @Inject
    GigaChatService gigaChatService;

    @Inject
    QueryEmbeddingCache queryEmbeddingCache;

    @Inject
    @Named("virtualExecutor")
    ExecutorService executorService;

    /**
     * Perform semantic search for projects based on query text.
     * Returns projects sorted by similarity (closest first).
     *
     * @param queryText search query
     * @param maxResults maximum number of results to return
     * @return list of projects sorted by similarity
     */
    public List<Project> semanticSearch(String queryText, int maxResults) {
        if (queryText == null || queryText.isBlank()) {
            return List.of();
        }

        try {
            // 1. Generate embedding for query text (with Redis caching)
            List<Float> queryEmbeddingList = queryEmbeddingCache.getQueryEmbedding(queryText);
            float[] queryEmbedding = VectorUtils.toFloatArray(queryEmbeddingList);

            // 2. Fetch all projects with embeddings from database
            List<Project> projects = em.createQuery(
                    "SELECT p FROM Project p WHERE p.embedding IS NOT NULL AND p.status = 'PUBLISHED'",
                    Project.class
            ).getResultList();

            if (projects.isEmpty()) {
                return List.of();
            }

            // 3. Calculate distances and sort by similarity
            List<Project> sortedProjects = projects.stream()
                    .map(project -> {
                        float[] projectEmbedding = VectorUtils.fromVectorString(project.embedding);
                        float distance = VectorUtils.l2DistanceSquared(queryEmbedding, projectEmbedding);
                        return new ProjectWithDistance(project, distance);
                    })
                    .sorted(Comparator.comparingDouble(ProjectWithDistance::distance))
                    .limit(maxResults)
                    .map(ProjectWithDistance::project)
                    .toList();

            return sortedProjects;

        } catch (Exception e) {
            LOG.error("Semantic search failed", e);
            throw new RuntimeException("Semantic search failed: " + e.getMessage(), e);
        }
    }

    /**
     * Generate and store embedding for a project.
     * Should be called when project is created or updated.
     *
     * @param project project to generate embedding for
     */
    public void generateAndStoreEmbedding(Project project) {
        if (project == null) {
            throw new IllegalArgumentException("Project cannot be null");
        }

        try {
            // Build searchable text from project fields
            String projectText = gigaChatService.buildProjectText(
                    project.title,
                    project.goal,
                    project.keyTasks,
                    project.tags
            );

            // Generate embedding
            List<Float> embeddingList = gigaChatService.generateEmbedding(projectText);
            float[] embeddingArray = VectorUtils.toFloatArray(embeddingList);
            String vectorString = VectorUtils.toVectorString(embeddingArray);
            project.embedding = vectorString;

        } catch (Exception e) {
            LOG.errorf(e, "Failed to generate embedding for project ID %d", project.id);
            // Don't fail the transaction - embedding generation is not critical
            project.embedding = null;
        }
    }

    /**
     * Regenerate embeddings for all projects.
     * Useful for initial setup or bulk updates.
     * Each project is processed in its own transaction to avoid losing progress on errors.
     */
    @Transactional
    public void regenerateAllEmbeddings() {
        List<Project> projects = em.createQuery("SELECT p FROM Project p", Project.class)
                .getResultList();

        LOG.infof("Regenerating embeddings for %d projects", projects.size());

        int successCount = 0;
        int failureCount = 0;

        for (Project project : projects) {
            try {
                generateAndStoreEmbeddingTransactional(project);
                successCount++;
            } catch (Exception e) {
                LOG.errorf(e, "Failed to generate embedding for project ID %d", project.id);
                failureCount++;
            }
        }

        LOG.infof("Embeddings regenerated: %d succeeded, %d failed", successCount, failureCount);
    }

    /**
     * Generate and store embedding for a project by ID in a separate transaction.
     * This is the preferred method for async calls to avoid detached entity issues.
     */
    @Transactional
    public void generateAndStoreEmbeddingById(Long projectId) {
        Project project = em.find(Project.class, projectId);
        if (project == null) {
            LOG.warnf("Project not found: %d", projectId);
            return;
        }

        generateAndStoreEmbedding(project);
        em.flush(); // Force immediate write to DB
    }

    /**
     * Generate and store embedding for a project in a separate transaction.
     * This ensures each project update is committed independently.
     */
    @Transactional
    public void generateAndStoreEmbeddingTransactional(Project project) {
        // Re-fetch project in this transaction context
        Project managedProject = em.find(Project.class, project.id);
        if (managedProject == null) {
            throw new IllegalStateException("Project not found: " + project.id);
        }

        generateAndStoreEmbedding(managedProject);
        em.flush(); // Force immediate write to DB
    }

    /**
     * CDI event observer that handles embedding generation after project transaction commits.
     * Runs in a separate thread to avoid transaction conflicts.
     */
    public void onProjectEvent(@Observes(during = TransactionPhase.AFTER_SUCCESS) ProjectEvent event) {
        // Execute in separate thread since observer runs after transaction commit
        executorService.submit(() -> {
            try {
                generateAndStoreEmbeddingById(event.getProjectId());
            } catch (Exception e) {
                LOG.errorf(e, "Failed to generate embedding for project ID %d", event.getProjectId());
            }
        });
    }

    /**
     * Perform semantic search and return projects with their distance scores.
     * Used for hybrid search combining traditional and semantic approaches.
     *
     * @param queryText search query
     * @return list of projects with their L2 distances
     */
    public List<ProjectWithDistance> semanticSearchWithScores(String queryText) {
        if (queryText == null || queryText.isBlank()) {
            return List.of();
        }

        try {
            // Generate embedding for query text (with Redis caching)
            List<Float> queryEmbeddingList = queryEmbeddingCache.getQueryEmbedding(queryText);
            float[] queryEmbedding = VectorUtils.toFloatArray(queryEmbeddingList);

            // Fetch all projects with embeddings
            List<Project> projects = em.createQuery(
                    "SELECT p FROM Project p WHERE p.embedding IS NOT NULL",
                    Project.class
            ).getResultList();

            if (projects.isEmpty()) {
                return List.of();
            }

            // Calculate distances for all projects
            return projects.stream()
                    .map(project -> {
                        float[] projectEmbedding = VectorUtils.fromVectorString(project.embedding);
                        float distance = VectorUtils.l2DistanceSquared(queryEmbedding, projectEmbedding);
                        return new ProjectWithDistance(project, distance);
                    })
                    .sorted(Comparator.comparingDouble(ProjectWithDistance::distance))
                    .toList();

        } catch (Exception e) {
            LOG.error("Semantic search failed", e);
            return List.of();
        }
    }

    /**
     * Helper record to pair projects with their similarity distances.
     */
    public record ProjectWithDistance(Project project, float distance) {}
}
