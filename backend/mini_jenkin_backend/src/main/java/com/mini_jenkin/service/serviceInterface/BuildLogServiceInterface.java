package com.mini_jenkin.service.serviceInterface;

import com.mini_jenkin.entity.BuildLogs;

import java.util.List;

public interface BuildLogServiceInterface {
    public BuildLogs insertBuildLog(BuildLogs buildLogs);
    public List<BuildLogs> getAllBuildLogs(Long projectId);
    public BuildLogs getBuildLogById(Integer id);
}
