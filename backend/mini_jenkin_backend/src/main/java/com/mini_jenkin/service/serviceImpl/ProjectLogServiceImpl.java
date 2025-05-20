package com.mini_jenkin.service.serviceImpl;

import com.mini_jenkin.entity.ProjectLogs;
import com.mini_jenkin.repository.ProjectLogRepository;
import com.mini_jenkin.service.serviceInterface.ProjectLogServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectLogServiceImpl implements ProjectLogServiceInterface {

    @Autowired
    private ProjectLogRepository projectLogRepository;

    @Override
    public ProjectLogs addProjectLog(ProjectLogs projectLog, Long projectId) {
        if (projectLog == null || projectId == null) {
            throw new RuntimeException("Invalid log data");
        }
        if(projectLog.getLog().length() > 4000) {  // Keep reasonable limit
            projectLog.setLog(projectLog.getLog().substring(0, 4000) + "... [TRUNCATED]");
        }
        projectLog.setProjectId(projectId);
        return projectLogRepository.save(projectLog);
    }

    @Override
    public List<ProjectLogs> getAllProjectLogs(Long projectId) {
        if (projectId == null) {
            throw new RuntimeException("Project ID cannot be null");
        }
        return projectLogRepository.findByProjectId(projectId);
    }

    @Override
    public ProjectLogs getProjectLogs(Long projectId) {
        if (projectId == null) {
            throw new RuntimeException("Project ID or Log ID cannot be null");
        }
        Optional<ProjectLogs> log = projectLogRepository.findTopByProjectIdOrderByLogTimeDesc(projectId);
        return log.get();
    }

    @Override
    public void deleteProjectLogs(Long projectId) {
        if (projectId == null) {
            throw new RuntimeException("Project ID cannot be null");
        }
        projectLogRepository.deleteByProjectId(projectId);
    }
}
