package org.acme.dto;

import org.acme.entity.Answer;
import java.time.Instant;

public record AnswerDto(Long id, Long responderId, String responderName, String text, Instant createdAt) {
    public static AnswerDto from(Answer a) {
        return new AnswerDto(a.id, a.responder.id, a.responder.name, a.text, a.createdAt);
    }
}
