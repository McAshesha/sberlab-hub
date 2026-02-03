package org.acme.resource;

import io.quarkus.cache.CacheInvalidate;
import io.quarkus.cache.CacheResult;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Sort;
import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.*;
import org.acme.entity.*;
import org.acme.event.ProjectEvent;
import org.acme.validation.ValidEnum;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

import java.util.stream.Collectors;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RunOnVirtualThread
public class ProjectResource {

    private static final Logger LOG = Logger.getLogger(ProjectResource.class);
    private static final Duration PARALLEL_TIMEOUT = Duration.ofSeconds(5);

    @Inject JsonWebToken jwt;

    @Inject
    @jakarta.inject.Named("virtualExecutor")
    java.util.concurrent.ExecutorService virtualExecutor;

    @Inject
    org.acme.service.ProjectSearchService searchService;

    @Inject
    jakarta.persistence.EntityManager em;

    @Inject
    jakarta.enterprise.event.Event<ProjectEvent> projectEvent;

    public record CreateProjectRequest(
            @NotBlank(message = "title is required") @Size(max = 500, message = "title must be at most 500 characters") String title,
            String goal, String keyTasks, String valueText,
            String requiredSkills,
            @ValidEnum(enumClass = Project.Difficulty.class) String difficulty,
            String tags, String curriculumMatch,
            Boolean thesisOk, Boolean practiceOk, Boolean courseworkOk,
            String responsibilityBoundaries,
            @Size(max = 500, message = "contactPolicy must be at most 500 characters") String contactPolicy) {}

    @GET
    @Path("/projects")
    @RolesAllowed({"STUDENT", "TEACHER", "MENTOR", "ADMIN"})
    public Response list(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size,
            @QueryParam("q") String q,
            @QueryParam("difficulty") String difficulty,
            @QueryParam("thesis") Boolean thesis,
            @QueryParam("practice") Boolean practice,
            @QueryParam("coursework") Boolean coursework,
            @QueryParam("tags") String tags,
            @QueryParam("skills") String skills,
            @QueryParam("mentorId") Long mentorId) {

        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        if (currentUser == null) return Response.status(401).build();

        StringBuilder hql = new StringBuilder("1=1");
        List<Object> params = new ArrayList<>();
        int paramIdx = 1;

        // Visibility rules
        if (currentUser.role == User.Role.ADMIN) {
            // admin sees everything
        } else if (currentUser.role == User.Role.MENTOR) {
            hql.append(" AND (status = ?").append(paramIdx).append(" OR mentor.id = ?").append(paramIdx + 1).append(")");
            params.add(Project.Status.PUBLISHED);
            params.add(currentUser.id);
            paramIdx += 2;
        } else {
            // STUDENT, TEACHER
            hql.append(" AND status = ?").append(paramIdx);
            params.add(Project.Status.PUBLISHED);
            paramIdx++;
        }

        // Traditional text search (only if q is provided, semantic will be combined)
        boolean hasTextQuery = q != null && !q.isBlank();
        if (hasTextQuery) {
            hql.append(" AND (LOWER(title) LIKE ?").append(paramIdx)
               .append(" OR LOWER(goal) LIKE ?").append(paramIdx)
               .append(" OR LOWER(keyTasks) LIKE ?").append(paramIdx).append(")");
            params.add("%" + q.toLowerCase() + "%");
            paramIdx++;
        }

        // Other filters
        if (difficulty != null && !difficulty.isBlank()) {
            hql.append(" AND difficulty = ?").append(paramIdx);
            params.add(Project.Difficulty.valueOf(difficulty));
            paramIdx++;
        }
        if (thesis != null && thesis) {
            hql.append(" AND thesisOk = true");
        }
        if (practice != null && practice) {
            hql.append(" AND practiceOk = true");
        }
        if (coursework != null && coursework) {
            hql.append(" AND courseworkOk = true");
        }
        if (tags != null && !tags.isBlank()) {
            hql.append(" AND LOWER(tags) LIKE ?").append(paramIdx);
            params.add("%" + tags.toLowerCase() + "%");
            paramIdx++;
        }
        if (skills != null && !skills.isBlank()) {
            hql.append(" AND LOWER(requiredSkills) LIKE ?").append(paramIdx);
            params.add("%" + skills.toLowerCase() + "%");
            paramIdx++;
        }
        if (mentorId != null) {
            hql.append(" AND mentor.id = ?").append(paramIdx);
            params.add(mentorId);
            paramIdx++;
        }

        // Hybrid search: combine traditional and semantic when query is present
        if (hasTextQuery) {
            // Get traditional search results (with filters already applied in HQL)
            var traditionalQuery = Project.find(hql.toString(), Sort.descending("createdAt"), params.toArray());
            @SuppressWarnings("unchecked")
            List<Project> traditionalResults = (List<Project>) (List<?>) traditionalQuery.list();

            // Get semantic search results
            var semanticResults = searchService.semanticSearchWithScores(q);

            // Combine using Reciprocal Rank Fusion (RRF)
            List<Project> combinedResults = combineSearchResults(traditionalResults, semanticResults, currentUser);

            // Apply filters to combined results (semantic results need filtering)
            List<Project> filteredResults = combinedResults.stream()
                    .filter(p -> matchesFilters(p, difficulty, thesis, practice, coursework, tags, skills, mentorId))
                    .toList();

            // Apply pagination to filtered results
            long total = filteredResults.size();
            int fromIndex = page * size;
            int toIndex = Math.min(fromIndex + size, filteredResults.size());
            List<Project> items = fromIndex < filteredResults.size()
                ? filteredResults.subList(fromIndex, toIndex)
                : List.of();

            return Response.ok(new PageDto<>(items.stream().map(ProjectDto::from).toList(), total, page, size)).build();
        } else {
            // No text query - use traditional sorting by date
            var query = Project.find(hql.toString(), Sort.descending("createdAt"), params.toArray());
            long total = query.count();
            List<Project> items = query.page(Page.of(page, size)).list();
            return Response.ok(new PageDto<>(items.stream().map(ProjectDto::from).toList(), total, page, size)).build();
        }
    }

    /**
     * Combine traditional and semantic search results using Reciprocal Rank Fusion (RRF).
     * RRF score = sum(1 / (k + rank)) where k=60 is a smoothing constant.
     * Higher score means better match.
     */
    private List<Project> combineSearchResults(
            List<Project> traditionalResults,
            List<org.acme.service.ProjectSearchService.ProjectWithDistance> semanticResults,
            User currentUser) {

        final int K = 60; // RRF constant
        Map<Long, Double> scores = new java.util.HashMap<>();

        // Add scores from traditional search (rank-based)
        for (int i = 0; i < traditionalResults.size(); i++) {
            Project p = traditionalResults.get(i);
            double rrfScore = 1.0 / (K + i + 1); // rank is i+1 (1-indexed)
            scores.merge(p.id, rrfScore, Double::sum);
        }

        // Add scores from semantic search (rank-based)
        for (int i = 0; i < semanticResults.size(); i++) {
            var result = semanticResults.get(i);
            Project p = result.project();

            // Apply visibility filter to semantic results
            boolean visible = currentUser.role == User.Role.ADMIN ||
                    (currentUser.role == User.Role.MENTOR &&
                     (p.status == Project.Status.PUBLISHED || p.mentor.id.equals(currentUser.id))) ||
                    p.status == Project.Status.PUBLISHED;

            if (visible) {
                double rrfScore = 1.0 / (K + i + 1); // rank is i+1 (1-indexed)
                scores.merge(p.id, rrfScore, Double::sum);
            }
        }

        // Collect all unique projects and sort by combined score
        return scores.entrySet().stream()
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .map(entry -> (Project) Project.findById(entry.getKey()))
                .filter(p -> p != null)
                .toList();
    }

    @GET
    @Path("/projects/{id}")
    @RolesAllowed({"STUDENT", "TEACHER", "MENTOR", "ADMIN"})
    public Response getById(@PathParam("id") Long id) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project p = Project.findById(id);
        if (p == null) return Response.status(404).build();

        // Access check
        if (currentUser.role != User.Role.ADMIN) {
            if (p.status != Project.Status.PUBLISHED && !p.mentor.id.equals(currentUser.id)) {
                return Response.status(403).build();
            }
        }

        // Use cached DTO conversion for better performance
        ProjectDto dto = getCachedProjectDto(id);
        return Response.ok(dto).build();
    }

    /**
     * Get project DTO with Redis caching.
     * Cache is invalidated on project updates.
     */
    @CacheResult(cacheName = "project-details")
    ProjectDto getCachedProjectDto(Long id) {
        Project p = Project.findById(id);
        if (p == null) {
            throw new NotFoundException("Project not found: " + id);
        }
        return ProjectDto.from(p);
    }

    /**
     * Heavy endpoint: fetches project with all related data in parallel using CompletableFuture
     * with virtual thread executor. Only accessible to project mentor or admin.
     */
    @GET
    @Path("/projects/{id}/full")
    @RolesAllowed({"MENTOR", "ADMIN"})
    public Response getFullDetails(@PathParam("id") Long id) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project project = Project.findById(id);
        if (project == null) return Response.status(404).build();

        // Only mentor of this project or admin can access full details
        if (currentUser.role != User.Role.ADMIN && !project.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }

        try {
            ProjectFullDto fullDto = fetchProjectDetailsConcurrently(project);
            return Response.ok(fullDto).build();
        } catch (TimeoutException e) {
            return Response.status(504).entity(new ErrorResponse("Request timed out")).build();
        } catch (Exception e) {
            return Response.status(500).entity(new ErrorResponse("Failed to fetch project details: " + e.getMessage())).build();
        }
    }

    /**
     * Fetch all project-related data concurrently using CompletableFuture with virtual thread executor.
     * Includes timeout and proper exception propagation.
     */
    private ProjectFullDto fetchProjectDetailsConcurrently(Project project) throws Exception {
        Long projectId = project.id;

        // Launch all I/O tasks in parallel on virtual threads
        CompletableFuture<List<ApplicationDto>> applicationsFuture = CompletableFuture.supplyAsync(() ->
                Application.list("project.id", projectId).stream()
                        .map(a -> ApplicationDto.from((Application) a))
                        .toList(),
                virtualExecutor
        );

        CompletableFuture<List<QuestionDto>> questionsFuture = CompletableFuture.supplyAsync(() -> {
            List<Question> questions = Question.list("project.id = ?1 order by createdAt desc", projectId);
            List<Long> qIds = questions.stream().map(q -> q.id).toList();
            Map<Long, Answer> answerMap = Map.of();
            if (!qIds.isEmpty()) {
                List<Answer> answers = Answer.list("question.id in ?1", qIds);
                answerMap = answers.stream().collect(Collectors.toMap(a -> a.question.id, a -> a));
            }
            Map<Long, Answer> finalAnswerMap = answerMap;
            return questions.stream()
                    .map(q -> QuestionDto.from(q, finalAnswerMap.get(q.id)))
                    .toList();
        }, virtualExecutor);

        CompletableFuture<List<FeedbackDto>> feedbackFuture = CompletableFuture.supplyAsync(() ->
                Feedback.list("project.id", projectId).stream()
                        .map(f -> FeedbackDto.from((Feedback) f))
                        .toList(),
                virtualExecutor
        );

        // Combine all futures and wait with timeout
        CompletableFuture<ProjectFullDto> combined = CompletableFuture.allOf(
                applicationsFuture, questionsFuture, feedbackFuture
        ).thenApply(v -> new ProjectFullDto(
                ProjectDto.from(project),
                applicationsFuture.join(),
                questionsFuture.join(),
                feedbackFuture.join()
        ));

        return combined.get(PARALLEL_TIMEOUT.toMillis(), TimeUnit.MILLISECONDS);
    }

    @POST
    @Path("/projects")
    @RolesAllowed({"MENTOR", "ADMIN"})
    @Transactional
    public Response create(@Valid CreateProjectRequest req) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project p = new Project();
        p.mentor = currentUser;
        applyFields(p, req);
        p.status = Project.Status.DRAFT;
        p.persist();

        // Fire event to generate embedding after transaction commits
        projectEvent.fire(new ProjectEvent(p.id, ProjectEvent.EventType.CREATED));

        return Response.status(201).entity(ProjectDto.from(p)).build();
    }

    @PUT
    @Path("/projects/{id}")
    @RolesAllowed({"MENTOR", "ADMIN"})
    @Transactional
    @CacheInvalidate(cacheName = "project-details")
    public Response update(@PathParam("id") Long id, @Valid CreateProjectRequest req) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project p = Project.findById(id);
        if (p == null) return Response.status(404).build();
        if (currentUser.role != User.Role.ADMIN && !p.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }
        applyFields(p, req);

        // Fire event to regenerate embedding after transaction commits
        projectEvent.fire(new ProjectEvent(p.id, ProjectEvent.EventType.UPDATED));

        return Response.ok(ProjectDto.from(p)).build();
    }

    @POST
    @Path("/projects/{id}/publish")
    @RolesAllowed({"MENTOR", "ADMIN"})
    @Transactional
    @CacheInvalidate(cacheName = "project-details")
    public Response publish(@PathParam("id") Long id) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project p = Project.findById(id);
        if (p == null) return Response.status(404).build();
        if (currentUser.role != User.Role.ADMIN && !p.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }
        p.status = Project.Status.PUBLISHED;
        return Response.ok(ProjectDto.from(p)).build();
    }

    @POST
    @Path("/projects/{id}/archive")
    @RolesAllowed({"MENTOR", "ADMIN"})
    @Transactional
    @CacheInvalidate(cacheName = "project-details")
    public Response archive(@PathParam("id") Long id) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project p = Project.findById(id);
        if (p == null) return Response.status(404).build();
        if (currentUser.role != User.Role.ADMIN && !p.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }
        p.status = Project.Status.ARCHIVED;
        return Response.ok(ProjectDto.from(p)).build();
    }


    /**
     * Check if a project matches all active filters.
     */
    private boolean matchesFilters(Project p, String difficulty, Boolean thesis, Boolean practice,
                                   Boolean coursework, String tags, String skills, Long mentorId) {
        if (difficulty != null && !difficulty.isBlank()) {
            if (p.difficulty != Project.Difficulty.valueOf(difficulty)) return false;
        }
        if (thesis != null && thesis && !p.thesisOk) return false;
        if (practice != null && practice && !p.practiceOk) return false;
        if (coursework != null && coursework && !p.courseworkOk) return false;
        if (tags != null && !tags.isBlank()) {
            if (p.tags == null || !p.tags.toLowerCase().contains(tags.toLowerCase())) return false;
        }
        if (skills != null && !skills.isBlank()) {
            if (p.requiredSkills == null || !p.requiredSkills.toLowerCase().contains(skills.toLowerCase())) return false;
        }
        if (mentorId != null) {
            if (!p.mentor.id.equals(mentorId)) return false;
        }
        return true;
    }

    private void applyFields(Project p, CreateProjectRequest r) {
        if (r.title() != null) p.title = r.title();
        if (r.goal() != null) p.goal = r.goal();
        if (r.keyTasks() != null) p.keyTasks = r.keyTasks();
        if (r.valueText() != null) p.valueText = r.valueText();
        if (r.requiredSkills() != null) p.requiredSkills = r.requiredSkills();
        if (r.difficulty() != null) p.difficulty = Project.Difficulty.valueOf(r.difficulty());
        if (r.tags() != null) p.tags = r.tags();
        if (r.curriculumMatch() != null) p.curriculumMatch = r.curriculumMatch();
        if (r.thesisOk() != null) p.thesisOk = r.thesisOk();
        if (r.practiceOk() != null) p.practiceOk = r.practiceOk();
        if (r.courseworkOk() != null) p.courseworkOk = r.courseworkOk();
        if (r.responsibilityBoundaries() != null) p.responsibilityBoundaries = r.responsibilityBoundaries();
        if (r.contactPolicy() != null) p.contactPolicy = r.contactPolicy();
    }
}
