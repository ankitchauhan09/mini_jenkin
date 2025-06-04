package com.mini_jenkin.repository;

import com.mini_jenkin.entity.PipelineConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PipelineRepository extends JpaRepository<PipelineConfig, Long> {
}
