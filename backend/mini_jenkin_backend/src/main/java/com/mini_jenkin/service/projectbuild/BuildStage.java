package com.mini_jenkin.service.projectbuild;

import com.mini_jenkin.entity.PipelineConfig;
import com.mini_jenkin.entity.Project;

import java.io.File;

public interface BuildStage {
    void execute(Project project, File workingDir) throws Exception;
}
