package org.acme.service;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import org.acme.entity.AllowListEntry;
import org.acme.entity.Project;
import org.acme.entity.User;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Optional;

@ApplicationScoped
public class DataSeeder {

    private static final Logger LOG = Logger.getLogger(DataSeeder.class);

    @ConfigProperty(name = "app.admin.bootstrap-email", defaultValue = "")
    String adminEmail;

    @Transactional
    void onStart(@Observes StartupEvent ev) {
        if (adminEmail != null && !adminEmail.isBlank()) {
            User admin = User.findByEmail(adminEmail);
            if (admin == null) {
                admin = new User();
                admin.email = adminEmail;
                admin.name = "Admin";
                admin.role = User.Role.ADMIN;
                admin.persist();
                LOG.infof("Bootstrapped admin user: %s", adminEmail);
            } else if (admin.role != User.Role.ADMIN) {
                admin.role = User.Role.ADMIN;
                LOG.infof("Promoted existing user to ADMIN: %s", adminEmail);
            }

            // Ensure bootstrap admin email is in allow list
            if (AllowListEntry.findByEmailAndRole(adminEmail.toLowerCase(), User.Role.ADMIN) == null) {
                AllowListEntry entry = new AllowListEntry();
                entry.email = adminEmail.toLowerCase();
                entry.role = User.Role.ADMIN;
                entry.persist();
                LOG.infof("Added bootstrap admin to allow list: %s", adminEmail);
            }
        }

        // Seed sample data if DB is empty
        if (Project.count() == 0 && User.count("role", User.Role.MENTOR) == 0) {
            seedSampleData();
        }
    }

    private void seedSampleData() {
        User mentor = new User();
        mentor.email = "mentor@example.com";
        mentor.name = "Ivan Petrov";
        mentor.role = User.Role.MENTOR;
        mentor.persist();

        User student = new User();
        student.email = "student@example.com";
        student.name = "Anna Sidorova";
        student.role = User.Role.STUDENT;
        student.persist();

        User teacher = new User();
        teacher.email = "teacher@example.com";
        teacher.name = "Prof. Kuznetsov";
        teacher.role = User.Role.TEACHER;
        teacher.persist();

        Project p1 = new Project();
        p1.mentor = mentor;
        p1.title = "ML-based Credit Scoring Model";
        p1.goal = "Build a machine learning model to predict creditworthiness of retail clients.";
        p1.keyTasks = "Data preprocessing, feature engineering, model training, evaluation, deployment prototype";
        p1.valueText = "Practical application of ML in fintech; potential integration into Sber's scoring pipeline.";
        p1.requiredSkills = "Python,scikit-learn,pandas,SQL";
        p1.difficulty = Project.Difficulty.MEDIUM;
        p1.tags = "ML,fintech,data-science";
        p1.curriculumMatch = "Machine Learning, Data Analysis";
        p1.thesisOk = true;
        p1.practiceOk = true;
        p1.courseworkOk = false;
        p1.responsibilityBoundaries = "Student handles model development; mentor provides data and business context.";
        p1.contactPolicy = "Telegram chat + weekly sync calls";
        p1.status = Project.Status.PUBLISHED;
        p1.persist();

        Project p2 = new Project();
        p2.mentor = mentor;
        p2.title = "Mobile App UX Research for SberPay";
        p2.goal = "Conduct UX research and propose UI improvements for the SberPay mobile application.";
        p2.keyTasks = "User interviews, heuristic evaluation, wireframing, A/B test plan";
        p2.valueText = "Direct impact on user experience for millions of SberPay users.";
        p2.requiredSkills = "UX research,Figma,user interviews";
        p2.difficulty = Project.Difficulty.EASY;
        p2.tags = "UX,mobile,design";
        p2.curriculumMatch = "Human-Computer Interaction, Design Thinking";
        p2.thesisOk = false;
        p2.practiceOk = true;
        p2.courseworkOk = true;
        p2.responsibilityBoundaries = "Student leads research; mentor reviews findings and provides access to analytics.";
        p2.contactPolicy = "Email + bi-weekly meetings";
        p2.status = Project.Status.PUBLISHED;
        p2.persist();

        LOG.info("Seeded sample mentor, student, teacher and 2 projects");
    }
}
