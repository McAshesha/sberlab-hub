CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    name       VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id                         BIGSERIAL PRIMARY KEY,
    mentor_id                  BIGINT       NOT NULL REFERENCES users (id),
    title                      VARCHAR(500) NOT NULL,
    goal                       TEXT,
    key_tasks                  TEXT,
    value_text                 TEXT,
    required_skills            TEXT,
    difficulty                 VARCHAR(20)  NOT NULL DEFAULT 'MEDIUM',
    tags                       TEXT,
    curriculum_match           TEXT,
    thesis_ok                  BOOLEAN      NOT NULL DEFAULT FALSE,
    practice_ok                BOOLEAN      NOT NULL DEFAULT FALSE,
    coursework_ok              BOOLEAN      NOT NULL DEFAULT FALSE,
    responsibility_boundaries  TEXT,
    contact_policy             VARCHAR(500),
    status                     VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
    created_at                 TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_mentor ON projects (mentor_id);
CREATE INDEX idx_projects_status ON projects (status);

CREATE TABLE applications (
    id         BIGSERIAL PRIMARY KEY,
    project_id BIGINT      NOT NULL REFERENCES projects (id),
    student_id BIGINT      NOT NULL REFERENCES users (id),
    message    TEXT,
    status     VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP   NOT NULL DEFAULT now(),
    updated_at TIMESTAMP   NOT NULL DEFAULT now(),
    UNIQUE (project_id, student_id)
);
CREATE INDEX idx_applications_project ON applications (project_id);
CREATE INDEX idx_applications_student ON applications (student_id);

CREATE TABLE questions (
    id         BIGSERIAL PRIMARY KEY,
    project_id BIGINT      NOT NULL REFERENCES projects (id),
    author_id  BIGINT      NOT NULL REFERENCES users (id),
    visibility VARCHAR(20) NOT NULL DEFAULT 'PUBLIC',
    text       TEXT        NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT now()
);
CREATE INDEX idx_questions_project ON questions (project_id);

CREATE TABLE answers (
    id           BIGSERIAL PRIMARY KEY,
    question_id  BIGINT    UNIQUE NOT NULL REFERENCES questions (id),
    responder_id BIGINT    NOT NULL REFERENCES users (id),
    text         TEXT      NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE feedback (
    id         BIGSERIAL PRIMARY KEY,
    project_id BIGINT      NOT NULL REFERENCES projects (id),
    student_id BIGINT      NOT NULL REFERENCES users (id),
    mentor_id  BIGINT      NOT NULL REFERENCES users (id),
    type       VARCHAR(20) NOT NULL,
    rating     INTEGER     NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment    TEXT,
    created_at TIMESTAMP   NOT NULL DEFAULT now()
);
CREATE INDEX idx_feedback_project ON feedback (project_id);
CREATE INDEX idx_feedback_student ON feedback (student_id);
