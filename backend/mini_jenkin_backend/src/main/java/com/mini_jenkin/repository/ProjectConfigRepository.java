package com.mini_jenkin.repository;

import com.mini_jenkin.entity.ProjectConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectConfigRepository extends JpaRepository<ProjectConfig, Long> {

}
