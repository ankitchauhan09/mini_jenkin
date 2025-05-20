package com.mini_jenkin.service.serviceImpl;

import com.mini_jenkin.entity.BuildLogs;
import com.mini_jenkin.entity.Project;
import com.mini_jenkin.entity.ProjectConfig;
import com.mini_jenkin.entity.ProjectLogs;
import com.mini_jenkin.exception.DuplicateEntryException;
import com.mini_jenkin.exception.InvalidGithubUrlException;
import com.mini_jenkin.exception.ResourceNotFoundException;
import com.mini_jenkin.payload.ProjectStatus;
import com.mini_jenkin.repository.ProjectConfigRepository;
import com.mini_jenkin.repository.ProjectRepository;
import com.mini_jenkin.service.serviceInterface.BuildLogServiceInterface;
import com.mini_jenkin.service.serviceInterface.ProjectServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.TransportException;
import org.eclipse.jgit.lib.Ref;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Service
@Slf4j
public class ProjectServiceImpl implements ProjectServiceInterface {

    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ProjectConfigRepository projectConfigRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ProjectLogServiceImpl projectLogServiceImpl;
    @Autowired
    private BuildLogServiceInterface buildLogService;

//    @Override
//    public Project createProject(Project project) {
//        try {
//            //check if there's a project with same nome. If yes, then throw error DuplicateEntry and if no, then create the project
//            if (projectRepository.existsByProjectName(project.getProjectName())) {
//                throw new DuplicateEntryException("Project with name '" + project.getProjectName() + "' already exists");
//            }
//            project.setCreateDateTime(LocalDateTime.now());
//            project.setLastBuildTime("");
//            project.setProjectStatus(ProjectStatus.PENDING);
//            project.setLastRun("-");
//            Project createdProject = projectRepository.save(project);
//            return createdProject;
//        } catch (Exception e) {
//            log.info("project creation error : {}", e.getMessage());
//            throw e;
//        }
//    }

    @Override
    public Project createProject(Project project) {
        try {
            // Check if there's a project with same name. If yes, then throw error DuplicateEntry and if no, then create the project
            if (projectRepository.existsByProjectName(project.getProjectName())) {
                throw new DuplicateEntryException("Project with name '" + project.getProjectName() + "' already exists");
            }

            // Set default values
            project.setCreateDateTime(LocalDateTime.now());
            project.setLastBuildTime("");
            project.setProjectStatus(ProjectStatus.PENDING);
            project.setLastRun("-");

            // Fix the bidirectional relationship
            ProjectConfig config = project.getProjectConfig();
            if (config != null) {
                config.setProject(project);
            }

            // Save the project
            Project createdProject = projectRepository.save(project);
            return createdProject;
        } catch (Exception e) {
            log.info("project creation error : {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public Project getProject(Long id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PROJECT WITH ID : " + id + " NOT FOUND"));
        return project;
    }

    @Override
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("PROJECT WITH ID : " + id + " NOT FOUND"));
        projectRepository.delete(project);
    }

    @Override
    public List<Project> getAllProjects(String userId) {
        return projectRepository.findAllByUserId(userId);
    }

    @Override
    public ProjectConfig updateProjectInfo(ProjectConfig projectConfig, Long projectId) {
        try {
            log.info("Incoming projectInfo: {}", projectConfig);

            // Get existing config from DB
//            ProjectConfig oldConfig = projectRepository.findById(projectId)
//                    .orElseThrow(() -> new ResourceNotFoundException("PROJECT CONFIG WITH ID : " + projectConfig.getId() + " NOT FOUND"));
            Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("PROJECT WITH ID : " + projectId + " NOT FOUND"));
            ProjectConfig oldConfig = project.getProjectConfig();
            log.info("Found project: {}", project);
            // Update only the fields from input (avoid full replacement)
            oldConfig.setGithubUrl(projectConfig.getGithubUrl());
            oldConfig.setShellCommand(projectConfig.getShellCommand());
            oldConfig.setBranch(projectConfig.getBranch());
            oldConfig.setEnvironmentVariables(projectConfig.getEnvironmentVariables());
            oldConfig.setProject(project);  // update relation in case it changed

            // Save updated config
            return projectConfigRepository.save(oldConfig);

        } catch (Exception e) {
            log.error("Project config update error: {}", e.getMessage(), e);
            throw e;
        }
    }


    @Override
    public Boolean validateGithubUrl(String githubUrl) {
        try {
            Collection<Ref> refs = Git.lsRemoteRepository()
                    .setRemote(githubUrl)
                    .setHeads(true)
                    .setTags(true)
                    .call();
            return refs != null && !refs.isEmpty();
        } catch (TransportException e) {
            throw new InvalidGithubUrlException("The repo is private " + e.getMessage(), e);
        } catch (Exception e) {
            throw new InvalidGithubUrlException("Invalid GitHub URL: " + e.getMessage(), e);
        }
    }

    @Override
    public ProjectLogs getProjectLogs(Long projectId) {
        return projectLogServiceImpl.getProjectLogs(projectId);
    }

    @Override
    public List<ProjectLogs> getAllProjectLogs(Long projectId) {
        return projectLogServiceImpl.getAllProjectLogs(projectId);
    }

    @Override
    public BuildLogs addBuildLog(BuildLogs buildLogs) {
        return buildLogService.insertBuildLog(buildLogs);
    }

    @Override
    public BuildLogs getBuildLogById(Integer id) {
        return buildLogService.getBuildLogById(id);
    }

    @Override
    public List<BuildLogs> getAllBuildLogs(Long projectId) {
        return buildLogService.getAllBuildLogs(projectId);
    }

}
