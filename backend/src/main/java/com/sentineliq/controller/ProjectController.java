package com.sentineliq.controller;

import com.sentineliq.dto.ProjectRequest;
import com.sentineliq.model.*;
import com.sentineliq.repository.AIReportRepository;
import com.sentineliq.repository.ProjectRepository;
import com.sentineliq.repository.TeamRepository;
import com.sentineliq.repository.UserRepository;
import com.sentineliq.service.AIEngineService;
import com.sentineliq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private AIEngineService aiEngineService;

    @Autowired
    private AIReportRepository aiReportRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<Project> createProject(@RequestBody ProjectRequest request) {
        User manager = null;
        if (request.managerId() != null) {
            manager = userRepository.findById(request.managerId()).orElse(null);
        }

        List<Team> teams = new ArrayList<>();
        if (request.teamIds() != null) {
            teams = teamRepository.findAllById(request.teamIds());
        }

        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setStatus(request.status() != null ? request.status() : "PLANNING");
        project.setStartDate(request.startDate());
        project.setEndDate(request.endDate());
        project.setManager(manager);
        project.setTeams(teams);
        project.setRiskScore(10.0);
        project.setRiskLevel("Low");
        project.setProductivityScore(100.0);
        project.setCompletionForecast("On Track");

        Project savedProject = projectRepository.save(project);
        
        // Notify managers and admin
        String alertMsg = "New Project created: '" + project.getName() + "'";
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ROLE_ADMIN || u.getRole() == Role.ROLE_PROJECT_MANAGER)
                .forEach(u -> notificationService.sendNotification(u, alertMsg));

        // Generate first AI report
        try {
            aiEngineService.generateProjectReport(savedProject.getId());
        } catch (Exception e) {
            System.err.println("First report failed: " + e.getMessage());
        }

        return ResponseEntity.ok(savedProject);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<Project> updateProject(@PathVariable Long id, @RequestBody ProjectRequest request) {
        return projectRepository.findById(id)
                .map(project -> {
                    project.setName(request.name());
                    project.setDescription(request.description());
                    project.setStatus(request.status());
                    project.setStartDate(request.startDate());
                    project.setEndDate(request.endDate());

                    if (request.managerId() != null) {
                        userRepository.findById(request.managerId()).ifPresent(project::setManager);
                    }
                    if (request.teamIds() != null) {
                        List<Team> teams = teamRepository.findAllById(request.teamIds());
                        project.setTeams(teams);
                    }

                    Project updated = projectRepository.save(project);
                    
                    // Alert team of modification
                    String msg = "Project '" + project.getName() + "' details updated.";
                    if (project.getManager() != null) {
                        notificationService.sendNotification(project.getManager(), msg);
                    }

                    // Update AI analytical predictions
                    try {
                        aiEngineService.generateProjectReport(updated.getId());
                    } catch (Exception e) {
                        System.err.println("AI Update failed: " + e.getMessage());
                    }

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        return projectRepository.findById(id)
                .map(project -> {
                    projectRepository.delete(project);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/ai-analyze")
    public ResponseEntity<AIReport> runAIAnalysis(@PathVariable Long id) {
        try {
            AIReport report = aiEngineService.generateProjectReport(id);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/ai-reports")
    public ResponseEntity<List<AIReport>> getProjectAIReports(@PathVariable Long id) {
        List<AIReport> reports = aiReportRepository.findByProjectIdOrderByCreatedAtDesc(id);
        return ResponseEntity.ok(reports);
    }
}
