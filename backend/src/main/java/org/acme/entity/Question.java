package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "questions")
public class Question extends PanacheEntityBase {

    public enum Visibility { PUBLIC, PRIVATE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    public Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    public User author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Visibility visibility;

    @Column(columnDefinition = "TEXT", nullable = false)
    public String text;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
        if (visibility == null) visibility = Visibility.PUBLIC;
    }
}
