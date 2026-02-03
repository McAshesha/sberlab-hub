package org.acme.dto;

import java.util.List;

/**
 * Full project details with all related data — fetched in parallel.
 */
public record ProjectFullDto(
        ProjectDto project,
        List<ApplicationDto> applications,
        List<QuestionDto> questions,
        List<FeedbackDto> feedback
) {}
