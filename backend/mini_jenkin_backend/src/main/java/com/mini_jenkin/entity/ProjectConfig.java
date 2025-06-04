package com.mini_jenkin.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@Builder    
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"project", "stages"})
@EqualsAndHashCode(exclude = {"project", "stages"})
public class ProjectConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;
    @Column(nullable = true)
    private String githubUrl;
    @Column(nullable = false, length = 2000)
    private String shellCommand;
    @Column(nullable = false)
    private String branch = "main";
    @Column(nullable = true, length = 2000)
    private String environmentVariables;
    @OneToOne( fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(nullable = false, name = "project_id")
    private Project project;
}
