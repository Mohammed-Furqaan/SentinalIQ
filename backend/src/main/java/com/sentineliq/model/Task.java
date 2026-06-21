package com.sentineliq.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sprint_id")
    private Sprint sprint;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @NotBlank
    @Column(nullable = false)
    private String priority; // "LOW", "MEDIUM", "HIGH", "CRITICAL"

    @NotBlank
    @Column(nullable = false)
    private String status; // "BACKLOG", "TODO", "IN_PROGRESS", "TESTING", "COMPLETED"

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id")
    private User assignee;

    public Task() {}

    public Task(Long id, Project project, Sprint sprint, String title, String description, String priority,
                String status, LocalDate dueDate, User assignee) {
        this.id = id;
        this.project = project;
        this.sprint = sprint;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.status = status;
        this.dueDate = dueDate;
        this.assignee = assignee;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Sprint getSprint() { return sprint; }
    public void setSprint(Sprint sprint) { this.sprint = sprint; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public User getAssignee() { return assignee; }
    public void setAssignee(User assignee) { this.assignee = assignee; }

    public static TaskBuilder builder() {
        return new TaskBuilder();
    }

    public static class TaskBuilder {
        private Long id;
        private Project project;
        private Sprint sprint;
        private String title;
        private String description;
        private String priority;
        private String status;
        private LocalDate dueDate;
        private User assignee;

        public TaskBuilder id(Long id) { this.id = id; return this; }
        public TaskBuilder project(Project project) { this.project = project; return this; }
        public TaskBuilder sprint(Sprint sprint) { this.sprint = sprint; return this; }
        public TaskBuilder title(String title) { this.title = title; return this; }
        public TaskBuilder description(String description) { this.description = description; return this; }
        public TaskBuilder priority(String priority) { this.priority = priority; return this; }
        public TaskBuilder status(String status) { this.status = status; return this; }
        public TaskBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public TaskBuilder assignee(User assignee) { this.assignee = assignee; return this; }

        public Task build() {
            return new Task(id, project, sprint, title, description, priority, status, dueDate, assignee);
        }
    }
}
