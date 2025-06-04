package com.mini_jenkin.payload;

import com.mini_jenkin.entity.ProjectConfig;
import lombok.Data;

import java.util.List;

@Data
public class ProjectRequest {
    private String projectName;
    private String userId;
    private ProjectConfig projectConfig;
    private PipelineConfigRequest pipelineConfig;
}


