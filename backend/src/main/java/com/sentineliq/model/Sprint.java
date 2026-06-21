package com.sentineliq.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Entity
@Table(name = "sprints")
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String goal;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotBlank
    @Column(nullable = false)
    private String status; // "FUTURE", "ACTIVE", "COMPLETED"

    @Column(name = "completion_percentage")
    private Double completionPercentage = 0.0;

    public Sprint() {}

    public Sprint(Long id, Project project, String name, String goal, LocalDate startDate, LocalDate endDate,
                  String status, Double completionPercentage) {
        this.id = id;
        this.project = project;
        this.name = name;
        this.goal = goal;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.completionPercentage = completionPercentage != null ? completionPercentage : 0.0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGoal() { return goal; }
    public void setGoal(String goal) { this.goal = goal; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; }

    public static SprintBuilder builder() {
        return new SprintBuilder();
    }

    public static class SprintBuilder {
        private Long id;
        private Project project;
        private String name;
        private String goal;
        private LocalDate startDate;
        private LocalDate endDate;
        private String status;
        private Double completionPercentage = 0.0;

        public SprintBuilder id(Long id) { this.id = id; return this; }
        public SprintBuilder project(Project project) { this.project = project; return this; }
        public SprintBuilder name(String name) { this.name = name; return this; }
        public SprintBuilder goal(String goal) { this.goal = goal; return this; }
        public SprintBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public SprintBuilder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public SprintBuilder status(String status) { this.status = status; return this; }
        public SprintBuilder completionPercentage(Double completionPercentage) { this.completionPercentage = completionPercentage; return this; }

        public Sprint build() {
            return new Sprint(id, project, name, goal, startDate, endDate, status, completionPercentage);
        }
    }
}
