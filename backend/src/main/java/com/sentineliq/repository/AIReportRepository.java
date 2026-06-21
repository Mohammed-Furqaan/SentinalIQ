package com.sentineliq.repository;

import com.sentineliq.model.AIReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIReportRepository extends JpaRepository<AIReport, Long> {
    List<AIReport> findByProjectIdOrderByCreatedAtDesc(Long projectId);
}
