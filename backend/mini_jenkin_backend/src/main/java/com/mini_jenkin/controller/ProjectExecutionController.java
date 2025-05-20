package com.mini_jenkin.controller;

import com.mini_jenkin.payload.ApiResponse;
import com.mini_jenkin.service.serviceInterface.ProjectExecutionServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/{projectId}")
public class ProjectExecutionController {

    @Autowired
    private ProjectExecutionServiceInterface projectExecutionService;

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<Object>> execute(@PathVariable("projectId") Long projectId) {
        Object executionResult = projectExecutionService.executeProject(projectId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(executionResult, "Project execution started successfully"));
    }
}