package org.acme.dto;

import org.acme.entity.Project;
import java.time.Instant;

public record ProjectDto(
        Long id, Long mentorId, String mentorName, String mentorEmail,
        String title, String goal, String keyTasks, String valueText,
        String requiredSkills, String difficulty, String tags, String curriculumMatch,
        boolean thesisOk, boolean practiceOk, boolean courseworkOk,
        String responsibilityBoundaries, String contactPolicy,
        String status, Instant createdAt, Instant updatedAt) {

    public static ProjectDto from(Project p) {
        return new ProjectDto(
                p.id, p.mentor.id, p.mentor.name, p.mentor.email,
                p.title, p.goal, p.keyTasks, p.valueText,
                p.requiredSkills, p.difficulty.name(), p.tags, p.curriculumMatch,
                p.thesisOk, p.practiceOk, p.courseworkOk,
                p.responsibilityBoundaries, p.contactPolicy,
                p.status.name(), p.createdAt, p.updatedAt);
    }
}
