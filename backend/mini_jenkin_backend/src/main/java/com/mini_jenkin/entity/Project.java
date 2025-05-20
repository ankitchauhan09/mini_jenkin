package com.mini_jenkin.entity;

import com.mini_jenkin.payload.ProjectStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity(name = "project")
public class Project {
    @Id
    @Column(name = "project_id", nullable = false)
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long projectId;
    @Column(nullable = false)
    private String userId;
    @Column(nullable = true)
    private String description;
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ProjectStatus projectStatus;
    @Column(nullable = false)
    private String lastRun;
    @Column(nullable = true)
    private String lastBuildTime;
    @Column(nullable = false)
    private String projectName;
    @Column(nullable = false)
    private LocalDateTime createDateTime;
    @OneToOne(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ProjectConfig projectConfig;
}

