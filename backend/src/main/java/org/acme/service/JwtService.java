package org.acme.service;

import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.User;

import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class JwtService {

    public String generateToken(User user) {
        return Jwt.issuer("sberlab-hub")
                .subject(String.valueOf(user.id))
                .upn(user.email)
                .groups(Set.of(user.role.name()))
                .claim("name", user.name)
                .expiresIn(Duration.ofHours(24))
                .sign();
    }
}
