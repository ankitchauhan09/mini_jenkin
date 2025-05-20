package com.mini_jenkin.controller;

import com.mini_jenkin.entity.Project;
import com.mini_jenkin.entity.ProjectConfig;
import com.mini_jenkin.payload.ApiResponse;
import com.mini_jenkin.service.serviceInterface.ProjectServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/project")
public class ProjectController {

    @Autowired
    private ProjectServiceInterface projectService;

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Project>> createProject(@RequestBody Project project) {
        Project createdProject = projectService.createProject(project);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(createdProject, "Project created successfully"));
    }

    @PostMapping("/update-project-info/{projectId}")
    public ResponseEntity<ApiResponse<Object>> updateProjectInfo(@RequestBody ProjectConfig projectConfig,@PathVariable Long projectId ) {
        Object updatedInfo = projectService.updateProjectInfo(projectConfig, projectId);
        return ResponseEntity.ok(ApiResponse.success(updatedInfo, "Project info updated successfully"));
    }


    @GetMapping("/build/{id}")
    public ResponseEntity<ApiResponse<Object>> getBuildLogs(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getBuildLogById(id), "Build log fetched successfully"));
    }
    @GetMapping("/build/all/{projectId}")
    public ResponseEntity<ApiResponse<Object>> getAllBuildLogs(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllBuildLogs(projectId), "All build logs fetched successfully"));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Object>> getProject(@PathVariable Long projectId) {
        Object project = projectService.getProject(projectId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(project, "Project fetched successfully"));
    }

    @GetMapping("/logs/{projectId}")
    public ResponseEntity<ApiResponse<Object>> getLogs(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjectLogs(projectId), "Logs fetched successfully"));
    }

    @GetMapping("/all-logs/{projectId}")
    public ResponseEntity<ApiResponse<Object>> getAllLogs(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getAllProjectLogs(projectId), "Logs fetched successfully"));
    }

    @PostMapping("/validate/github-url")
    public ResponseEntity<ApiResponse<Object>> checkGithubUrl(@RequestParam("url") String githubUrl) {
        return ResponseEntity.ok(ApiResponse.success(projectService.validateGithubUrl(githubUrl), "This is a valid github url"));
    }

    @GetMapping("/all/{userId}")
    public ResponseEntity<ApiResponse<Object>> getAllProject(@PathVariable String userId) {
        Object projects = projectService.getAllProjects(userId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(projects, "Projects fetched successfully"));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long projectId) {
        projectService.deleteProject(projectId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.success(null, "Project deleted successfully"));
    }
}