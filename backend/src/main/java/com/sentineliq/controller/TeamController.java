package com.sentineliq.controller;

import com.sentineliq.dto.TeamRequest;
import com.sentineliq.model.*;
import com.sentineliq.repository.TaskRepository;
import com.sentineliq.repository.TeamRepository;
import com.sentineliq.repository.UserRepository;
import com.sentineliq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    @Autowired
    private TeamRepository teamRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        return teamRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> createTeam(@RequestBody TeamRequest request) {
        if (teamRepository.findByName(request.name()).isPresent()) {
            return ResponseEntity.badRequest().body("Team with name '" + request.name() + "' already exists.");
        }

        List<User> members = new ArrayList<>();
        if (request.memberIds() != null) {
            members = userRepository.findAllById(request.memberIds());
        }

        Team team = new Team();
        team.setName(request.name());
        team.setMembers(members);

        Team savedTeam = teamRepository.save(team);

        // Notify new members
        members.forEach(u -> notificationService.sendNotification(u, 
            "You have been added to the new team: '" + savedTeam.getName() + "'."));

        return ResponseEntity.ok(savedTeam);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<?> updateTeam(@PathVariable Long id, @RequestBody TeamRequest request) {
        return teamRepository.findById(id)
                .map(team -> {
                    team.setName(request.name());

                    List<User> newMembers = new ArrayList<>();
                    if (request.memberIds() != null) {
                        newMembers = userRepository.findAllById(request.memberIds());
                    }
                    
                    // Alert users who are newly added
                    for (User user : newMembers) {
                        if (!team.getMembers().contains(user)) {
                            notificationService.sendNotification(user, "You have been added to Team '" + team.getName() + "'.");
                        }
                    }

                    team.setMembers(newMembers);
                    Team updated = teamRepository.save(team);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTeam(@PathVariable Long id) {
        return teamRepository.findById(id)
                .map(team -> {
                    teamRepository.delete(team);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/analytics")
    public ResponseEntity<?> getTeamPerformance(@PathVariable Long id) {
        return teamRepository.findById(id)
                .map(team -> {
                    Map<String, Object> analytics = new HashMap<>();
                    analytics.put("teamId", team.getId());
                    analytics.put("teamName", team.getName());
                    analytics.put("memberCount", team.getMembers().size());

                    List<Map<String, Object>> memberStats = new ArrayList<>();
                    int totalTasksAssigned = 0;
                    int totalTasksCompleted = 0;

                    for (User member : team.getMembers()) {
                        List<Task> userTasks = taskRepository.findByAssigneeId(member.getId());
                        long assigned = userTasks.size();
                        long completed = userTasks.stream().filter(t -> t.getStatus().equals("COMPLETED")).count();
                        long open = assigned - completed;

                        totalTasksAssigned += assigned;
                        totalTasksCompleted += completed;

                        double completionRate = assigned > 0 ? ((double) completed / assigned) * 100.0 : 100.0;

                        Map<String, Object> stat = new HashMap<>();
                        stat.put("userId", member.getId());
                        stat.put("username", member.getUsername());
                        stat.put("tasksAssigned", assigned);
                        stat.put("tasksCompleted", completed);
                        stat.put("openTasks", open);
                        stat.put("completionRate", completionRate);
                        memberStats.add(stat);
                    }

                    analytics.put("memberStats", memberStats);
                    analytics.put("totalTasksAssigned", totalTasksAssigned);
                    analytics.put("totalTasksCompleted", totalTasksCompleted);
                    
                    double teamProductivity = totalTasksAssigned > 0 
                            ? ((double) totalTasksCompleted / totalTasksAssigned) * 100.0 
                            : 100.0;
                    analytics.put("teamProductivity", teamProductivity);

                    return ResponseEntity.ok(analytics);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
