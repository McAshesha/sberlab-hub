package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;

@Entity
@Table(name = "projects")
public class Project extends PanacheEntityBase {

    public enum Status { DRAFT, PUBLISHED, ARCHIVED }
    public enum Difficulty { EASY, MEDIUM, HARD }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mentor_id", nullable = false)
    public User mentor;

    @Column(nullable = false, length = 500)
    public String title;

    @Column(columnDefinition = "TEXT")
    public String goal;

    @Column(name = "key_tasks", columnDefinition = "TEXT")
    public String keyTasks;

    @Column(name = "value_text", columnDefinition = "TEXT")
    public String valueText;

    @Column(name = "required_skills", columnDefinition = "TEXT")
    public String requiredSkills;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Difficulty difficulty;

    @Column(columnDefinition = "TEXT")
    public String tags;

    @Column(name = "curriculum_match", columnDefinition = "TEXT")
    public String curriculumMatch;

    @Column(name = "thesis_ok", nullable = false)
    public boolean thesisOk;

    @Column(name = "practice_ok", nullable = false)
    public boolean practiceOk;

    @Column(name = "coursework_ok", nullable = false)
    public boolean courseworkOk;

    @Column(name = "responsibility_boundaries", columnDefinition = "TEXT")
    public String responsibilityBoundaries;

    @Column(name = "contact_policy", length = 500)
    public String contactPolicy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Status status;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    public Instant updatedAt;

    @Column(name = "embedding", columnDefinition = "vector(1024)")
    @JdbcTypeCode(SqlTypes.OTHER)
    @Convert(converter = VectorConverter.class)
    public String embedding;  // Stored as pgvector string format: [0.1, 0.2, ...]

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = Instant.now();
        if (status == null) status = Status.DRAFT;
        if (difficulty == null) difficulty = Difficulty.MEDIUM;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
