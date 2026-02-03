package org.acme.resource;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.AllowListEntryDto;
import org.acme.dto.ErrorResponse;
import org.acme.dto.ProjectDto;
import org.acme.dto.UserDto;
import org.acme.entity.*;
import org.acme.validation.ValidEnum;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api/admin")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ADMIN")
@RunOnVirtualThread
public class AdminResource {

    @Inject JsonWebToken jwt;

    @Inject
    org.acme.service.ProjectSearchService searchService;

    @Inject
    @jakarta.inject.Named("virtualExecutor")
    java.util.concurrent.ExecutorService virtualExecutor;

    public record ChangeRoleRequest(
            @NotNull(message = "role is required") @ValidEnum(enumClass = User.Role.class) String role) {}

    public record AllowListRequest(
            @NotBlank(message = "email is required") @Email String email,
            @NotNull(message = "role is required") @ValidEnum(enumClass = User.Role.class) String role) {}

    // ── Users ──────────────────────────────────────────────────────

    @GET
    @Path("/users")
    public Response listUsers() {
        List<User> users = User.listAll();
        return Response.ok(users.stream().map(UserDto::from).toList()).build();
    }

    @PUT
    @Path("/users/{id}/role")
    @Transactional
    public Response changeRole(@PathParam("id") Long userId, @Valid ChangeRoleRequest req) {
        User user = User.findById(userId);
        if (user == null) return Response.status(404).build();
        user.role = User.Role.valueOf(req.role());
        return Response.ok(UserDto.from(user)).build();
    }

    @DELETE
    @Path("/users/{id}")
    @Transactional
    public Response deleteUser(@PathParam("id") Long userId) {
        Long callerId = Long.parseLong(jwt.getSubject());
        if (callerId.equals(userId)) {
            return Response.status(400).entity(new ErrorResponse("Cannot delete yourself")).build();
        }
        User user = User.findById(userId);
        if (user == null) return Response.status(404).build();

        // Delete answers where user is responder
        Answer.delete("responder.id", userId);
        // Delete answers to questions authored by this user
        Answer.delete("question.author.id", userId);
        // Delete questions authored by this user
        Question.delete("author.id", userId);
        // Delete feedback where user is student or mentor
        Feedback.delete("student.id = ?1 or mentor.id = ?1", userId);
        // Delete applications where user is student
        Application.delete("student.id", userId);

        // For each project where user is mentor, cascade delete project contents
        List<Project> mentorProjects = Project.list("mentor.id", userId);
        for (Project p : mentorProjects) {
            deleteProjectCascade(p);
        }

        user.delete();
        return Response.noContent().build();
    }

    // ── Projects ───────────────────────────────────────────────────

    @GET
    @Path("/projects")
    public Response listAllProjects() {
        List<Project> projects = Project.listAll();
        return Response.ok(projects.stream().map(ProjectDto::from).toList()).build();
    }

    @POST
    @Path("/projects/{id}/archive")
    @Transactional
    public Response archiveProject(@PathParam("id") Long projectId) {
        Project project = Project.findById(projectId);
        if (project == null) return Response.status(404).build();
        project.status = Project.Status.ARCHIVED;
        return Response.ok(ProjectDto.from(project)).build();
    }

    @DELETE
    @Path("/projects/{id}")
    @Transactional
    public Response deleteProject(@PathParam("id") Long projectId) {
        Project project = Project.findById(projectId);
        if (project == null) return Response.status(404).build();
        deleteProjectCascade(project);
        return Response.noContent().build();
    }

    @POST
    @Path("/projects/regenerate-embeddings")
    public Response regenerateAllEmbeddings() {
        try {
            searchService.regenerateAllEmbeddings();
            return Response.ok(java.util.Map.of(
                    "message", "Embedding regeneration completed successfully",
                    "status", "completed"
            )).build();
        } catch (Exception e) {
            org.jboss.logging.Logger.getLogger(AdminResource.class).errorf(e, "Failed to regenerate embeddings");
            return Response.status(500).entity(new ErrorResponse("Failed to regenerate embeddings: " + e.getMessage())).build();
        }
    }

    // ── Questions ──────────────────────────────────────────────────

    @DELETE
    @Path("/questions/{id}")
    @Transactional
    public Response deleteQuestion(@PathParam("id") Long questionId) {
        Question question = Question.findById(questionId);
        if (question == null) return Response.status(404).build();
        Answer.delete("question.id", questionId);
        question.delete();
        return Response.noContent().build();
    }

    // ── Answers ────────────────────────────────────────────────────

    @DELETE
    @Path("/answers/{id}")
    @Transactional
    public Response deleteAnswer(@PathParam("id") Long answerId) {
        Answer answer = Answer.findById(answerId);
        if (answer == null) return Response.status(404).build();
        answer.delete();
        return Response.noContent().build();
    }

    // ── Feedback ───────────────────────────────────────────────────

    @DELETE
    @Path("/feedback/{id}")
    @Transactional
    public Response deleteFeedback(@PathParam("id") Long feedbackId) {
        Feedback feedback = Feedback.findById(feedbackId);
        if (feedback == null) return Response.status(404).build();
        feedback.delete();
        return Response.noContent().build();
    }

    // ── Allow List ─────────────────────────────────────────────────

    @GET
    @Path("/allow-list")
    public Response listAllowList() {
        List<AllowListEntry> entries = AllowListEntry.listAll();
        return Response.ok(entries.stream().map(AllowListEntryDto::from).toList()).build();
    }

    @POST
    @Path("/allow-list")
    @Transactional
    public Response addAllowListEntry(@Valid AllowListRequest req) {
        User.Role role = User.Role.valueOf(req.role());
        if (role == User.Role.STUDENT) {
            return Response.status(400).entity(new ErrorResponse("STUDENT role does not need allow list — NSU emails are auto-approved")).build();
        }
        String email = req.email().toLowerCase().trim();
        if (AllowListEntry.findByEmailAndRole(email, role) != null) {
            return Response.status(409).entity(new ErrorResponse("Entry already exists")).build();
        }
        AllowListEntry entry = new AllowListEntry();
        entry.email = email;
        entry.role = role;
        entry.persist();
        return Response.status(201).entity(AllowListEntryDto.from(entry)).build();
    }

    @PUT
    @Path("/allow-list/{id}")
    @Transactional
    public Response updateAllowListEntry(@PathParam("id") Long id, AllowListRequest req) {
        AllowListEntry entry = AllowListEntry.findById(id);
        if (entry == null) return Response.status(404).build();
        if (req == null) {
            return Response.status(400).entity(new ErrorResponse("Request body is required")).build();
        }
        if (req.email() != null && !req.email().isBlank()) {
            entry.email = req.email().toLowerCase().trim();
        }
        if (req.role() != null) {
            User.Role role;
            try {
                role = User.Role.valueOf(req.role());
            } catch (IllegalArgumentException e) {
                return Response.status(400).entity(new ErrorResponse("Invalid role")).build();
            }
            if (role == User.Role.STUDENT) {
                return Response.status(400).entity(new ErrorResponse("STUDENT role does not need allow list")).build();
            }
            entry.role = role;
        }
        return Response.ok(AllowListEntryDto.from(entry)).build();
    }

    @DELETE
    @Path("/allow-list/{id}")
    @Transactional
    public Response deleteAllowListEntry(@PathParam("id") Long id) {
        AllowListEntry entry = AllowListEntry.findById(id);
        if (entry == null) return Response.status(404).build();
        entry.delete();
        return Response.noContent().build();
    }

    // ── Helpers ────────────────────────────────────────────────────

    private void deleteProjectCascade(Project project) {
        Long pid = project.id;
        // Delete answers for all questions of this project
        Answer.delete("question.project.id", pid);
        // Delete questions
        Question.delete("project.id", pid);
        // Delete applications
        Application.delete("project.id", pid);
        // Delete feedback
        Feedback.delete("project.id", pid);
        // Delete project
        project.delete();
    }
}
