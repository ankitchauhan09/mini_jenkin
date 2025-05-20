package com.mini_jenkin.repository;

import com.mini_jenkin.entity.BuildLogs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildLogsRepository extends JpaRepository<BuildLogs, Integer> {
}
