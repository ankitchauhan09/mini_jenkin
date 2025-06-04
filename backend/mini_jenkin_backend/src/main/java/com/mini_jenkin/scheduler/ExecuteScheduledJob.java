package com.mini_jenkin.scheduler;

import com.mini_jenkin.service.serviceInterface.ProjectExecutionServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ExecuteScheduledJob implements Job {

    @Autowired
    private ProjectExecutionServiceInterface projectExecutionServiceInterface;

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException  {
        Long projectId = (Long) jobExecutionContext.getMergedJobDataMap().get("projectId");
        log.info("Scheduled execution for projectId : {}" , projectId);
        try {
            projectExecutionServiceInterface.executeProject(projectId);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
