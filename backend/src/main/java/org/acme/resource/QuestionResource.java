package org.acme.resource;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.AnswerDto;
import org.acme.dto.ErrorResponse;
import org.acme.dto.QuestionDto;
import org.acme.entity.Answer;
import org.acme.entity.Project;
import org.acme.entity.Question;
import org.acme.entity.User;
import org.acme.validation.ValidEnum;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RunOnVirtualThread
public class QuestionResource {

    @Inject JsonWebToken jwt;

    public record AskRequest(
            @NotBlank(message = "text is required") String text,
            @ValidEnum(enumClass = Question.Visibility.class) String visibility) {}

    public record AnswerRequest(
            @NotBlank(message = "text is required") String text) {}

    @GET
    @Path("/projects/{id}/questions")
    @RolesAllowed({"STUDENT", "TEACHER", "MENTOR", "ADMIN"})
    public Response listQuestions(@PathParam("id") Long projectId) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project project = Project.findById(projectId);
        if (project == null) return Response.status(404).build();

        // Access: must be able to see the project
        if (currentUser.role != User.Role.ADMIN && project.status != Project.Status.PUBLISHED
                && !project.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }

        List<Question> questions = Question.list("project.id = ?1 order by createdAt desc", projectId);

        // Filter private questions
        List<Question> visible = questions.stream().filter(q -> {
            if (q.visibility == Question.Visibility.PUBLIC) return true;
            if (currentUser.role == User.Role.ADMIN) return true;
            if (q.author.id.equals(currentUser.id)) return true;
            if (project.mentor.id.equals(currentUser.id)) return true;
            return false;
        }).toList();

        // Load answers in one query
        List<Long> qIds = visible.stream().map(q -> q.id).toList();
        Map<Long, Answer> answerMap = Map.of();
        if (!qIds.isEmpty()) {
            List<Answer> answers = Answer.list("question.id in ?1", qIds);
            answerMap = answers.stream().collect(Collectors.toMap(a -> a.question.id, a -> a));
        }

        Map<Long, Answer> finalAnswerMap = answerMap;
        List<QuestionDto> dtos = visible.stream()
                .map(q -> QuestionDto.from(q, finalAnswerMap.get(q.id)))
                .toList();

        return Response.ok(dtos).build();
    }

    @POST
    @Path("/projects/{id}/questions")
    @RolesAllowed({"STUDENT", "TEACHER", "MENTOR", "ADMIN"})
    @Transactional
    public Response askQuestion(@PathParam("id") Long projectId, @Valid AskRequest req) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Project project = Project.findById(projectId);
        if (project == null) return Response.status(404).build();

        Question q = new Question();
        q.project = project;
        q.author = currentUser;
        q.text = req.text();
        q.visibility = "PRIVATE".equalsIgnoreCase(req.visibility())
                ? Question.Visibility.PRIVATE : Question.Visibility.PUBLIC;
        q.persist();

        return Response.status(201).entity(QuestionDto.from(q, null)).build();
    }

    @POST
    @Path("/questions/{id}/answer")
    @RolesAllowed({"MENTOR", "ADMIN"})
    @Transactional
    public Response answerQuestion(@PathParam("id") Long questionId, @Valid AnswerRequest req) {
        User currentUser = User.findById(Long.parseLong(jwt.getSubject()));
        Question question = Question.findById(questionId);
        if (question == null) return Response.status(404).build();

        // Only project mentor or admin
        if (currentUser.role != User.Role.ADMIN
                && !question.project.mentor.id.equals(currentUser.id)) {
            return Response.status(403).build();
        }

        // Check if already answered
        Answer existing = Answer.find("question.id", questionId).firstResult();
        if (existing != null) {
            return Response.status(409).entity(new ErrorResponse("Question already answered")).build();
        }

        Answer a = new Answer();
        a.question = question;
        a.responder = currentUser;
        a.text = req.text();
        a.persist();

        return Response.status(201).entity(AnswerDto.from(a)).build();
    }
}
