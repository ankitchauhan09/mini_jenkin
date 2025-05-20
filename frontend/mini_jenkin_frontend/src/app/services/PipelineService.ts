import apiService from '@/app/services/AuthService';

export enum ProjectStatus {
    SUCCESS = 'SUCCESS',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    PENDING = 'PENDING',
}

export interface ProjectConfig {
    id?: number;
    githubUrl?: string | null;
    shellCommand: string;
    branch: string;
    environmentVariables?: string | null;
}

export interface Project {
    projectId?: number;
    userId?: string;
    description?: string | null;
    projectStatus?: ProjectStatus;
    lastRun?: string;
    lastBuildTime?: string | null;
    projectName: string;
    createDateTime?: string;
    projectConfig?: ProjectConfig;
}

const PROJECT_SERVICE_URL = process.env.NEXT_PUBLIC_PROJECT_SERVICE!;

export const checkGithubUrl = async (githubUrl: string) => {
    try {
        const response = await apiService.post(
            PROJECT_SERVICE_URL,
            null,
            `/validate/github-url?url=${githubUrl}`
        );
        return response; // If the response is successful, return it as is
    } catch (error) {
        console.error(error);
        return handleError(error); // If error occurs, handle it and return the error object
    }
};

export const getProjectById = async (projectId: number) => {
    try {
        return await apiService.get(PROJECT_SERVICE_URL, `/${projectId}`);
    } catch (error) {
        console.error(error);
        return handleError(error);
    }
}

export const getAllBuildLogs = async (projectId: number) => {
    try {
        return await apiService.get(PROJECT_SERVICE_URL, `/build/all/${projectId}`);
    } catch (error) {
        console.error(error);
        return handleError(error);
    }
}

export const getProjectLogs = async (projectId: number) => {
    try {
        return await apiService.get(PROJECT_SERVICE_URL, `/logs/${projectId}`);
    } catch (error) {
        console.error(error);
        return handleError(error);
    }
}

export const loadAllProjectLogs = async (projectId: number) => {
    try {
        return await apiService.get(PROJECT_SERVICE_URL, `/all-logs/${projectId}`);
    } catch (error) {
        console.error(error);
        return handleError(error);
    }
}

export const executeProject = async (projectId: number) => {
    try {
        return await apiService.post(`http://localhost:8095/${projectId}/execute`, '', '');
    } catch (error) {
        console.error(error);
        return handleError(error);
    }
}

export const updateProjectConfig = async (projectId: number, projectConfig: {}) => {
    try {
        return await apiService.post(PROJECT_SERVICE_URL, projectConfig, `/update-project-info/${projectId}`)
    } catch (error) {
        console.log(error)
        return handleError(error)
    }
}

export const createNewProject = async (project: Project) => {
    try {
        return await apiService.post(PROJECT_SERVICE_URL, project, '/create');
    } catch (error) {
        console.error(error);
        return handleError(error);
    }
};

export const getAllProjects = async (userId: string) => {
    try {
        return await apiService.get(PROJECT_SERVICE_URL, `/all/${userId}`);
    } catch (error) {
        console.error(error);
        return handleError(error);
    }
};

const handleError = (error: any) => {
    // Extract the relevant error message
    const message = error?.response?.data?.message || "An unknown error occurred.";
    const detail = error?.response?.data?.detail || error?.message || "No further details available.";

    return {
        success: false,
        data: null,
        message: message,
        detail: detail,
    };
};