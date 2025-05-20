package com.mini_jenkin.repository;
import java.util.*;
import com.mini_jenkin.entity.ProjectLogs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectLogRepository extends JpaRepository<ProjectLogs, Long> {
    List<ProjectLogs> findByProjectId(Long projectId);
    Optional<ProjectLogs> findByIdAndProjectId(Long id, Long projectId);
    void deleteByProjectId(Long projectId);
    Optional<ProjectLogs> findTopByProjectIdOrderByLogTimeDesc(Long projectId);
}
