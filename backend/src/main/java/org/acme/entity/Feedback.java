package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "feedback")
public class Feedback extends PanacheEntityBase {

    public enum Type { INTERIM, FINAL }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    public Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    public User student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentor_id", nullable = false)
    public User mentor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Type type;

    @Column(nullable = false)
    public int rating;

    @Column(columnDefinition = "TEXT")
    public String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
