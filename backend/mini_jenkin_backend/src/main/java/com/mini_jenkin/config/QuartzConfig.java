package com.mini_jenkin.config;

import com.mini_jenkin.scheduler.ExecuteScheduledJob;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Trigger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuartzConfig {

    @Bean
    public JobDetail executeScheduledJobDetail() {
        return JobBuilder.newJob(ExecuteScheduledJob.class)
                .withIdentity("executeScheduledJob")
                .storeDurably()
                .build();
    }


}
