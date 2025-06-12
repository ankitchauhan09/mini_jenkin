package com.mini_jenkin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.List;

@Data
    @Entity(name = "pipelineconfig")
@ToString(exclude = {"project", "stages"})
@EqualsAndHashCode(exclude = {"project", "stages"})
public class PipelineConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "pipeline_config_id")
    private Long id;
    private String name;
    @OneToMany(mappedBy = "pipelineconfig", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Stage> stages;
    @OneToOne
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnore
    private Project project;
}
