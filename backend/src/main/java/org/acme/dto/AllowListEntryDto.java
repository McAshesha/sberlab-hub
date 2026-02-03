package org.acme.dto;

import org.acme.entity.AllowListEntry;
import java.time.Instant;

public record AllowListEntryDto(Long id, String email, String role, Instant createdAt) {
    public static AllowListEntryDto from(AllowListEntry e) {
        return new AllowListEntryDto(e.id, e.email, e.role.name(), e.createdAt);
    }
}
