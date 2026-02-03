package org.acme.dto;

import org.acme.entity.Application;
import java.time.Instant;

public record ApplicationDto(
        Long id, Long projectId, String projectTitle,
        Long studentId, String studentName, String studentEmail,
        String message, String status,
        Instant createdAt, Instant updatedAt) {

    public static ApplicationDto from(Application a) {
        return new ApplicationDto(
                a.id, a.project.id, a.project.title,
                a.student.id, a.student.name, a.student.email,
                a.message, a.status.name(),
                a.createdAt, a.updatedAt);
    }
}
