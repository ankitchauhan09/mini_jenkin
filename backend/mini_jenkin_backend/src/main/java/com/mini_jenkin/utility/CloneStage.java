package com.mini_jenkin.service.projectbuild;

import com.mini_jenkin.entity.Project;
import com.mini_jenkin.entity.ProjectLogs;
import com.mini_jenkin.exception.GeneralException;
import com.mini_jenkin.service.serviceInterface.ProjectLogServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.time.LocalDateTime;

@Slf4j
@Component
public class CloneStage implements BuildStage {

    @Autowired
    private ProjectLogServiceInterface projectLogService;

    @Override
    public void execute(Project project, File workingDir) {
        try {
            String gitUrl = project.getProjectConfig().getGithubUrl();
            File workingDirectory = new File(workingDir, project.getProjectName());

            if (workingDirectory.exists() && new File(workingDirectory, ".git").exists()) {
                // repo already exists so update the existing repository
                try {
                    Git git = Git.open(workingDirectory);
                    git.pull().call();
                    log.info("Repository updated successfully in {}", workingDirectory.getAbsolutePath());
                    ProjectLogs projectLogs = ProjectLogs.builder().projectId(project.getProjectId()).log("\"Repository updated successfully in " + workingDirectory.getAbsolutePath()).logTime(LocalDateTime.now()).build();
                    projectLogService.addProjectLog(projectLogs, project.getProjectId());
                    git.close();
                } catch (Exception e) {
                    log.error("Error while checking existing git repository: {}", e.getMessage(), e);
                    throw new RuntimeException("Error while checking existing git repository: " + e.getMessage(), e);
                }
            } else {
                //Clone the repository
                try {
                    Git.cloneRepository()
                            .setURI(gitUrl)
                            .setDirectory(workingDirectory)
                            .call();
                    log.info("Repository cloned successfully in {}", workingDirectory.getAbsolutePath());
                    ProjectLogs projectLogs = ProjectLogs.builder().projectId(project.getProjectId()).log("\"Repository cloned successfully in " + workingDirectory.getAbsolutePath()).logTime(LocalDateTime.now()).build();
                    projectLogService.addProjectLog(projectLogs, project.getProjectId());
                } catch (Exception e) {
                    log.error("Failed to clone repository", e);
                    ProjectLogs projectLogs = ProjectLogs.builder().projectId(project.getProjectId()).log("Failed to clone repository " + e.getMessage()).logTime(LocalDateTime.now()).build();
                    projectLogService.addProjectLog(projectLogs, project.getProjectId());
                    throw new GeneralException(e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Error during clone stage execution: {}", e.getMessage(), e);
            throw e;
        }
    }
}
