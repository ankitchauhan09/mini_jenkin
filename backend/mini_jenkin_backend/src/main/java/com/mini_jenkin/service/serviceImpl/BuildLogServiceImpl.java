package com.mini_jenkin.service.serviceImpl;

import com.mini_jenkin.entity.BuildLogs;
import com.mini_jenkin.exception.ResourceNotFoundException;
import com.mini_jenkin.repository.BuildLogsRepository;
import com.mini_jenkin.service.serviceInterface.BuildLogServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
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
        return buildLogsRepository.findAll();
    }

    @Override
    public BuildLogs getBuildLogById(Integer id) {
        return buildLogsRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("No build log with this id : " + id));
    }
}
