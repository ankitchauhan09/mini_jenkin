package com.mini_jenkin.controller;

import com.mini_jenkin.service.serviceInterface.ProjectExecutionServiceInterface;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook")
public class WebhookController {

    @Autowired
    private ProjectExecutionServiceInterface projectExecutionService;

    @PostMapping("/github/{projectId}")
    public void handleGithubWebhook(@PathVariable Long projectId, @RequestBody String payload,
                                    @RequestHeader("X-GitHub-Event") String eventType) {
        if("push".equalsIgnoreCase(eventType)) {
            try {
                projectExecutionService.executeProject(projectId);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
    }

}
