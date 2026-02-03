package org.acme.resource;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.ErrorResponse;
import org.acme.dto.FeedbackDto;
import org.acme.entity.Application;
import org.acme.entity.Feedback;
import org.acme.entity.Project;
import org.acme.entity.User;
import org.acme.validation.ValidEnum;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RunOnVirtualThread
public class FeedbackResource {

    @Inject JsonWebToken jwt;

    public record CreateFeedbackRequest(
            @NotNull(message = "studentId is required") Long studentId,
            @NotNull(message = "type is required") @ValidEnum(enumClass = Feedback.Type.class) String type,
            @Min(value = 1, message = "rating must be at least 1") @Max(value = 5, message = "rating must be at most 5") int rating,
            String comment) {}

    @POST
    @Path("/projects/{projectId}/feedback")
    @RolesAllowed({"MENTOR", "ADMIN"})
    @Transactional
    public Response createFeedback(@PathParam("projectId") Long projectId, @Valid CreateFeedbackRequest req) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project project = Project.findById(projectId);
        if (project == null) return Response.status(404).build();
        if (currentUser.role != User.Role.ADMIN && !project.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }

        // Verify student is approved for this project
        Application app = Application.find("project.id = ?1 AND student.id = ?2 AND status = ?3",
                projectId, req.studentId(), Application.Status.APPROVED).firstResult();
        if (app == null) {
            return Response.status(400).entity(new ErrorResponse("Student is not approved for this project")).build();
        }

        User student = User.findById(req.studentId());
        if (student == null) return Response.status(404).build();

        Feedback.Type type = Feedback.Type.valueOf(req.type());

        Feedback f = new Feedback();
        f.project = project;
        f.student = student;
        f.mentor = currentUser;
        f.type = type;
        f.rating = req.rating();
        f.comment = req.comment();
        f.persist();

        return Response.status(201).entity(FeedbackDto.from(f)).build();
    }

    @GET
    @Path("/projects/{projectId}/feedback")
    @RolesAllowed({"STUDENT", "MENTOR", "ADMIN"})
    public Response listFeedback(@PathParam("projectId") Long projectId) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project project = Project.findById(projectId);
        if (project == null) return Response.status(404).build();

        // Access rules
        boolean canView = false;
        if (currentUser.role == User.Role.ADMIN) {
            canView = true;
        } else if (project.mentor.id.equals(currentUser.id)) {
            canView = true;
        } else if (currentUser.role == User.Role.STUDENT) {
            // Student can view only if approved
            Application app = Application.find("project.id = ?1 AND student.id = ?2 AND status = ?3",
                    projectId, currentUser.id, Application.Status.APPROVED).firstResult();
            canView = (app != null);
        }

        if (!canView) return Response.status(403).build();

        List<Feedback> feedbackList;
        if (currentUser.role == User.Role.STUDENT) {
            feedbackList = Feedback.list("project.id = ?1 AND student.id = ?2", projectId, currentUser.id);
        } else {
            feedbackList = Feedback.list("project.id", projectId);
        }

        return Response.ok(feedbackList.stream().map(FeedbackDto::from).toList()).build();
    }
}
