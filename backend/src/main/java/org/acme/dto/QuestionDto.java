package org.acme.dto;

import org.acme.entity.Answer;
import org.acme.entity.Question;
import java.time.Instant;

public record QuestionDto(
        Long id, Long projectId, Long authorId, String authorName,
        String visibility, String text, Instant createdAt,
        AnswerDto answer) {

    public static QuestionDto from(Question q, Answer a) {
        return new QuestionDto(
                q.id, q.project.id, q.author.id, q.author.name,
                q.visibility.name(), q.text, q.createdAt,
                a != null ? AnswerDto.from(a) : null);
    }
}
