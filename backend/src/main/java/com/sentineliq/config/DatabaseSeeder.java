package com.sentineliq.config;

import com.sentineliq.model.*;
import com.sentineliq.repository.*;
import com.sentineliq.service.AIEngineService;
import com.sentineliq.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TeamRepository teamRepository;

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

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AIEngineService aiEngineService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("Database already seeded. Skipping seeder.");
            return;
        }

        System.out.println("Seeding database with realistic SaaS metrics...");

        // 1. Create Users
        User admin = User.builder()
                .username("admin")
                .email("admin@SentinelIQ.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .enabled(true)
                .build();

        User manager = User.builder()
                .username("manager")
                .email("manager@SentinelIQ.com")
                .password(passwordEncoder.encode("manager123"))
                .role(Role.ROLE_PROJECT_MANAGER)
                .enabled(true)
                .build();

        User devSarah = User.builder()
                .username("sarah_dev")
                .email("sarah@SentinelIQ.com")
                .password(passwordEncoder.encode("dev123"))
                .role(Role.ROLE_DEVELOPER)
                .enabled(true)
                .build();

        User devJohn = User.builder()
                .username("john_dev")
                .email("john@SentinelIQ.com")
                .password(passwordEncoder.encode("dev123"))
                .role(Role.ROLE_DEVELOPER)
                .enabled(true)
                .build();

        User devAlex = User.builder()
                .username("alex_dev")
                .email("alex@SentinelIQ.com")
                .password(passwordEncoder.encode("dev123"))
                .role(Role.ROLE_DEVELOPER)
                .enabled(true)
                .build();

        userRepository.saveAll(Arrays.asList(admin, manager, devSarah, devJohn, devAlex));

        // 2. Create Teams
        Team coreEngineering = Team.builder()
                .name("Core Engineering")
                .members(Arrays.asList(devSarah, devJohn, devAlex))
                .build();

        Team qaOps = Team.builder()
                .name("QA & Operations")
                .members(Arrays.asList(devJohn, devAlex))
                .build();

        teamRepository.saveAll(Arrays.asList(coreEngineering, qaOps));

        // 3. Create Projects
        LocalDate today = LocalDate.now();

        // Project A: SentinelIQ Platform (Active, On Track, Medium Risk)
        Project SentinelIQProject = Project.builder()
                .name("SentinelIQ Platform (Vite & React 19)")
                .description("Build the frontend React UI and coordinate backend WebSockets for live telemetry widgets.")
                .status("ACTIVE")
                .startDate(today.minusDays(30))
                .endDate(today.plusDays(30))
                .manager(manager)
                .teams(Collections.singletonList(coreEngineering))
                .riskScore(25.0)
                .riskLevel("Low")
                .productivityScore(90.0)
                .completionForecast("On Track")
                .build();

        // Project B: Cloud Migration & Orchestration (Delayed, High Risk, Overdue)
        Project cloudMigrationProject = Project.builder()
                .name("Cloud Migration & Orchestration")
                .description("Migrate the legacy monolithic infrastructure to highly scalable Kubernetes clusters in AWS.")
                .status("DELAYED")
                .startDate(today.minusDays(60))
                .endDate(today.minusDays(5)) // Project is past target date!
                .manager(manager)
                .teams(Collections.singletonList(qaOps))
                .riskScore(85.0)
                .riskLevel("High")
                .productivityScore(55.0)
                .completionForecast("Delayed")
                .build();

        // Project C: Security Compliance Audit (Completed)
        Project securityAuditProject = Project.builder()
                .name("Security Compliance Audit")
                .description("Conduct penetration testing, audit database roles, and update CORS configurations.")
                .status("COMPLETED")
                .startDate(today.minusDays(90))
                .endDate(today.minusDays(10))
                .manager(admin)
                .teams(Collections.singletonList(qaOps))
                .riskScore(12.0)
                .riskLevel("Low")
                .productivityScore(100.0)
                .completionForecast("On Track")
                .build();

        projectRepository.saveAll(Arrays.asList(SentinelIQProject, cloudMigrationProject, securityAuditProject));

        // 4. Create Sprints
        // Sprints for Project A (SentinelIQ)
        Sprint sprintA1 = Sprint.builder()
                .project(SentinelIQProject)
                .name("Sprint A1: Core API Setup")
                .goal("Define entities, endpoints, configure security context, and setup H2/MySQL connections.")
                .startDate(today.minusDays(30))
                .endDate(today.minusDays(16))
                .status("COMPLETED")
                .completionPercentage(100.0)
                .build();

        Sprint sprintA2 = Sprint.builder()
                .project(SentinelIQProject)
                .name("Sprint A2: UI Dashboards")
                .goal("Design glassmorphism layouts, hook up Recharts, and implement websocket notifications.")
                .startDate(today.minusDays(15))
                .endDate(today.plusDays(1))
                .status("ACTIVE")
                .completionPercentage(75.0)
                .build();

        Sprint sprintA3 = Sprint.builder()
                .project(SentinelIQProject)
                .name("Sprint A3: AI Engine Integration")
                .goal("Write delay forecasting mathematical models, wire up recommendation panel, and verify dashboard metrics.")
                .startDate(today.plusDays(2))
                .endDate(today.plusDays(16))
                .status("FUTURE")
                .completionPercentage(0.0)
                .build();

        // Sprints for Project B (Cloud Migration)
        Sprint sprintB1 = Sprint.builder()
                .project(cloudMigrationProject)
                .name("Sprint B1: AWS Infrastructure")
                .goal("Establish VPCs, subnets, configure security groups, and spin up test clusters.")
                .startDate(today.minusDays(60))
                .endDate(today.minusDays(41))
                .status("COMPLETED")
                .completionPercentage(100.0)
                .build();

        Sprint sprintB2 = Sprint.builder()
                .project(cloudMigrationProject)
                .name("Sprint B2: Production Launch")
                .goal("Migrate transactional DB, establish ingress routers, setup monitoring and alerts.")
                .startDate(today.minusDays(40))
                .endDate(today.minusDays(5)) // Overdue sprint
                .status("ACTIVE")
                .completionPercentage(33.0)
                .build();

        sprintRepository.saveAll(Arrays.asList(sprintA1, sprintA2, sprintA3, sprintB1, sprintB2));

        // 5. Create Tasks
        // Project A: SentinelIQ Platform - Completed Sprint A1 tasks
        Task t1 = Task.builder().project(SentinelIQProject).sprint(sprintA1).title("Draft API schema & entities").description("Plan Jpa relations").priority("LOW").status("COMPLETED").assignee(devSarah).build();
        Task t2 = Task.builder().project(SentinelIQProject).sprint(sprintA1).title("Configure JWT filters").description("Write security config").priority("HIGH").status("COMPLETED").assignee(devSarah).build();
        Task t3 = Task.builder().project(SentinelIQProject).sprint(sprintA1).title("Create Dockerfile configs").description("Add multi-stage docker").priority("MEDIUM").status("COMPLETED").assignee(devJohn).build();

        // Project A: SentinelIQ Platform - Active Sprint A2 tasks
        Task t4 = Task.builder().project(SentinelIQProject).sprint(sprintA2).title("Implement Recharts visualization").description("Render project productivity and risk trends using responsive widgets").priority("HIGH").status("IN_PROGRESS").assignee(devSarah).dueDate(today.plusDays(1)).build();
        Task t5 = Task.builder().project(SentinelIQProject).sprint(sprintA2).title("WebSocket toaster notification system").description("Set up client listener to trigger toasts on new tasks").priority("HIGH").status("TESTING").assignee(devJohn).dueDate(today.minusDays(1)).build(); // Overdue!
        Task t6 = Task.builder().project(SentinelIQProject).sprint(sprintA2).title("Zustand auth persistence").description("Ensure user stays logged in across reloads").priority("MEDIUM").status("COMPLETED").assignee(devAlex).dueDate(today.minusDays(5)).build();
        Task t7 = Task.builder().project(SentinelIQProject).sprint(sprintA2).title("Draft risk evaluation rules").description("Determine metrics to assign risk scores to projects").priority("LOW").status("TODO").assignee(devSarah).dueDate(today.plusDays(3)).build();

        // Project B: Cloud Migration - Completed Tasks
        Task tc1 = Task.builder().project(cloudMigrationProject).sprint(sprintB1).title("Spin up AWS EKS").description("Create active cluster").priority("CRITICAL").status("COMPLETED").assignee(devJohn).build();
        
        // Project B: Cloud Migration - Overdue Sprint B2 Tasks
        Task tc2 = Task.builder().project(cloudMigrationProject).sprint(sprintB2).title("Migrate Postgres transactional DB").description("Execute pg_dump and restore to RDS inside VPN").priority("CRITICAL").status("IN_PROGRESS").assignee(devJohn).dueDate(today.minusDays(15)).build(); // Overdue!
        Task tc3 = Task.builder().project(cloudMigrationProject).sprint(sprintB2).title("Setup Kubernetes ingress definitions").description("Map service ports to ALB routing rules").priority("HIGH").status("IN_PROGRESS").assignee(devAlex).dueDate(today.minusDays(6)).build(); // Overdue!
        Task tc4 = Task.builder().project(cloudMigrationProject).sprint(sprintB2).title("Secure endpoints under internal corporate VPN").description("Lock security groups to whitelist ingress IPs only").priority("HIGH").status("TODO").assignee(devAlex).dueDate(today.minusDays(10)).build(); // Overdue!

        // Project C: Security Compliance - Completed
        Task ts1 = Task.builder().project(securityAuditProject).title("Audit database roles").description("Ensure read-only access where required").priority("HIGH").status("COMPLETED").assignee(devSarah).build();
        Task ts2 = Task.builder().project(securityAuditProject).title("Run OWASP dependency checks").description("Fix CVE warnings").priority("MEDIUM").status("COMPLETED").assignee(devAlex).build();

        taskRepository.saveAll(Arrays.asList(t1, t2, t3, t4, t5, t6, t7, tc1, tc2, tc3, tc4, ts1, ts2));

        // 6. Create Bugs
        // Project A (SentinelIQ) Bugs
        Bug b1 = Bug.builder()
                .project(SentinelIQProject)
                .title("Websocket connection drops on token refresh")
                .description("Client fails to re-handshake with backend after JWT token expires. Needs automatic intercept reconnect.")
                .severity("HIGH")
                .status("OPEN")
                .assignee(devJohn)
                .reporter(devSarah)
                .createdAt(today.minusDays(2))
                .build();

        Bug b2 = Bug.builder()
                .project(SentinelIQProject)
                .title("Risk rating flips to High under negative test case")
                .description("Heuristic error calculates negative count causing wrap-around bounds.")
                .severity("MEDIUM")
                .status("RESOLVED")
                .assignee(devSarah)
                .reporter(devJohn)
                .createdAt(today.minusDays(8))
                .resolution("Fixed boundary check logic inside AIEngineService.")
                .build();

        // Project B (Cloud Migration) Bugs
        Bug b3 = Bug.builder()
                .project(cloudMigrationProject)
                .title("Kubernetes service fails to route internal pod requests")
                .description("Core services cannot communicate. Returns connection timeouts. Suspect DNS resolution config.")
                .severity("CRITICAL")
                .status("OPEN")
                .assignee(devAlex)
                .reporter(devAlex)
                .createdAt(today.minusDays(5))
                .build();

        Bug b4 = Bug.builder()
                .project(cloudMigrationProject)
                .title("VPN config leaks external DNS requests")
                .description("Private domains are resolved via public lookup, exposing corporate namespaces.")
                .severity("HIGH")
                .status("OPEN")
                .assignee(devJohn)
                .reporter(devSarah)
                .createdAt(today.minusDays(12))
                .build();

        bugRepository.saveAll(Arrays.asList(b1, b2, b3, b4));

        // 7. Fire AI Reports to generate health statistics
        System.out.println("Precalculating AI Project Health Scores...");
        aiEngineService.generateProjectReport(SentinelIQProject.getId());
        aiEngineService.generateProjectReport(cloudMigrationProject.getId());
        aiEngineService.generateProjectReport(securityAuditProject.getId());

        // 8. Add Notifications
        notificationService.sendNotification(manager, "Welcome to SentinelIQ. Explore your project telemetry now.");
        notificationService.sendNotification(devSarah, "Task Assigned: 'Implement Recharts visualization' in 'SentinelIQ Platform'.");
        notificationService.sendNotification(devJohn, "Task Assigned: 'WebSocket toaster notification system' in 'SentinelIQ Platform'.");
        notificationService.sendNotification(devAlex, "Task Assigned: 'Setup Kubernetes ingress definitions' in 'Cloud Migration'.");
        notificationService.sendNotification(manager, "Alert: 'Cloud Migration & Orchestration' has been flagged as HIGH RISK.");

        System.out.println("Database seeding completed successfully!");
    }
}
