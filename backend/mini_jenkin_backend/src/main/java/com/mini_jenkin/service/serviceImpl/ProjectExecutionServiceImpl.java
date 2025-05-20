package com.mini_jenkin.service.serviceImpl;

import com.mini_jenkin.entity.*;
import com.mini_jenkin.exception.GeneralException;
import com.mini_jenkin.exception.ResourceNotFoundException;
import com.mini_jenkin.payload.ProjectStatus;
import com.mini_jenkin.repository.BuildLogsRepository;
import com.mini_jenkin.repository.ProjectConfigRepository;
import com.mini_jenkin.repository.ProjectRepository;
import com.mini_jenkin.service.serviceInterface.BuildLogServiceInterface;
import com.mini_jenkin.service.serviceInterface.ProjectExecutionServiceInterface;
import com.mini_jenkin.service.serviceInterface.ProjectLogServiceInterface;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.jgit.api.Git;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.time.LocalDateTime;

@Service
@Slf4j
public class ProjectExecutionServiceImpl implements ProjectExecutionServiceInterface {

    @Value("${default.REPO_BASE_DIR}")
    private String defaultRepoPath;
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectLogServiceInterface projectLogService;
    @Autowired
    private BuildLogServiceInterface buildLogService;
    @Autowired
    private BuildLogsRepository buildLogsRepository;

    @PostConstruct
    public void init() {
        createDirectoryIfNotExists();
    }

    @Autowired
    private ProjectConfigRepository projectConfigRepository;

    private void createDirectoryIfNotExists() {
        File directory = new File(defaultRepoPath);
        if (!directory.exists()) {
            directory.mkdirs();
            log.info("Directory created :  " + directory.getAbsolutePath());
        } else {
            log.info("Directory already exists :  " + directory.getAbsolutePath());
        }
    }

    @Override
    public Boolean executeProject(Long projectId) {
        if (projectId == null) {
            throw new ResourceNotFoundException("Invalid project id..");
        }
        Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Invalid project id.."));
        ProjectConfig projectConfig = project.getProjectConfig();
        if (projectConfig.getGithubUrl().isEmpty()) {
            executeShellCommands(projectConfig, defaultRepoPath);
        } else {
            cloneRepoAndExecuteShellCommands(projectConfig);
        }
        return true;
    }


    private void cloneRepoAndExecuteShellCommands(ProjectConfig projectConfig) {
        try {
            //clone the repo in default_repo_url/<project_name>/
            String repoUrl = projectConfig.getGithubUrl().trim();
            File workingDirFile = new File(defaultRepoPath, projectConfig.getProject().getProjectName());

            if (workingDirFile.exists() && new File(workingDirFile, ".git").exists()) {
                // Update the existing repository
                try {
                    Git git = Git.open(workingDirFile);
                    git.pull().call();
                    log.info("Repository updated successfully in {}", workingDirFile.getAbsolutePath());
                    ProjectLogs projectLogs = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("\"Repository updated successfully in " + workingDirFile.getAbsolutePath()).logTime(LocalDateTime.now()).build();
                    projectLogService.addProjectLog(projectLogs, projectConfig.getProject().getProjectId());
                    git.close();
                } catch (Exception e) {
                    log.error("Failed to pull repository: {}", workingDirFile.getAbsolutePath(), e);
                    ProjectLogs projectLogs = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Failed to pull repository: " +  workingDirFile.getAbsolutePath() + " " + e.getMessage()).logTime(LocalDateTime.now()).build();
                    projectLogService.addProjectLog(projectLogs, projectConfig.getProject().getProjectId());
                    throw new GeneralException("Failed to pull repository: " + workingDirFile.getAbsolutePath());
                }
            } else {
                // Clone the repository
                try {
                    Git.cloneRepository()
                            .setURI(repoUrl)
                            .setDirectory(workingDirFile)
                            .call();
                    log.info("Repository cloned successfully to {}", workingDirFile.getAbsolutePath());
                    ProjectLogs projectLogs = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Repository cloned successfully to " + workingDirFile.getAbsolutePath()).logTime(LocalDateTime.now()).build();
                    projectLogService.addProjectLog(projectLogs, projectConfig.getProject().getProjectId());
                } catch (Exception e) {
                    log.error("Failed to clone repository", e);
                    ProjectLogs projectLogs = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Failed to clone repository " + e.getMessage()).logTime(LocalDateTime.now()).build();
                    projectLogService.addProjectLog(projectLogs, projectConfig.getProject().getProjectId());
                    throw new GeneralException(e.getMessage());
                }
            }

            //run the shell commands in the default_repo_url/<project_name>/repo_name/
            executeShellCommands(projectConfig, workingDirFile.getAbsolutePath());

        } catch (Exception e) {
            throw new GeneralException(e.getMessage());
        }
    }

    private void executeShellCommands(ProjectConfig projectConfig, String workingDir) {
        String shellCommand = projectConfig.getShellCommand();
        if (shellCommand == null || shellCommand.isEmpty()) {
            log.warn("No shell command provided.");
            return;
        }
        projectRepository.setStatusToRunning(ProjectStatus.RUNNING, projectConfig.getProject().getProjectId());
        log.info("Executing shell command: {} in directory {}", shellCommand, workingDir);
        ProjectLogs projectLogs = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Executing shell command: {} in directory " +  shellCommand + " " + workingDir).logTime(LocalDateTime.now()).build();
        projectLogService.addProjectLog(projectLogs, projectConfig.getProject().getProjectId());
        try {
            //check the os
            //On windows the commands run via "cmd /c"
            //on linux the commands run via "sh -c"
            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");

            ProcessBuilder processBuilder;
            if (isWindows) {
                processBuilder = new ProcessBuilder("cmd.exe", "/c", shellCommand);
            } else {
                processBuilder = new ProcessBuilder("sh", "-c", shellCommand);
            }
            processBuilder.directory(new File(workingDir));
            processBuilder.redirectErrorStream(true);
            Long startTime = System.currentTimeMillis();
            Process process = processBuilder.start();
            StringBuilder output = new StringBuilder();
            try (var reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            Long endTime = System.currentTimeMillis();
            Long executionTime = endTime - startTime;
            if (exitCode != 0) {
                log.error("Shell command exited with error code: {}", exitCode);
                ProjectLogs projectLogss = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Shell command exited with error code: " +  exitCode).logTime(LocalDateTime.now()).build();
                projectLogService.addProjectLog(projectLogss, projectConfig.getProject().getProjectId());
                BuildLogs buildLogs = BuildLogs.builder()
                        .executionTime(formatDuration(executionTime))
                        .projectId(projectConfig.getProject().getProjectId())
                        .status(BuildStatus.FAILURE)
                        .timestamp(LocalDateTime.now())
                        .build();
                buildLogsRepository.save(buildLogs);
                throw new RuntimeException("Shell command failed with exit code " + exitCode);
            } else {
                projectRepository.setStatusToRunning(ProjectStatus.SUCCESS, projectConfig.getProject().getProjectId());
                log.info("Shell command executed successfully. : {}", output.toString());
                ProjectLogs projectLogss = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log(output.toString()).logTime(LocalDateTime.now()).build();
                projectLogService.addProjectLog(projectLogss, projectConfig.getProject().getProjectId());
                BuildLogs buildLogs = BuildLogs.builder()
                        .executionTime(formatDuration(executionTime))
                        .projectId(projectConfig.getProject().getProjectId())
                        .status(BuildStatus.SUCCESS)
                        .timestamp(LocalDateTime.now())
                        .build();
                buildLogsRepository.save(buildLogs);
            }
        } catch (Exception e) {
            Thread.currentThread().interrupt(); // Restore interrupted status
            log.error("Error executing shell command", e);
            ProjectLogs projectLogss = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Error executing shell command " + e.getMessage()).logTime(LocalDateTime.now()).build();
            projectLogService.addProjectLog(projectLogss, projectConfig.getProject().getProjectId());
            updateProjectStatus(projectConfig.getProject().getProjectId(), ProjectStatus.FAILED);
            BuildLogs buildLogs = BuildLogs.builder()
                    .executionTime(formatDuration(0))
                    .projectId(projectConfig.getProject().getProjectId())
                    .status(BuildStatus.FAILURE)
                    .timestamp(LocalDateTime.now())
                    .build();
            buildLogsRepository.save(buildLogs);
            throw new RuntimeException(e);        }
    }

    public static String formatDuration(long milliseconds) {
        long totalSeconds = milliseconds / 1000;
        long hours = totalSeconds / 3600;
        long minutes = (totalSeconds % 3600) / 60;
        long seconds = totalSeconds % 60;

        StringBuilder sb = new StringBuilder();

        if (hours > 0) sb.append(hours).append("h ");
        if (minutes > 0) sb.append(minutes).append("m ");
        if (seconds > 0 || sb.length() == 0) sb.append(seconds).append("s");

        return sb.toString().trim();
    }


    void updateProjectStatus(Long projectId, ProjectStatus status) {
        projectRepository.setStatusToRunning(status, projectId);
    }
}
