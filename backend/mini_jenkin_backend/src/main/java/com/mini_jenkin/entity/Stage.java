package com.mini_jenkin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = "pipelineconfig")
@EqualsAndHashCode(exclude = "pipelineconfig")
public class Stage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String command;
    @ManyToOne
    @JoinColumn(name = "pipeline_config_id")
    @JsonIgnore
    private PipelineConfig pipelineconfig;
}
