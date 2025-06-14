package com.mini_jenkin.service.serviceInterface;

import com.mini_jenkin.entity.ProjectConfig;

public interface ProjectExecutionServiceInterface {

    public Boolean executeProject(Long projectId) throws Exception;

    public Boolean scheduleProjectExecution(Long projectId, String cronExpression);
}
