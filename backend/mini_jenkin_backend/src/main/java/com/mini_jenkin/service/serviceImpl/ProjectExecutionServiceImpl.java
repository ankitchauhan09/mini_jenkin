    package com.mini_jenkin.service.serviceImpl;

    import com.mini_jenkin.entity.*;
    import com.mini_jenkin.exception.GeneralException;
    import com.mini_jenkin.exception.ResourceNotFoundException;
    import com.mini_jenkin.payload.MailObject;
    import com.mini_jenkin.payload.ProjectStatus;
    import com.mini_jenkin.repository.BuildLogsRepository;
    import com.mini_jenkin.repository.ProjectConfigRepository;
    import com.mini_jenkin.repository.ProjectRepository;
    import com.mini_jenkin.repository.UserRepository;
    import com.mini_jenkin.scheduler.ExecuteScheduledJob;
    import com.mini_jenkin.service.serviceInterface.BuildLogServiceInterface;
    import com.mini_jenkin.service.serviceInterface.EmailSendingServiceInterface;
    import com.mini_jenkin.service.serviceInterface.ProjectExecutionServiceInterface;
    import com.mini_jenkin.service.serviceInterface.ProjectLogServiceInterface;
    import com.mini_jenkin.utility.CloneStage;
    import jakarta.annotation.PostConstruct;
    import jakarta.transaction.Transactional;
    import lombok.extern.slf4j.Slf4j;
    import org.eclipse.jgit.api.Git;
    import org.quartz.*;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.stereotype.Service;

    import java.io.BufferedReader;
    import java.io.File;
    import java.io.InputStreamReader;
    import java.nio.file.Files;
    import java.time.LocalDateTime;
    import java.util.Date;
    import java.util.concurrent.ExecutorService;

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
    @Autowired
    private CloneStage cloneStage;

        @Autowired
        private Scheduler scheduler;

        @PostConstruct
        public void init() {
            createDirectoryIfNotExists();
        }

        @Autowired
        private ExecutorService executorService;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private EmailSendingServiceInterface emailSendingService;

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
        public Boolean executeProject(Long projectId) throws Exception {
            return executorService.submit(() -> {
                if (projectId == null) {
                    throw new ResourceNotFoundException("Invalid project id..");
                }
                Project project = projectRepository.findById(projectId).orElseThrow(() -> new ResourceNotFoundException("Invalid project id.."));
                ProjectConfig projectConfig = project.getProjectConfig();
                PipelineConfig pipelineConfig = projectConfig.getProject().getPipelineConfig();
                if (pipelineConfig == null) {
                    throw new ResourceNotFoundException("Pipeline configuration not found for project id: " + projectId);
                }

                String workingDir = cloneStage.cloneOrPullGithubRepo(project, new File(defaultRepoPath));

                executePipeline(project, workingDir);

                return true;
            }).get();
        }

        private void executePipeline(Project project, String workingDir) {
            PipelineConfig pipelineConfig = project.getPipelineConfig();
            Long start = System.currentTimeMillis();

            for (Stage stage : pipelineConfig.getStages()) {
                try {
                    execute(project, stage);
                } catch (Exception e) {
                    long executionTime = System.currentTimeMillis() - start;
                    projectRepository.setStatusToRunning(ProjectStatus.FAILED, project.getProjectId());

                    BuildLogs buildLogs = BuildLogs.builder()
                            .executionTime(formatDuration(executionTime))
                            .projectId(project.getProjectId())
                            .status(BuildStatus.FAILURE)
                            .timestamp(LocalDateTime.now())
                            .build();

                    buildLogsRepository.save(buildLogs);

                    throw new RuntimeException("Stage failed: " + stage.getName() + " - " + e.getMessage(), e);
                }
            }

            // Optionally, save success log
            long totalExecutionTime = System.currentTimeMillis() - start;
            projectRepository.setStatusToRunning(ProjectStatus.SUCCESS, project.getProjectId());

            BuildLogs successLog = BuildLogs.builder()
                    .executionTime(formatDuration(totalExecutionTime))
                    .projectId(project.getProjectId())
                    .status(BuildStatus.SUCCESS)
                    .timestamp(LocalDateTime.now())
                    .build();

            buildLogsRepository.save(successLog);
        }


        private void execute(Project project, Stage stage) throws Exception{
            String command = stage.getCommand();
            String workingDir = defaultRepoPath + File.separator + project.getProjectName(); // or pass this in

            log.info("Executing stage '{}' with command: {}", stage.getName(), command);

            ProjectLogs startLog = ProjectLogs.builder()
                    .projectId(project.getProjectId())
                    .log("Starting stage: " + stage.getName())
                    .logTime(LocalDateTime.now())
                    .build();
            projectLogService.addProjectLog(startLog, project.getProjectId());

            boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
            ProcessBuilder builder = isWindows ?
                    new ProcessBuilder("cmd.exe", "/c", command) :
                    new ProcessBuilder("sh", "-c", command);

            builder.directory(new File(workingDir));
            builder.redirectErrorStream(true);

            long start = System.currentTimeMillis();
            Process process = builder.start();

            StringBuilder output = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    output.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();
            long end = System.currentTimeMillis();

            String duration = formatDuration(end - start);

            if (exitCode != 0) {
                log.error("Stage '{}' failed with exit code {}", stage.getName(), exitCode);
                projectLogService.addProjectLog(ProjectLogs.builder()
                        .projectId(project.getProjectId())
                        .log("Stage '" + stage.getName() + "' failed with exit code " + exitCode)
                        .logTime(LocalDateTime.now())
                        .build(), project.getProjectId());
                throw new RuntimeException("Stage '" + stage.getName() + "' failed.");
            } else {
                projectLogService.addProjectLog(ProjectLogs.builder()
                        .projectId(project.getProjectId())
                        .log("Stage '" + stage.getName() + "' succeeded.\nOutput:\n" + output)
                        .logTime(LocalDateTime.now())
                        .build(), project.getProjectId());
                log.info("Stage '{}' completed successfully in {}", stage.getName(), duration);
            }

        }

        @Override
        public Boolean scheduleProjectExecution(Long projectId, String dateTime) {
            try {
                LocalDateTime ldt = LocalDateTime.parse(dateTime);
                Date triggerTime = java.sql.Timestamp.valueOf(ldt);

                JobDetail jobDetail = JobBuilder.newJob(ExecuteScheduledJob.class)
                        .withIdentity("executeScheduleJob_" + projectId + "_" + triggerTime.getTime())
                        .usingJobData("projectId", projectId)
                        .build();

                Trigger trigger = TriggerBuilder.newTrigger()
                        .withIdentity("trigger_" + projectId + "_" + triggerTime.getTime())
                        .startAt(triggerTime)
                        .build();

                scheduler.scheduleJob(jobDetail, trigger);
                log.info("Scheduled job for projectId: {} at {}", projectId, triggerTime);
                return true;
            } catch (Exception e) {
                throw new RuntimeException("Invalid date/time format or scheduling error", e);
            }
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
                        ProjectLogs projectLogs = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Failed to pull repository: " + workingDirFile.getAbsolutePath() + " " + e.getMessage()).logTime(LocalDateTime.now()).build();
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
            ProjectLogs projectLogs = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Executing shell command: {} in directory " + shellCommand + " " + workingDir).logTime(LocalDateTime.now()).build();
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
                    ProjectLogs projectLogss = ProjectLogs.builder().projectId(projectConfig.getProject().getProjectId()).log("Shell command exited with error code: " + exitCode).logTime(LocalDateTime.now()).build();
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

                    User user = userRepository.findById(projectConfig.getProject().getUserId())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + projectConfig.getProject().getUserId()));

                    emailSendingService.sendEmail(MailObject.builder()
                            .recipient(user.getEmail())
                            .subject("Build Success Notification")
                            .msgBody(buildSuccessEmailBody(projectConfig.getProject().getProjectName(), output.toString()))
                            .build());
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
                throw new RuntimeException(e);
            }
        }

        private String buildSuccessEmailBody(String projectName, String projectLog) {

            return String.format("""
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <title>Build Success Notification</title>
                </head>
                <body style="margin:0;padding:0;background:#f4f8fb;font-family:'Segoe UI',Arial,sans-serif;">
                  <table width="100%%" bgcolor="#f4f8fb" cellpadding="0" cellspacing="0" style="padding:40px 0;">
                    <tr>
                      <td align="center">
                        <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:18px;box-shadow:0 8px 32px rgba(44,62,80,0.10);overflow:hidden;">
                          <tr>
                            <td style="background:linear-gradient(90deg,#2563eb 0%%,#1e40af 100%%);padding:32px 0;text-align:center;">
                              <div style="display:inline-block;background:#fff;border-radius:50%%;padding:16px;">
                                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" style="display:block;">
                                  <circle cx="12" cy="12" r="12" fill="#2563eb"/>
                                  <path d="M8 12.5l2.5 2.5 5-5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                              </div>
                              <h1 style="color:#fff;font-size:2rem;font-weight:700;margin:24px 0 0 0;letter-spacing:-1px;">Build Success!</h1>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:32px 32px 24px 32px;text-align:center;">
                              <h2 style="color:#1e293b;font-size:1.25rem;font-weight:600;margin:0 0 12px 0;">Your project <span style="color:#2563eb;">%s</span> has been built successfully.</h2>
                              <p style="color:#334155;font-size:1rem;line-height:1.6;margin:0 0 24px 0;">
                                Congratulations! The latest build for <b>%s</b> completed without errors.<br>
                                You can now continue your workflow with confidence.
                              </p>
                              <div style="background:#f8fafc;border-radius:8px;padding:16px;text-align:left;margin-top:24px;">
                                <h3 style="color:#1e293b;font-size:1rem;margin:0 0 8px 0;">Latest Build Log:</h3>
                                <pre style="background:#f1f5f9;padding:12px;border-radius:6px;margin:0;overflow-x:auto;font-size:0.875rem;color:#334155;">%s</pre>
                              </div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:24px 32px 32px 32px;text-align:center;">
                              <p style="color:#64748b;font-size:0.95rem;margin:0;">
                                &copy; 2025 CI/CD by Ankit Chauhan &mdash; Modern continuous integration and deployment
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """, projectName, projectName, projectLog);
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
