package org.acme.dto;

import org.acme.entity.Feedback;
import java.time.Instant;

public record FeedbackDto(
        Long id, Long projectId, Long studentId, String studentName,
        Long mentorId, String mentorName,
        String type, int rating, String comment, Instant createdAt) {

    public static FeedbackDto from(Feedback f) {
        return new FeedbackDto(
                f.id, f.project.id, f.student.id, f.student.name,
                f.mentor.id, f.mentor.name,
                f.type.name(), f.rating, f.comment, f.createdAt);
    }
}
