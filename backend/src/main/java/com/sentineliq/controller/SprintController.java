package com.sentineliq.controller;

import com.sentineliq.dto.SprintRequest;
import com.sentineliq.model.Project;
import com.sentineliq.model.Sprint;
import com.sentineliq.repository.ProjectRepository;
import com.sentineliq.repository.SprintRepository;
import com.sentineliq.service.AIEngineService;
import com.sentineliq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sprints")
public class SprintController {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AIEngineService aiEngineService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<Sprint> getSprintsByProject(@PathVariable Long projectId) {
        return sprintRepository.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable Long id) {
        return sprintRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> createSprint(@RequestBody SprintRequest request) {
        Project project = projectRepository.findById(request.projectId()).orElse(null);
        if (project == null) {
            return ResponseEntity.badRequest().body("Project not found with id: " + request.projectId());
        }

        Sprint sprint = new Sprint();
        sprint.setProject(project);
        sprint.setName(request.name());
        sprint.setGoal(request.goal());
        sprint.setStartDate(request.startDate());
        sprint.setEndDate(request.endDate());
        sprint.setStatus(request.status() != null ? request.status() : "FUTURE");
        sprint.setCompletionPercentage(request.completionPercentage() != null ? request.completionPercentage() : 0.0);

        Sprint savedSprint = sprintRepository.save(sprint);

        // Notify project manager
        if (project.getManager() != null) {
            notificationService.sendNotification(project.getManager(), 
                "New sprint '" + savedSprint.getName() + "' created for Project '" + project.getName() + "'.");
        }

        // Trigger AI report recalculation
        try {
            aiEngineService.generateProjectReport(project.getId());
        } catch (Exception e) {
            System.err.println("AI recalculate fail: " + e.getMessage());
        }

        return ResponseEntity.ok(savedSprint);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> updateSprint(@PathVariable Long id, @RequestBody SprintRequest request) {
        return sprintRepository.findById(id)
                .map(sprint -> {
                    sprint.setName(request.name());
                    sprint.setGoal(request.goal());
                    sprint.setStartDate(request.startDate());
                    sprint.setEndDate(request.endDate());
                    sprint.setStatus(request.status());
                    if (request.completionPercentage() != null) {
                        sprint.setCompletionPercentage(request.completionPercentage());
                    }

                    Sprint updated = sprintRepository.save(sprint);

                    // Trigger AI report recalculation
                    try {
                        aiEngineService.generateProjectReport(sprint.getProject().getId());
                    } catch (Exception e) {
                        System.err.println("AI recalculate fail: " + e.getMessage());
                    }

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> deleteSprint(@PathVariable Long id) {
        return sprintRepository.findById(id)
                .map(sprint -> {
                    sprintRepository.delete(sprint);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
