package com.mini_jenkin.service.serviceInterface;

import com.mini_jenkin.entity.ProjectLogs;

import java.util.List;

public interface ProjectLogServiceInterface {

    ProjectLogs addProjectLog(ProjectLogs projectLog, Long projectId);
    List<ProjectLogs> getAllProjectLogs(Long projectId);
    ProjectLogs getProjectLogs(Long projectId);
    void deleteProjectLogs(Long projectId);
}
