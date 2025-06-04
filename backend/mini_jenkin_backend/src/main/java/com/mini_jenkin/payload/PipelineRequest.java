package com.mini_jenkin.payload;

import lombok.Data;

import java.util.List;

@Data
public class PipelineRequest {
    private String name;
    private List<StageRequest> stages;
}
