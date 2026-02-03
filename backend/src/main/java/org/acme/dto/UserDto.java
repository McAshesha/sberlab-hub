package org.acme.dto;

import org.acme.entity.User;
import java.time.Instant;

public record UserDto(Long id, String email, String name, String role, Instant createdAt) {
    public static UserDto from(User u) {
        return new UserDto(u.id, u.email, u.name, u.role.name(), u.createdAt);
    }
}
