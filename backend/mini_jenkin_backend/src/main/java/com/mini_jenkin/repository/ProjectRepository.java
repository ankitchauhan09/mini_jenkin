package com.mini_jenkin.repository;

import com.mini_jenkin.entity.Project;
import com.mini_jenkin.payload.ProjectStatus;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findAllByUserId(String userId);

    boolean existsByProjectName(String projectName);

    @Transactional
    @Modifying
    @Query("UPDATE project p SET p.projectStatus = :projectStatus WHERE p.projectId = :projectId")
    void setStatusToRunning(@Param("projectStatus") ProjectStatus projectStatus, @Param("projectId") Long projectId);

}
