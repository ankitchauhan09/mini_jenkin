package com.mini_jenkin.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity(name = "build_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BuildLogs {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private LocalDateTime timestamp;
    @Enumerated(EnumType.STRING)
    private BuildStatus status;
    private Long projectId;
    private String executionTime;
}

