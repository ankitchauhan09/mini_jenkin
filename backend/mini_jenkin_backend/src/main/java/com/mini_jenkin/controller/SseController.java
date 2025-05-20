package com.mini_jenkin.controller;

import com.mini_jenkin.entity.Project;
import com.mini_jenkin.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.time.Instant;

@Controller
public class SseController {

    @Autowired
    private ProjectRepository projectRepository;

    @GetMapping("/project-update")
    public Flux<ServerSentEvent<Project>> projectUpdate() {
        return Flux.interval(Duration.ofSeconds(2))
                .flatMap(tick -> Flux.defer(() -> Flux.fromIterable(projectRepository.findAll())))
                .map(project -> ServerSentEvent.<Project>builder()
                        .id(String.valueOf(Instant.now().toEpochMilli()))
                        .event("project-update")
                        .data(project)
                        .build());
    }

}
