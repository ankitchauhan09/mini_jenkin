package com.mini_jenkin.controller;

import com.mini_jenkin.payload.ApiResponse;
import com.mini_jenkin.service.serviceInterface.ProjectExecutionServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/{projectId}")
public class ProjectExecutionController {

    @Autowired
    private ProjectExecutionServiceInterface projectExecutionService;

    @PostMapping("/execute")
    public ResponseEntity<ApiResponse<Object>> execute(@PathVariable("projectId") Long projectId) throws Exception {
        Object executionResult = projectExecutionService.executeProject(projectId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(executionResult, "Project execution started successfully"));
    }

    @PostMapping("/schedule-execution")
    public ResponseEntity<ApiResponse<Object>> scheduleExecution(@PathVariable("projectId") Long projectId, @RequestParam("datetime") String dateTime) {
        try {
            return ResponseEntity.status(HttpStatus.OK)
                    .body(ApiResponse.success(projectExecutionService.scheduleProjectExecution(projectId, dateTime), "Project execution scheduled successfully"));
        } catch (Exception e) {
            throw new RuntimeException("Invalid cron expression or date format: " + e.getMessage(), e);
        }
    }

}