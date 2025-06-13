package com.mini_jenkin.dto;

import com.mini_jenkin.entity.Stage;
import lombok.Data;

import java.util.List;

@Data
public class PipelineUpdateRequest {
    private PipelineRequest pipelineRequest;

    @Data
    public static class PipelineRequest {
        private String name;
        private List<Stage> stages;
    }
}