package com.sentineliq.repository;

import com.sentineliq.model.Bug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BugRepository extends JpaRepository<Bug, Long> {
    List<Bug> findByProjectId(Long projectId);
    List<Bug> findByAssigneeId(Long assigneeId);
    long countByProjectIdAndStatus(Long projectId, String status);
}
