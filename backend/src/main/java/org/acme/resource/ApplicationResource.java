package org.acme.resource;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.ApplicationDto;
import org.acme.dto.ErrorResponse;
import org.acme.entity.Application;
import org.acme.entity.Project;
import org.acme.entity.User;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RunOnVirtualThread
public class ApplicationResource {

    @Inject JsonWebToken jwt;

    public record ApplyRequest(String message) {}

    @POST
    @Path("/projects/{id}/apply")
    @RolesAllowed("STUDENT")
    @Transactional
    public Response apply(@PathParam("id") Long projectId, ApplyRequest req) {
        User student = User.findById(Long.parseLong(jwt.getSubject()));
        Project project = Project.findById(projectId);
        if (project == null) return Response.status(404).build();
        if (project.status != Project.Status.PUBLISHED) {
            return Response.status(400).entity(new ErrorResponse("Project is not published")).build();
        }

        // Check duplicate
        long existing = Application.count("project.id = ?1 AND student.id = ?2", projectId, student.id);
        if (existing > 0) {
            return Response.status(409).entity(new ErrorResponse("You already applied to this project")).build();
        }

        Application app = new Application();
        app.project = project;
        app.student = student;
        app.message = req != null ? req.message() : null;
        app.status = Application.Status.PENDING;
        app.persist();
        return Response.status(201).entity(ApplicationDto.from(app)).build();
    }

    @GET
    @Path("/projects/{id}/applications")
    @RolesAllowed({"MENTOR", "ADMIN"})
    public Response listForProject(@PathParam("id") Long projectId) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project project = Project.findById(projectId);
        if (project == null) return Response.status(404).build();
        if (currentUser.role != User.Role.ADMIN && !project.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }

        List<Application> apps = Application.list("project.id", projectId);
        return Response.ok(apps.stream().map(ApplicationDto::from).toList()).build();
    }

    @POST
    @Path("/applications/{id}/approve")
    @RolesAllowed({"MENTOR", "ADMIN"})
    @Transactional
    public Response approve(@PathParam("id") Long appId) {
        return updateStatus(appId, Application.Status.APPROVED);
    }

    @POST
    @Path("/applications/{id}/reject")
    @RolesAllowed({"MENTOR", "ADMIN"})
    @Transactional
    public Response reject(@PathParam("id") Long appId) {
        return updateStatus(appId, Application.Status.REJECTED);
    }

    @GET
    @Path("/me/applications")
    @RolesAllowed("STUDENT")
    public Response myApplications() {
        User student = User.findById(Long.parseLong(jwt.getSubject()));
        List<Application> apps = Application.list("student.id", student.id);
        return Response.ok(apps.stream().map(ApplicationDto::from).toList()).build();
    }

    private Response updateStatus(Long appId, Application.Status newStatus) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Application app = Application.findById(appId);
        if (app == null) return Response.status(404).build();
        if (currentUser.role != User.Role.ADMIN && !app.project.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }
        app.status = newStatus;
        return Response.ok(ApplicationDto.from(app)).build();
    }
}
