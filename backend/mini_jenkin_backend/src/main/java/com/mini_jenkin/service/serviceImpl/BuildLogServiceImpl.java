package com.mini_jenkin.service.serviceImpl;

import com.mini_jenkin.entity.BuildLogs;
import com.mini_jenkin.exception.ResourceNotFoundException;
import com.mini_jenkin.repository.BuildLogsRepository;
import com.mini_jenkin.service.serviceInterface.BuildLogServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class BuildLogServiceImpl implements BuildLogServiceInterface {

    @Autowired
    private BuildLogsRepository buildLogsRepository;

    @Override
    public BuildLogs insertBuildLog(BuildLogs buildLogs) {
        if(buildLogs == null) {
            throw new IllegalArgumentException("buildLogs is null");
        }
        buildLogsRepository.save(buildLogs);
        return buildLogs;
    }

    @Override
    public List<BuildLogs> getAllBuildLogs(Long projectId) {
        log.info("Fetching all build logs for project with ID: {}", projectId);

        List<BuildLogs> buildLogs = buildLogsRepository.findAllByProjectId(projectId);
        log.info("BuildLogs length : {}", buildLogs.size());
        return buildLogs;
    }

    @Override
    public BuildLogs getBuildLogById(Integer id) {
        return buildLogsRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No build log with this id : " + id));
    }
}
