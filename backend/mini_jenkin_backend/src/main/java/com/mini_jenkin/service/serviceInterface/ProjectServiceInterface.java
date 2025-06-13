package com.mini_jenkin.service.serviceInterface;

import com.mini_jenkin.entity.*;
import com.mini_jenkin.payload.ProjectRequest;

import java.util.List;

public interface ProjectServiceInterface {
    public Project createProject(ProjectRequest projectRequest);
    public Project getProject(Long id);
    public void deleteProject(Long id);
    public List<Project> getAllProjects(String userId);

public ProjectConfig updateProjectInfo(ProjectConfig projectConfig, Long projectId);

    Boolean validateGithubUrl(String githubUrl);

    ProjectLogs getProjectLogs(Long projectId);

    List<ProjectLogs> getAllProjectLogs(Long projectId);

    BuildLogs addBuildLog(BuildLogs buildLogs);

    BuildLogs getBuildLogById(Integer id);

    List<BuildLogs> getAllBuildLogs(Long projectId);

    Boolean clearProjectLogs(Long projectId);

    Project updatePipeline(PipelineConfig pipelineConfig, Long pipelineId);
}
