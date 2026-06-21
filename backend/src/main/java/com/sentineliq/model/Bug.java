package com.sentineliq.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Entity
@Table(name = "bugs")
public class Bug {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @NotBlank
    @Column(nullable = false)
    private String severity; // "LOW", "MEDIUM", "HIGH", "CRITICAL"

    @NotBlank
    @Column(nullable = false)
    private String status; // "OPEN", "IN_PROGRESS", "RESOLVED"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reporter_id")
    private User reporter;

    @Column(name = "created_at")
    private LocalDate createdAt = LocalDate.now();

    private String resolution;

    public Bug() {}

    public Bug(Long id, Project project, String title, String description, String severity, String status,
               User assignee, User reporter, LocalDate createdAt, String resolution) {
        this.id = id;
        this.project = project;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.status = status;
        this.assignee = assignee;
        this.reporter = reporter;
        this.createdAt = createdAt != null ? createdAt : LocalDate.now();
        this.resolution = resolution;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getAssignee() { return assignee; }
    public void setAssignee(User assignee) { this.assignee = assignee; }

    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }

    public static BugBuilder builder() {
        return new BugBuilder();
    }

    public static class BugBuilder {
        private Long id;
        private Project project;
        private String title;
        private String description;
        private String severity;
        private String status;
        private User assignee;
        private User reporter;
        private LocalDate createdAt = LocalDate.now();
        private String resolution;

        public BugBuilder id(Long id) { this.id = id; return this; }
        public BugBuilder project(Project project) { this.project = project; return this; }
        public BugBuilder title(String title) { this.title = title; return this; }
        public BugBuilder description(String description) { this.description = description; return this; }
        public BugBuilder severity(String severity) { this.severity = severity; return this; }
        public BugBuilder status(String status) { this.status = status; return this; }
        public BugBuilder assignee(User assignee) { this.assignee = assignee; return this; }
        public BugBuilder reporter(User reporter) { this.reporter = reporter; return this; }
        public BugBuilder createdAt(LocalDate createdAt) { this.createdAt = createdAt; return this; }
        public BugBuilder resolution(String resolution) { this.resolution = resolution; return this; }

        public Bug build() {
            return new Bug(id, project, title, description, severity, status, assignee, reporter, createdAt, resolution);
        }
    }
}
