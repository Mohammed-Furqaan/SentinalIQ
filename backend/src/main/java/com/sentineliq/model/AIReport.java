package com.sentineliq.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_reports")
public class AIReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "risk_level")
    private String riskLevel; // "Low", "Medium", "High"

    @Column(name = "sprint_delay_prediction")
    private Double sprintDelayPrediction; // e.g. percentage likelihood (0.0 to 100.0)

    @Column(name = "productivity_score")
    private Double productivityScore;

    @Column(name = "bug_forecasting")
    private String bugForecasting;

    @Column(length = 2000)
    private String recommendations; // Semi-colon or new-line separated values

    @Column(length = 2000)
    private String summary;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public AIReport() {}

    public AIReport(Long id, Project project, Double riskScore, String riskLevel, Double sprintDelayPrediction,
                    Double productivityScore, String bugForecasting, String recommendations, String summary,
                    LocalDateTime createdAt) {
        this.id = id;
        this.project = project;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.sprintDelayPrediction = sprintDelayPrediction;
        this.productivityScore = productivityScore;
        this.bugForecasting = bugForecasting;
        this.recommendations = recommendations;
        this.summary = summary;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Double getRiskScore() { return riskScore; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public Double getSprintDelayPrediction() { return sprintDelayPrediction; }
    public void setSprintDelayPrediction(Double sprintDelayPrediction) { this.sprintDelayPrediction = sprintDelayPrediction; }

    public Double getProductivityScore() { return productivityScore; }
    public void setProductivityScore(Double productivityScore) { this.productivityScore = productivityScore; }

    public String getBugForecasting() { return bugForecasting; }
    public void setBugForecasting(String bugForecasting) { this.bugForecasting = bugForecasting; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static AIReportBuilder builder() {
        return new AIReportBuilder();
    }

    public static class AIReportBuilder {
        private Long id;
        private Project project;
        private Double riskScore;
        private String riskLevel;
        private Double sprintDelayPrediction;
        private Double productivityScore;
        private String bugForecasting;
        private String recommendations;
        private String summary;
        private LocalDateTime createdAt = LocalDateTime.now();

        public AIReportBuilder id(Long id) { this.id = id; return this; }
        public AIReportBuilder project(Project project) { this.project = project; return this; }
        public AIReportBuilder riskScore(Double riskScore) { this.riskScore = riskScore; return this; }
        public AIReportBuilder riskLevel(String riskLevel) { this.riskLevel = riskLevel; return this; }
        public AIReportBuilder sprintDelayPrediction(Double sprintDelayPrediction) { this.sprintDelayPrediction = sprintDelayPrediction; return this; }
        public AIReportBuilder productivityScore(Double productivityScore) { this.productivityScore = productivityScore; return this; }
        public AIReportBuilder bugForecasting(String bugForecasting) { this.bugForecasting = bugForecasting; return this; }
        public AIReportBuilder recommendations(String recommendations) { this.recommendations = recommendations; return this; }
        public AIReportBuilder summary(String summary) { this.summary = summary; return this; }
        public AIReportBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public AIReport build() {
            return new AIReport(id, project, riskScore, riskLevel, sprintDelayPrediction, productivityScore,
                    bugForecasting, recommendations, summary, createdAt);
        }
    }
}
