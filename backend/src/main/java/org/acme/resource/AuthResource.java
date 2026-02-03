package org.acme.resource;

import io.smallrye.common.annotation.RunOnVirtualThread;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.acme.dto.AuthResponse;
import org.acme.dto.ErrorResponse;
import org.acme.dto.UserDto;
import org.acme.entity.AllowListEntry;
import org.acme.entity.User;
import org.acme.service.JwtService;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Executors;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RunOnVirtualThread
public class AuthResource {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);

    // HTTP client configured for virtual threads with timeouts
    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(CONNECT_TIMEOUT)
            .executor(Executors.newVirtualThreadPerTaskExecutor())
            .build();

    @Inject JwtService jwtService;
    @Inject JsonWebToken jwt;

    @ConfigProperty(name = "app.dev-auth", defaultValue = "false")
    boolean devAuth;

    @ConfigProperty(name = "app.google.client-id", defaultValue = "")
    String googleClientId;

    public record GoogleLoginRequest(@NotBlank(message = "idToken is required") String idToken) {}
    public record DevLoginRequest(@NotBlank(message = "email is required") @Email String email, String name, String role) {}

    @GET
    @Path("/me")
    public Response me() {
        if (jwt.getSubject() == null) {
            return Response.status(401).build();
        }
        User user = User.findById(Long.parseLong(jwt.getSubject()));
        if (user == null) return Response.status(401).build();
        return Response.ok(UserDto.from(user)).build();
    }

    @POST
    @Path("/google")
    @PermitAll
    @Transactional
    public Response googleLogin(@Valid GoogleLoginRequest req) {
        try {
            // Verify the Google ID token via Google's tokeninfo endpoint
            HttpRequest httpReq = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + req.idToken()))
                    .timeout(REQUEST_TIMEOUT)
                    .GET()
                    .build();
            HttpResponse<String> resp = HTTP_CLIENT.send(httpReq, HttpResponse.BodyHandlers.ofString());

            if (resp.statusCode() != 200) {
                return Response.status(401).entity(new ErrorResponse("Invalid Google token")).build();
            }

            // Simple JSON parsing (avoid extra deps)
            String body = resp.body();
            String email = extractJsonField(body, "email");
            String name = extractJsonField(body, "name");
            String aud = extractJsonField(body, "aud");

            if (email == null || email.isBlank()) {
                return Response.status(401).entity(new ErrorResponse("Could not extract email from Google token")).build();
            }

            // Verify audience matches our client ID
            if (googleClientId != null && !googleClientId.isBlank() && !googleClientId.equals(aud)) {
                return Response.status(401).entity(new ErrorResponse("Token audience mismatch")).build();
            }

            if (name == null || name.isBlank()) name = email.split("@")[0];

            User user = User.findByEmail(email);
            if (user == null) {
                User.Role role = resolveRole(email);
                if (role == null) {
                    return Response.status(403)
                            .entity(new ErrorResponse("Access denied: your email is not in the allow list and is not from an NSU domain"))
                            .build();
                }
                user = new User();
                user.email = email;
                user.name = name;
                user.role = role;
                user.persist();
            } else {
                user.name = name;
            }

            String token = jwtService.generateToken(user);
            return Response.ok(new AuthResponse(token, UserDto.from(user))).build();

        } catch (java.net.http.HttpTimeoutException e) {
            return Response.status(504).entity(new ErrorResponse("Google auth timed out")).build();
        } catch (Exception e) {
            return Response.status(500).entity(new ErrorResponse("Google auth failed: " + e.getMessage())).build();
        }
    }

    @POST
    @Path("/dev-login")
    @PermitAll
    @Transactional
    public Response devLogin(@Valid DevLoginRequest req) {
        if (!devAuth) {
            return Response.status(404).build();
        }

        String name = (req.name() != null && !req.name().isBlank()) ? req.name() : req.email().split("@")[0];
        User.Role role;
        try {
            role = User.Role.valueOf(req.role() != null ? req.role() : "STUDENT");
        } catch (IllegalArgumentException e) {
            role = User.Role.STUDENT;
        }

        User user = User.findByEmail(req.email());
        if (user == null) {
            user = new User();
            user.email = req.email();
            user.name = name;
            user.role = role;
            user.persist();
        } else {
            user.name = name;
            user.role = role;
        }

        String token = jwtService.generateToken(user);
        return Response.ok(new AuthResponse(token, UserDto.from(user))).build();
    }

    private static final Set<String> NSU_DOMAINS = Set.of("g.nsu.ru", "nsu.ru");

    /**
     * Resolve role for a new user based on allow list or email domain.
     * Returns null if the user is not allowed to register.
     */
    private User.Role resolveRole(String email) {
        List<AllowListEntry> entries = AllowListEntry.findAllByEmail(email.toLowerCase());
        if (!entries.isEmpty()) {
            // Return highest-privilege role: ADMIN > TEACHER > MENTOR > STUDENT
            return entries.stream()
                    .map(e -> e.role)
                    .max(java.util.Comparator.comparingInt(r -> r.ordinal()))
                    .orElse(null);
        }
        // Check NSU domain for student auto-registration
        String domain = email.substring(email.indexOf('@') + 1).toLowerCase();
        if (NSU_DOMAINS.contains(domain)) {
            return User.Role.STUDENT;
        }
        return null;
    }

    private String extractJsonField(String json, String field) {
        String key = "\"" + field + "\"";
        int idx = json.indexOf(key);
        if (idx < 0) return null;
        int colon = json.indexOf(':', idx);
        if (colon < 0) return null;
        int start = json.indexOf('"', colon + 1);
        if (start < 0) return null;
        int end = json.indexOf('"', start + 1);
        if (end < 0) return null;
        return json.substring(start + 1, end);
    }
}
