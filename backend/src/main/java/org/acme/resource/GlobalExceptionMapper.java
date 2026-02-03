package org.acme.resource;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.persistence.PersistenceException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.core.Response;
import org.acme.dto.ErrorResponse;
import org.jboss.resteasy.reactive.server.ServerExceptionMapper;

import java.util.stream.Collectors;

public class GlobalExceptionMapper {

    @ServerExceptionMapper
    public Response handleConstraintViolation(ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .map(v -> {
                    String field = "";
                    var path = v.getPropertyPath();
                    // Extract the last element (field name) from the path
                    for (var node : path) {
                        field = node.getName();
                    }
                    return field + " " + v.getMessage();
                })
                .sorted()
                .collect(Collectors.joining("; "));
        return Response.status(400).entity(new ErrorResponse(message)).build();
    }

    @ServerExceptionMapper
    public Response handleIllegalArgument(IllegalArgumentException e) {
        return Response.status(400).entity(new ErrorResponse(e.getMessage())).build();
    }

    @ServerExceptionMapper
    public Response handlePersistence(PersistenceException e) {
        String rootMessage = rootCauseMessage(e);
        if (rootMessage != null) {
            String lower = rootMessage.toLowerCase();
            if (lower.contains("unique") || lower.contains("duplicate")) {
                return Response.status(409).entity(new ErrorResponse("Duplicate entry")).build();
            }
            if (lower.contains("check") || lower.contains("violates check")) {
                return Response.status(400).entity(new ErrorResponse("Constraint violation")).build();
            }
        }
        return Response.status(500).entity(new ErrorResponse("Internal server error")).build();
    }

    @ServerExceptionMapper
    public Response handleJsonProcessing(JsonProcessingException e) {
        return Response.status(400).entity(new ErrorResponse("Malformed request body")).build();
    }

    private static String rootCauseMessage(Throwable t) {
        Throwable cause = t;
        while (cause.getCause() != null && cause.getCause() != cause) {
            cause = cause.getCause();
        }
        return cause.getMessage();
    }
}
