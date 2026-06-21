package com.sentineliq.controller;

import com.sentineliq.model.*;
import com.sentineliq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardOverviewController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private BugRepository bugRepository;

    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        List<Project> projects = projectRepository.findAll();
        List<Sprint> sprints = sprintRepository.findAll();
        List<Task> tasks = taskRepository.findAll();
        List<Bug> bugs = bugRepository.findAll();

        long totalProjects = projects.size();
        long activeProjects = projects.stream().filter(p -> p.getStatus().equals("ACTIVE")).count();
        long completedProjects = projects.stream().filter(p -> p.getStatus().equals("COMPLETED")).count();
        long delayedProjects = projects.stream().filter(p -> p.getStatus().equals("DELAYED")).count();

        // Calculate Average Risk Score
        double avgRisk = projects.isEmpty() ? 0.0 :
                projects.stream().mapToDouble(Project::getRiskScore).average().orElse(0.0);

        // Calculate Average Team Productivity Score
        double avgProductivity = projects.isEmpty() ? 100.0 :
                projects.stream().mapToDouble(Project::getProductivityScore).average().orElse(100.0);

        // Calculate Average Sprint Progress
        double avgSprintProgress = sprints.isEmpty() ? 0.0 :
                sprints.stream().filter(s -> s.getStatus().equals("ACTIVE"))
                        .mapToDouble(Sprint::getCompletionPercentage).average().orElse(0.0);
        if (avgSprintProgress == 0.0 && !sprints.isEmpty()) {
            avgSprintProgress = sprints.stream().mapToDouble(Sprint::getCompletionPercentage).average().orElse(0.0);
        }

        // Open bugs count
        long openBugs = bugs.stream().filter(b -> b.getStatus().equals("OPEN") || b.getStatus().equals("IN_PROGRESS")).count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalProjects", totalProjects);
        summary.put("activeProjects", activeProjects);
        summary.put("completedProjects", completedProjects);
        summary.put("delayedProjects", delayedProjects);
        summary.put("averageRiskScore", avgRisk);
        summary.put("averageProductivityScore", avgProductivity);
        summary.put("averageSprintProgress", avgSprintProgress);
        summary.put("openBugs", openBugs);

        // Build Charts Data
        // 1. Project Status Distribution
        List<Map<String, Object>> statusData = new ArrayList<>();
        statusData.add(createChartDataPoint("Active", activeProjects));
        statusData.add(createChartDataPoint("Planning", projects.stream().filter(p -> p.getStatus().equals("PLANNING")).count()));
        statusData.add(createChartDataPoint("Completed", completedProjects));
        statusData.add(createChartDataPoint("Delayed", delayedProjects));
        summary.put("projectStatusDistribution", statusData);

        // 2. Sprint Velocity Trend (dummy-data shaped from existing active and completed sprints)
        List<Map<String, Object>> velocityData = new ArrayList<>();
        sprints.stream().sorted(Comparator.comparing(Sprint::getStartDate)).forEach(s -> {
            Map<String, Object> point = new HashMap<>();
            point.put("name", s.getName());
            point.put("completion", s.getCompletionPercentage());
            
            // Derive velocities from completed tasks
            long completedTasksInSprint = tasks.stream()
                    .filter(t -> t.getSprint() != null && t.getSprint().getId().equals(s.getId()) && t.getStatus().equals("COMPLETED"))
                    .count();
            point.put("velocity", completedTasksInSprint * 5); // 5 story points each
            point.put("target", 25);
            velocityData.add(point);
        });
        if (velocityData.isEmpty()) {
            // Seed defaults for empty states
            velocityData.add(createVelocityPoint("Sprint 1", 100, 20));
            velocityData.add(createVelocityPoint("Sprint 2", 85, 25));
            velocityData.add(createVelocityPoint("Sprint 3 (Current)", 45, 12));
        }
        summary.put("sprintVelocity", velocityData);

        // 3. Bug trends by severity
        Map<String, Long> bugSeverityCounts = new HashMap<>();
        bugSeverityCounts.put("CRITICAL", bugs.stream().filter(b -> b.getSeverity().equals("CRITICAL")).count());
        bugSeverityCounts.put("HIGH", bugs.stream().filter(b -> b.getSeverity().equals("HIGH")).count());
        bugSeverityCounts.put("MEDIUM", bugs.stream().filter(b -> b.getSeverity().equals("MEDIUM")).count());
        bugSeverityCounts.put("LOW", bugs.stream().filter(b -> b.getSeverity().equals("LOW")).count());
        summary.put("bugSeverityDistribution", bugSeverityCounts);

        // 4. Productivity metrics per project
        List<Map<String, Object>> productivityData = new ArrayList<>();
        projects.forEach(p -> {
            Map<String, Object> point = new HashMap<>();
            point.put("projectName", p.getName());
            point.put("score", p.getProductivityScore());
            point.put("risk", p.getRiskScore());
            productivityData.add(point);
        });
        summary.put("projectMetricsList", productivityData);

        return ResponseEntity.ok(summary);
    }

    private Map<String, Object> createChartDataPoint(String name, long value) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("value", value);
        return map;
    }

    private Map<String, Object> createVelocityPoint(String name, double completion, double velocity) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", name);
        map.put("completion", completion);
        map.put("velocity", velocity);
        map.put("target", 25);
        return map;
    }
}
