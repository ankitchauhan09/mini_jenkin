package com.mini_jenkin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity(name = "project_logs")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProjectLogs {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private int id;
    private Long projectId;
    @Column(columnDefinition = "TEXT")
    private String log;
    private LocalDateTime logTime;
}
