package com.sentineliq.controller;

import com.sentineliq.dto.BugRequest;
import com.sentineliq.model.*;
import com.sentineliq.repository.BugRepository;
import com.sentineliq.repository.ProjectRepository;
import com.sentineliq.repository.UserRepository;
import com.sentineliq.service.AIEngineService;
import com.sentineliq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bugs")
public class BugController {

    @Autowired
    private BugRepository bugRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIEngineService aiEngineService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Bug> getAllBugs() {
        return bugRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<Bug> getBugsByProject(@PathVariable Long projectId) {
        return bugRepository.findByProjectId(projectId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bug> getBugById(@PathVariable Long id) {
        return bugRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> reportBug(@RequestBody BugRequest request) {
        Project project = projectRepository.findById(request.projectId()).orElse(null);
        if (project == null) {
            return ResponseEntity.badRequest().body("Project not found with id: " + request.projectId());
        }

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId()).orElse(null);
        }

        User reporter = null;
        if (request.reporterId() != null) {
            reporter = userRepository.findById(request.reporterId()).orElse(null);
        }

        Bug bug = new Bug();
        bug.setProject(project);
        bug.setTitle(request.title());
        bug.setDescription(request.description());
        bug.setSeverity(request.severity());
        bug.setStatus(request.status() != null ? request.status() : "OPEN");
        bug.setAssignee(assignee);
        bug.setReporter(reporter);
        bug.setCreatedAt(LocalDate.now());
        bug.setResolution(request.resolution());

        Bug savedBug = bugRepository.save(bug);

        // Notify Project Manager and Developer assignee
        String pmMsg = "Bug Reported: '" + savedBug.getTitle() + "' (Severity: " + savedBug.getSeverity() + ") in project '" + project.getName() + "'.";
        if (project.getManager() != null) {
            notificationService.sendNotification(project.getManager(), pmMsg);
        }
        if (assignee != null) {
            notificationService.sendNotification(assignee, "Bug Assigned: '" + savedBug.getTitle() + "' has been assigned to you.");
        }

        // Trigger AI update
        updateAIEngine(project.getId());

        return ResponseEntity.ok(savedBug);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBug(@PathVariable Long id, @RequestBody BugRequest request) {
        return bugRepository.findById(id)
                .map(bug -> {
                    bug.setTitle(request.title());
                    bug.setDescription(request.description());
                    bug.setSeverity(request.severity());
                    bug.setStatus(request.status());
                    bug.setResolution(request.resolution());

                    if (request.assigneeId() != null) {
                        userRepository.findById(request.assigneeId()).ifPresent(bug::setAssignee);
                    } else {
                        bug.setAssignee(null);
                    }

                    Bug updated = bugRepository.save(bug);

                    // Notify reporter if resolved
                    if (updated.getStatus().equals("RESOLVED") && updated.getReporter() != null) {
                        notificationService.sendNotification(updated.getReporter(), 
                            "Bug Resolved: '" + updated.getTitle() + "' has been resolved by " + 
                            (updated.getAssignee() != null ? updated.getAssignee().getUsername() : "system") + ".");
                    }

                    // Trigger AI update
                    updateAIEngine(updated.getProject().getId());

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> deleteBug(@PathVariable Long id) {
        return bugRepository.findById(id)
                .map(bug -> {
                    Long projectId = bug.getProject().getId();
                    bugRepository.delete(bug);
                    updateAIEngine(projectId);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void updateAIEngine(Long projectId) {
        try {
            aiEngineService.generateProjectReport(projectId);
        } catch (Exception e) {
            System.err.println("AI calculation error: " + e.getMessage());
        }
    }
}
