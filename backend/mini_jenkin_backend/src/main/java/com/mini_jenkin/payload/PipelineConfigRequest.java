package com.mini_jenkin.payload;

import lombok.Data;

@Data
public class PipelineConfigRequest {
    private Long projectId;
    private PipelineRequest pipelineRequest;
}
