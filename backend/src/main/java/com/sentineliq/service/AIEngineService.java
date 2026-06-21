package com.sentineliq.service;

import com.sentineliq.model.*;
import com.sentineliq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class AIEngineService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private BugRepository bugRepository;

    @Autowired
    private AIReportRepository aiReportRepository;

    @Transactional
    public AIReport generateProjectReport(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
        List<Task> tasks = taskRepository.findByProjectId(projectId);
        List<Bug> bugs = bugRepository.findByProjectId(projectId);

        // 1. Calculate Risk Score (0 - 100)
        double riskScore = calculateRiskScore(tasks, bugs, sprints);
        String riskLevel = getRiskLevelStr(riskScore);

        // 2. Sprint Delay Prediction (0 - 100)
        double delayPrediction = calculateDelayPrediction(tasks, sprints);

        // 3. Productivity Score (0 - 100)
        double productivityScore = calculateProductivityScore(tasks, bugs);

        // 4. Bug Forecasting
        String bugForecast = forecastBugs(bugs, tasks);

        // 5. Generate Recommendations
        List<String> recommendations = generateRecommendations(tasks, bugs, delayPrediction, productivityScore);

        // 6. Generate Summary
        String summary = generateSummary(project, riskLevel, delayPrediction, productivityScore, recommendations);

        // Update Project health metrics
        project.setRiskScore(riskScore);
        project.setRiskLevel(riskLevel);
        project.setProductivityScore(productivityScore);
        
        String forecast = "On Track";
        if (delayPrediction > 60.0) {
            forecast = "Delayed";
        } else if (delayPrediction > 30.0 || riskScore > 50.0) {
            forecast = "At Risk";
        }
        project.setCompletionForecast(forecast);
        projectRepository.save(project);

        // Save AI Report
        AIReport report = AIReport.builder()
                .project(project)
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .sprintDelayPrediction(delayPrediction)
                .productivityScore(productivityScore)
                .bugForecasting(bugForecast)
                .recommendations(String.join(";", recommendations))
                .summary(summary)
                .createdAt(LocalDateTime.now())
                .build();

        return aiReportRepository.save(report);
    }

    private double calculateRiskScore(List<Task> tasks, List<Bug> bugs, List<Sprint> sprints) {
        if (tasks.isEmpty() && bugs.isEmpty()) {
            return 10.0; // Minimal default baseline
        }

        double score = 15.0; // Baseline

        // Impact of open bugs by severity
        long criticalBugs = bugs.stream().filter(b -> b.getStatus().equals("OPEN") && b.getSeverity().equals("CRITICAL")).count();
        long highBugs = bugs.stream().filter(b -> b.getStatus().equals("OPEN") && b.getSeverity().equals("HIGH")).count();
        long medBugs = bugs.stream().filter(b -> b.getStatus().equals("OPEN") && b.getSeverity().equals("MEDIUM")).count();

        score += criticalBugs * 15.0;
        score += highBugs * 8.0;
        score += medBugs * 4.0;

        // Impact of overdue tasks
        LocalDate today = LocalDate.now();
        long overdueTasks = tasks.stream()
                .filter(t -> !t.getStatus().equals("COMPLETED") && t.getDueDate() != null && t.getDueDate().isBefore(today))
                .count();
        score += overdueTasks * 10.0;

        // Check active sprint completion
        Sprint activeSprint = sprints.stream().filter(s -> s.getStatus().equals("ACTIVE")).findFirst().orElse(null);
        if (activeSprint != null) {
            long totalDays = ChronoUnit.DAYS.between(activeSprint.getStartDate(), activeSprint.getEndDate());
            long daysRemaining = ChronoUnit.DAYS.between(today, activeSprint.getEndDate());
            if (totalDays > 0 && daysRemaining > 0) {
                double timeElapsedPct = (double) (totalDays - daysRemaining) / totalDays;
                double completedPct = activeSprint.getCompletionPercentage() / 100.0;
                
                // If we are late in the sprint but have done very little
                if (timeElapsedPct > 0.6 && completedPct < 0.4) {
                    score += 20.0;
                }
            }
        }

        return Math.min(Math.max(score, 0.0), 100.0);
    }

    private String getRiskLevelStr(double riskScore) {
        if (riskScore < 35.0) return "Low";
        if (riskScore < 70.0) return "Medium";
        return "High";
    }

    private double calculateDelayPrediction(List<Task> tasks, List<Sprint> sprints) {
        Sprint activeSprint = sprints.stream().filter(s -> s.getStatus().equals("ACTIVE")).findFirst().orElse(null);
        if (activeSprint == null) {
            return 10.0; // Low probability if no active sprint
        }

        LocalDate today = LocalDate.now();
        long totalDays = ChronoUnit.DAYS.between(activeSprint.getStartDate(), activeSprint.getEndDate());
        long daysRemaining = ChronoUnit.DAYS.between(today, activeSprint.getEndDate());

        if (totalDays <= 0 || daysRemaining <= 0) {
            return activeSprint.getCompletionPercentage() < 90.0 ? 95.0 : 5.0;
        }

        double timeUsedRatio = (double) (totalDays - daysRemaining) / totalDays;
        double tasksDoneRatio = activeSprint.getCompletionPercentage() / 100.0;

        // If tasks done ratio lags behind time used ratio
        double delayFactor = timeUsedRatio - tasksDoneRatio;
        double baseProbability = 20.0 + (delayFactor * 60.0);

        // Add weight for remaining high priority tasks in active sprint
        long pendingHighTasks = tasks.stream()
                .filter(t -> t.getSprint() != null && t.getSprint().getId().equals(activeSprint.getId())
                        && !t.getStatus().equals("COMPLETED")
                        && (t.getPriority().equals("HIGH") || t.getPriority().equals("CRITICAL")))
                .count();

        baseProbability += pendingHighTasks * 5.0;

        return Math.min(Math.max(baseProbability, 5.0), 99.0);
    }

    private double calculateProductivityScore(List<Task> tasks, List<Bug> bugs) {
        if (tasks.isEmpty()) {
            return 90.0; // High default if empty
        }

        long completed = tasks.stream().filter(t -> t.getStatus().equals("COMPLETED")).count();
        double baseRate = ((double) completed / tasks.size()) * 100.0;

        // Penalty for outstanding open bugs
        long openBugs = bugs.stream().filter(b -> b.getStatus().equals("OPEN")).count();
        double penalty = openBugs * 3.0;

        double score = baseRate - penalty;
        return Math.min(Math.max(score, 20.0), 100.0);
    }

    private String forecastBugs(List<Bug> bugs, List<Task> tasks) {
        long openBugs = bugs.stream().filter(b -> b.getStatus().equals("OPEN")).count();
        long inProgressTasks = tasks.stream().filter(t -> t.getStatus().equals("IN_PROGRESS") || t.getStatus().equals("TESTING")).count();

        if (openBugs == 0 && inProgressTasks == 0) {
            return "Stable (0 bugs forecasted next sprint)";
        }

        // Standard heuristic: active tasks lead to testing phases which spawn bugs
        double expectedNewBugs = (inProgressTasks * 0.25) + (openBugs * 0.1);
        int finalForecast = (int) Math.ceil(expectedNewBugs);

        if (openBugs > 5) {
            return String.format("Increasing (Forecast: %d new bugs expected. Upward trend due to high backlog).", finalForecast);
        } else {
            return String.format("Stable (Forecast: %d new bugs expected based on testing velocity).", finalForecast);
        }
    }

    private List<String> generateRecommendations(List<Task> tasks, List<Bug> bugs, double delayPrediction, double productivityScore) {
        List<String> recs = new ArrayList<>();

        long openCriticalBugs = bugs.stream().filter(b -> b.getStatus().equals("OPEN") && b.getSeverity().equals("CRITICAL")).count();
        if (openCriticalBugs > 0) {
            recs.add("Critical bugs must be resolved before proceeding with features.");
        }

        long overdueTasks = tasks.stream()
                .filter(t -> !t.getStatus().equals("COMPLETED") && t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                .count();
        if (overdueTasks > 0) {
            recs.add(String.format("Overdue tasks (%d) detected. Reassign or adjust completion timelines.", overdueTasks));
        }

        if (delayPrediction > 50.0) {
            recs.add("Sprint delay probability is high. Consider reducing active sprint scope.");
        }

        if (productivityScore < 70.0) {
            recs.add("Team productivity score dropped. Check for blocker tickets and team allocation.");
        }

        long testingTasks = tasks.stream().filter(t -> t.getStatus().equals("TESTING")).count();
        if (testingTasks > 3 && openCriticalBugs == 0) {
            recs.add("Increase QA testing capacity to resolve bottleneck in Testing column.");
        }

        if (recs.isEmpty()) {
            recs.add("Project health is optimal. Keep current pace and monitor upcoming milestones.");
            recs.add("Maintain regular sprint review meetings.");
        }

        return recs;
    }

    private String generateSummary(Project project, String riskLevel, double delayPrediction, double productivityScore, List<String> recommendations) {
        return String.format("AI Summary for Project '%s': The overall project status is currently %s with a %s Risk Level. " +
                "The current sprint has a %.1f%% likelihood of completion delay. " +
                "The overall developer team productivity score is at %.1f%%. " +
                "Primary actions recommended: %s.",
                project.getName(), project.getStatus(), riskLevel, delayPrediction, productivityScore, recommendations.get(0));
    }
}
