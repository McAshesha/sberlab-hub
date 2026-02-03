package org.acme.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "answers")
public class Answer extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "question_id", unique = true, nullable = false)
    public Question question;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "responder_id", nullable = false)
    public User responder;

    @Column(columnDefinition = "TEXT", nullable = false)
    public String text;

    @Column(name = "created_at", nullable = false, updatable = false)
    public Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }
}
