    package com.mini_jenkin.service.serviceImpl;

    import com.mini_jenkin.entity.*;
    import com.mini_jenkin.exception.DuplicateEntryException;
    import com.mini_jenkin.exception.InvalidGithubUrlException;
    import com.mini_jenkin.exception.ResourceNotFoundException;
    import com.mini_jenkin.payload.PipelineConfigRequest;
    import com.mini_jenkin.payload.PipelineRequest;
    import com.mini_jenkin.payload.ProjectRequest;
    import com.mini_jenkin.payload.ProjectStatus;
    import com.mini_jenkin.repository.PipelineRepository;
    import com.mini_jenkin.repository.ProjectConfigRepository;
    import com.mini_jenkin.repository.ProjectRepository;
    import com.mini_jenkin.repository.StageRepository;
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
    import java.util.stream.Collectors;

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
        @Autowired
        private PipelineRepository pipelineRepository;
        @Autowired
        private StageRepository stageRepository;

        @Override
        public Project createProject(ProjectRequest projectRequest) {
            try {
                Project project = projectRequestToProject(projectRequest);

                if (projectRepository.existsByProjectName(project.getProjectName())) {
                    throw new DuplicateEntryException("Project with name '" + project.getProjectName() + "' already exists");
                }

                project.setCreateDateTime(LocalDateTime.now());
                project.setLastBuildTime("");
                project.setProjectStatus(ProjectStatus.PENDING);
                project.setLastRun("-");

                ProjectConfig config = project.getProjectConfig();
                if (config != null) {
                    config.setProject(project);
                }

                Project createdProject = projectRepository.save(project);
                projectRequest.getProjectConfig().setProject(createdProject);

                // ✅ Create and save PipelineConfig
                PipelineConfig pipelineConfig = savePipelineConfig(projectRequest, createdProject);

                // ✅ Set the reverse relationship
                createdProject.setPipelineConfig(pipelineConfig);  // <- PUT IT HERE

                return projectRepository.save(createdProject); // <- Save again to persist the relation (optional but safe)

            } catch (Exception e) {
                log.info("project creation error : {}", e.getMessage());
                throw e;
            }
        }



        private PipelineConfig savePipelineConfig(ProjectRequest request, Project project) {
            PipelineConfig pipelineConfig = new PipelineConfig();
            pipelineConfig.setName(request.getProjectName());
            pipelineConfig.setProject(project);

            List<Stage> stages = request.getPipelineConfig()
                    .getPipelineRequest()
                    .getStages()
                    .stream()
                    .map(s -> {
                        Stage stage = Stage.builder()
                                .name(s.getName())
                                .command(s.getCommand())
                                .build();
                        stage.setPipelineconfig(pipelineConfig);
                        return stage;
                    })
                    .collect(Collectors.toList()); // Use collect instead of toList()

            pipelineConfig.setStages(stages);
            return pipelineRepository.save(pipelineConfig);
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

        @Override
        public Boolean clearProjectLogs(Long projectId) {
            return projectLogServiceImpl.deleteProjectLogs(projectId);
        }


        private Project projectRequestToProject(ProjectRequest projectRequest) {
            Project project = new Project();
            project.setUserId(projectRequest.getUserId());
            project.setProjectName(projectRequest.getProjectName());
            project.setProjectStatus(ProjectStatus.PENDING);
            project.setProjectConfig(projectRequest.getProjectConfig());
            return project;
        }

    }
