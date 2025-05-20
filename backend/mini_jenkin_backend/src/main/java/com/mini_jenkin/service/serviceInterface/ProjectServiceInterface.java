package com.mini_jenkin.service.serviceInterface;

import com.mini_jenkin.entity.BuildLogs;
import com.mini_jenkin.entity.Project;
import com.mini_jenkin.entity.ProjectConfig;
import com.mini_jenkin.entity.ProjectLogs;

import java.util.List;

public interface ProjectServiceInterface {
    public Project createProject(Project project);
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
}
