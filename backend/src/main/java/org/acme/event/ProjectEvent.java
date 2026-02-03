package org.acme.event;

/**
 * Event fired when a project is created or updated.
 * Used to trigger embedding generation after transaction commits.
 */
public class ProjectEvent {

    private final Long projectId;
    private final EventType type;

    public enum EventType {
        CREATED,
        UPDATED
    }

    public ProjectEvent(Long projectId, EventType type) {
        this.projectId = projectId;
        this.type = type;
    }

    public Long getProjectId() {
        return projectId;
    }

    public EventType getType() {
        return type;
    }
}
