package com.sentineliq.controller;

import com.sentineliq.dto.TaskRequest;
import com.sentineliq.model.*;
import com.sentineliq.repository.ProjectRepository;
import com.sentineliq.repository.SprintRepository;
import com.sentineliq.repository.TaskRepository;
import com.sentineliq.repository.UserRepository;
import com.sentineliq.service.AIEngineService;
import com.sentineliq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AIEngineService aiEngineService;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @GetMapping("/project/{projectId}")
    public List<Task> getTasksByProject(@PathVariable Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @GetMapping("/sprint/{sprintId}")
    public List<Task> getTasksBySprint(@PathVariable Long sprintId) {
        return taskRepository.findBySprintId(sprintId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody TaskRequest request) {
        Project project = projectRepository.findById(request.projectId()).orElse(null);
        if (project == null) {
            return ResponseEntity.badRequest().body("Project not found with id: " + request.projectId());
        }

        Sprint sprint = null;
        if (request.sprintId() != null) {
            sprint = sprintRepository.findById(request.sprintId()).orElse(null);
        }

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId()).orElse(null);
        }

        Task task = new Task();
        task.setProject(project);
        task.setSprint(sprint);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setStatus(request.status() != null ? request.status() : "BACKLOG");
        task.setDueDate(request.dueDate());
        task.setAssignee(assignee);

        Task savedTask = taskRepository.save(task);

        // Notify assignee
        if (assignee != null) {
            notificationService.sendNotification(assignee, 
                "Task Assigned: '" + savedTask.getTitle() + "' in project '" + project.getName() + "'.");
        }

        // Trigger AI report update
        updateAIEngine(project.getId());

        return ResponseEntity.ok(savedTask);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody TaskRequest request) {
        return taskRepository.findById(id)
                .map(task -> {
                    boolean assigneeChanged = false;
                    User oldAssignee = task.getAssignee();

                    task.setTitle(request.title());
                    task.setDescription(request.description());
                    task.setPriority(request.priority());
                    task.setStatus(request.status());
                    task.setDueDate(request.dueDate());

                    if (request.sprintId() != null) {
                        sprintRepository.findById(request.sprintId()).ifPresent(task::setSprint);
                    } else {
                        task.setSprint(null);
                    }

                    if (request.assigneeId() != null) {
                        User newAssignee = userRepository.findById(request.assigneeId()).orElse(null);
                        if (newAssignee != null && (oldAssignee == null || !oldAssignee.getId().equals(newAssignee.getId()))) {
                            task.setAssignee(newAssignee);
                            assigneeChanged = true;
                        }
                    } else {
                        task.setAssignee(null);
                    }

                    Task updated = taskRepository.save(task);

                    // Notify new assignee if changed
                    if (assigneeChanged && updated.getAssignee() != null) {
                        notificationService.sendNotification(updated.getAssignee(), 
                            "Task Reassigned: '" + updated.getTitle() + "' is now assigned to you.");
                    }

                    // Trigger AI report update
                    updateAIEngine(updated.getProject().getId());

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestParam String status) {
        return taskRepository.findById(id)
                .map(task -> {
                    String oldStatus = task.getStatus();
                    task.setStatus(status.toUpperCase());
                    Task updated = taskRepository.save(task);

                    // Notify PM/Assignee of completed tasks
                    if (status.equalsIgnoreCase("COMPLETED") && !oldStatus.equals("COMPLETED")) {
                        Project project = updated.getProject();
                        if (project.getManager() != null) {
                            notificationService.sendNotification(project.getManager(), 
                                "Task Completed: '" + updated.getTitle() + "' has been resolved by " + 
                                (updated.getAssignee() != null ? updated.getAssignee().getUsername() : "unassigned") + ".");
                        }
                    }

                    // Update sprint percentages if task is linked to a sprint
                    if (updated.getSprint() != null) {
                        updateSprintCompletion(updated.getSprint());
                    }

                    // Trigger AI report update
                    updateAIEngine(updated.getProject().getId());

                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        return taskRepository.findById(id)
                .map(task -> {
                    Long projectId = task.getProject().getId();
                    Sprint sprint = task.getSprint();
                    taskRepository.delete(task);

                    if (sprint != null) {
                        updateSprintCompletion(sprint);
                    }

                    updateAIEngine(projectId);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void updateSprintCompletion(Sprint sprint) {
        List<Task> sprintTasks = taskRepository.findBySprintId(sprint.getId());
        if (sprintTasks.isEmpty()) {
            sprint.setCompletionPercentage(0.0);
        } else {
            long completed = sprintTasks.stream().filter(t -> t.getStatus().equals("COMPLETED")).count();
            double pct = ((double) completed / sprintTasks.size()) * 100.0;
            sprint.setCompletionPercentage(pct);
        }
        sprintRepository.save(sprint);
    }

    private void updateAIEngine(Long projectId) {
        try {
            aiEngineService.generateProjectReport(projectId);
        } catch (Exception e) {
            System.err.println("AI calculation error: " + e.getMessage());
        }
    }
}
