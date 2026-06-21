package com.sentineliq.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @NotBlank
    @Column(nullable = false)
    private String status; // "PLANNING", "ACTIVE", "COMPLETED", "DELAYED"

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "risk_score")
    private Double riskScore = 0.0;

    @Column(name = "risk_level")
    private String riskLevel = "Low"; // "Low", "Medium", "High"

    @Column(name = "productivity_score")
    private Double productivityScore = 100.0;

    @Column(name = "completion_forecast")
    private String completionForecast = "On Track"; // "On Track", "Delayed", "At Risk"

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "manager_id")
    private User manager;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "project_teams",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "team_id")
    )
    private List<Team> teams = new ArrayList<>();

    public Project() {}

    public Project(Long id, String name, String description, String status, LocalDate startDate, LocalDate endDate,
                   Double riskScore, String riskLevel, Double productivityScore, String completionForecast,
                   User manager, List<Team> teams) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.riskScore = riskScore != null ? riskScore : 0.0;
        this.riskLevel = riskLevel != null ? riskLevel : "Low";
        this.productivityScore = productivityScore != null ? productivityScore : 100.0;
        this.completionForecast = completionForecast != null ? completionForecast : "On Track";
        this.manager = manager;
        this.teams = teams != null ? teams : new ArrayList<>();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Double getProductivityScore() { return productivityScore; }
    public void setProductivityScore(Double productivityScore) { this.productivityScore = productivityScore; }

    public String getCompletionForecast() { return completionForecast; }
    public void setCompletionForecast(String completionForecast) { this.completionForecast = completionForecast; }

    public User getManager() { return manager; }
    public void setManager(User manager) { this.manager = manager; }

    public List<Team> getTeams() { return teams; }
    public void setTeams(List<Team> teams) { this.teams = teams; }

    public static ProjectBuilder builder() {
        return new ProjectBuilder();
    }

    public static class ProjectBuilder {
        private Long id;
        private String name;
        private String description;
        private String status;
        private LocalDate startDate;
        private LocalDate endDate;
        private Double riskScore = 0.0;
        private String riskLevel = "Low";
        private Double productivityScore = 100.0;
        private String completionForecast = "On Track";
        private User manager;
        private List<Team> teams = new ArrayList<>();

        public ProjectBuilder id(Long id) { this.id = id; return this; }
        public ProjectBuilder name(String name) { this.name = name; return this; }
        public ProjectBuilder description(String description) { this.description = description; return this; }
        public ProjectBuilder status(String status) { this.status = status; return this; }
        public ProjectBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public ProjectBuilder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public ProjectBuilder riskScore(Double riskScore) { this.riskScore = riskScore; return this; }
        public ProjectBuilder riskLevel(String riskLevel) { this.riskLevel = riskLevel; return this; }
        public ProjectBuilder productivityScore(Double productivityScore) { this.productivityScore = productivityScore; return this; }
        public ProjectBuilder completionForecast(String completionForecast) { this.completionForecast = completionForecast; return this; }
        public ProjectBuilder manager(User manager) { this.manager = manager; return this; }
        public ProjectBuilder teams(List<Team> teams) { this.teams = teams; return this; }

        public Project build() {
            return new Project(id, name, description, status, startDate, endDate, riskScore, riskLevel,
                    productivityScore, completionForecast, manager, teams);
        }
    }
}
