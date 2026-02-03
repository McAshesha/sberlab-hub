package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "allow_list", uniqueConstraints = @UniqueConstraint(columnNames = {"email", "role"}))
public class AllowListEntry extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(nullable = false)
    public String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public User.Role role;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public static AllowListEntry findByEmailAndRole(String email, User.Role role) {
        return find("email = ?1 and role = ?2", email, role).firstResult();
    }

    public static List<AllowListEntry> findAllByEmail(String email) {
        return list("email", email);
    }
}
