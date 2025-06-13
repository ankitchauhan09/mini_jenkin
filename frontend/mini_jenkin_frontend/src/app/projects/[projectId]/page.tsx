// pages/project/[id].tsx
"use client";
import React, {useEffect, useRef, useState} from 'react';
import Head from 'next/head';
import {useParams, useRouter} from "next/navigation";
import Navbar from '../../components/Navbar';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Clock,
    Download,
    ExternalLink,
    GitBranch,
    Github,
    Pause,
    Play,
    RefreshCw,
    Settings,
    Terminal,
    Trash
} from 'lucide-react';
import {useUser} from "@/app/context/UserContext";
import {
    clearProjectLogs,
    executeProject,
    getAllBuildLogs,
    getProjectById,
    getProjectLogs,
    loadAllProjectLogs,
    scheduleProjectExecution,
    updatePipelineConfig,
    updateProjectConfig
} from "@/app/services/PipelineService";
import {toast} from 'sonner';

// Add PipelineStage and PipelineRequest interfaces
interface PipelineStage {
    name: string;
    command: string;
}

interface PipelineRequest {
    name: string;
    stages: PipelineStage[];
}

interface PipelineConfig {
    pipelineRequest: PipelineRequest;
}

// Define types based on provided data structure
interface ProjectConfig {
    id: number;
    githubUrl: string;
    shellCommand: string;
    branch: string;
    environmentVariables: string;
}

interface Project {
    projectId: number;
    userId: string;
    description: string;
    projectStatus: 'SUCCESS' | 'RUNNING' | 'FAILED' | 'PENDING';
    lastRun: string;
    lastBuildTime: string;
    projectName: string;
    createDateTime: string;
    projectConfig: ProjectConfig;
    pipelineConfig?: PipelineConfig; // Add pipelineConfig
}

interface LogEntry {
    id: number;
    logTime: string;
    projectId: number;
    log: string;
}

interface BuildHistory {
    id: number;
    status: 'SUCCESS' | 'FAILURE';
    timestamp: string;
    executionTime: string;
    projectId: string;
}

const ProjectDetails: React.FC = () => {
    const {user} = useUser();
    const router = useRouter();
    const params = useParams();
    const projectId = params?.projectId ? Number(params.projectId) : null;
    const [project, setProject] = useState<Project | null>(null);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [buildHistory, setBuildHistory] = useState<BuildHistory[]>([]);
    const [showConfigurePipeline, setShowConfigurePipeline] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    // const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
    const [lastLogId, setLastLogId] = useState<number | null>(null);
    const [refreshingBuildLogs, setRefreshingBuildLogs] = useState<Boolean>(false)
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduleDateTime, setScheduleDateTime] = useState('');
    const [isScheduling, setIsScheduling] = useState(false);
    const scheduleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isEditMode, setIsEditMode] = useState<Boolean>(false)
    const [isPipelineEditMode, setIsPipelineEditMode] = useState(false);
    const [pipelineForm, setPipelineForm] = useState<PipelineConfig>({
        pipelineRequest: {
            name: project?.pipelineConfig?.pipelineRequest?.name || '',
            stages: project?.pipelineConfig?.pipelineRequest?.stages || []
        }
    });
    const handlePipelineEditMode = () => {
        setIsPipelineEditMode(true);
        console.log('Pipeline edit mode enabled');
        console.log(project?.pipelineConfig)
        setPipelineForm({
            pipelineRequest: {
                name: project?.pipelineConfig?.name || '',
                stages: project?.pipelineConfig?.stages?.map(stage => ({
                    name: stage.name || '',
                    command: stage.command || ''
                })) || []
            }
        });
    };
    const handlePipelineSubmit = async () => {
        if (!project?.pipelineConfig?.id) return;
        console.log(pipelineForm)
        try {
            const response = await updatePipelineConfig(project?.pipelineConfig?.id, pipelineForm);

            if (response.success) {
                // Update the local project state with the new pipeline config
                setProject(prevProject => {
                    if (!prevProject) return null;
                    return {
                        ...prevProject,
                        pipelineConfig: response.data.pipelineConfig
                    };
                });

                setIsPipelineEditMode(false);
                toast.success('Pipeline configuration updated successfully');
            } else {
                toast.error(response.message || 'Failed to update pipeline configuration');
            }
        } catch (error) {
            console.error('Error updating pipeline:', error);
            toast.error('Failed to update pipeline configuration');
        }
    };
    const [configForm, setConfigForm] = useState({
        githubUrl: '',
        branch: '',
        shellCommand: '',
        environmentVariables: ''
    });
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [formErrors, setFormErrors] = useState({
        githubUrl: '',
        branch: '',
        shellCommand: ''
    });

    const clearLogs = async () => {
        const response = await clearProjectLogs(projectId!!);
        if (response.success) {
            setLogs([])
            toast('Project logs cleared successfully');
        } else {
            toast.error('Failed to clear project logs');
        }
    }

    const handleScheduleBuild = async () => {
        if (!scheduleDateTime || !projectId) return;
        setIsScheduling(true);
        const result = await scheduleExecution(projectId, scheduleDateTime);
        setIsScheduling(false);
        setShowScheduleModal(false);
        if (result.success) {
            toast.success('Project execution scheduled successfully!');
            // Reminder: show a toaster 1 minute before scheduled time
            const scheduledTime = new Date(scheduleDateTime).getTime();
            const now = Date.now();
            const msUntilReminder = scheduledTime - now - 60000; // 1 min before
            if (msUntilReminder > 0) {
                scheduleTimeoutRef.current = setTimeout(() => {
                    toast.info('Reminder: Project build will start in 1 minute!');
                }, msUntilReminder);
            }
        } else {
            toast.error(result.message || 'Failed to schedule project execution');
        }
    };
    useEffect(() => {
        return () => {
            if (scheduleTimeoutRef.current) clearTimeout(scheduleTimeoutRef.current);
        };
    }, []);

// Add this function to handle form submission
    const handleUpdateConfig = async () => {
        // Basic validation
        const errors = {
            githubUrl: '',
            branch: '',
            shellCommand: ''
        };

        // if (!configForm.githubUrl) {
        //     errors.githubUrl = 'Repository URL is required';
        // } else if (!configForm.githubUrl.includes('github.com')) {
        //     errors.githubUrl = 'Please enter a valid GitHub URL';
        // }

        if (!configForm.branch) {
            errors.branch = 'Branch is required';
        }

        if (!configForm.shellCommand) {
            errors.shellCommand = 'Build command is required';
        }

        // Check if there are any errors
        if (errors.githubUrl || errors.branch || errors.shellCommand) {
            setFormErrors(errors);
            return;
        }

        setIsSaving(true);
        try {
            // This would be replaced with your actual API call
            // await updateProjectConfig(projectId, configForm);

            // Mock successful update for now
            // setTimeout(() => {
            //     // Update the project state with new config
            //     setProject(prev => {
            //         if (!prev) return null;
            //         return {
            //             ...prev,
            //             projectConfig: {
            //                 ...prev.projectConfig,
            //                 githubUrl: configForm.githubUrl,
            //                 branch: configForm.branch,
            //                 shellCommand: configForm.shellCommand,
            //                 environmentVariables: configForm.environmentVariables
            //             }
            //         };
            //     });
            //
            //     setIsEditMode(false);
            //     setIsSaving(false);
            // }, 1000);

            console.log(configForm)
            const response = await updateProjectConfig(projectId!!, configForm)
            console.log(response)
            toast("Project config updated successfully")
            setIsSaving(false);
        } catch (error) {
            console.error("Failed to update project configuration:", error);
            setIsSaving(false);
        }
    };

// Add this function to initialize the form with current values
    const startEditing = () => {
        if (project?.projectConfig) {
            setConfigForm({
                githubUrl: project.projectConfig.githubUrl || '',
                branch: project.projectConfig.branch || '',
                shellCommand: project.projectConfig.shellCommand || '',
                environmentVariables: project.projectConfig.environmentVariables || ''
            });
        }
        setFormErrors({
            githubUrl: '',
            branch: '',
            shellCommand: ''
        });
        setIsEditMode(true);
    };

    //schedule project
    const scheduleExecution = async (projectId: number, datetime: string) => {
        try {
            console.log('Scheduling project execution for ID:', projectId, 'at', datetime);
            // const url = `http://localhost:8095/${projectId}/schedule-execution?datetime=${datetime}:00`;
            // const response = await fetch(url, { method: 'POST' });
            const response: any = await scheduleProjectExecution(projectId, datetime);
            console.log('Schedule response:', response);
            return {success: response.data, message: 'Project execution scheduled successfully'};
        } catch (error) {
            return {success: false, message: error?.toString() || 'Unknown error'};
        }
    };

// Add this function to handle form changes
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setConfigForm(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when typing
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Check if the user is logged in
    useEffect(() => {
        console.log('projectId ' + projectId)
        if (!user) {
            // router.push('/login');
        } else if (projectId) {
            loadProjectDetails(projectId);
            fetchAllLogs(projectId);
            loadBuildHistory();
        }
    }, [user, projectId]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        // If project is running, poll for updates
        if (project?.projectStatus === 'RUNNING') {
            interval = setInterval(async () => {
                if (projectId) {
                    await loadProjectDetails(projectId);
                    await fetchNewLogs(projectId);
                }
            }, 5000); // Poll every 5 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [project?.projectStatus, projectId]);

    const loadProjectDetails = async (id: number) => {
        setIsLoading(true);
        try {
            const response = await getProjectById(id);
            console.log(response)
            if (response && response.data) {
                setProject(response.data);
            }
        } catch (error) {
            console.error("Failed to load project details:", error);
            setSampleProject();
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all project logs initially
    const fetchAllLogs = async (id: number) => {
        try {
            const response = await loadAllProjectLogs(id);
            if (response && response.data) {
                // Sort logs by time and ID to ensure proper ordering
                const logData = Array.isArray(response.data) ? response.data : [response.data];
                const sortedLogs = logData.sort((a, b) => {
                    // First sort by time
                    const timeA = new Date(a.logTime).getTime();
                    const timeB = new Date(b.logTime).getTime();
                    if (timeA !== timeB) return timeB - timeA;

                    // If times are the same, sort by ID
                    return b.id - a.id;
                });

                setLogs(sortedLogs);

                // Update the lastLogId if we have logs
                if (sortedLogs.length > 0) {
                    setLastLogId(Math.max(...sortedLogs.map(log => log.id)));
                }
            }
        } catch (error) {
            console.error("Failed to load all project logs:", error);
            setSampleLogs();
        }
    };

    // Fetch only new logs that we don't already have
    const fetchNewLogs = async (id: number) => {
        try {
            const response = await getProjectLogs(id);
            if (response && response.data) {
                // Process the response to extract log entries
                const newLogs = Array.isArray(response.data) ? response.data : [response.data];

                // Filter out logs we already have
                if (lastLogId !== null) {
                    const filteredLogs = newLogs.filter(log => log.id > lastLogId);

                    if (filteredLogs.length > 0) {
                        // Update the state with new logs by appending them
                        setLogs(prevLogs => [...filteredLogs, ...prevLogs]);

                        // Update the lastLogId
                        const highestId = Math.max(...filteredLogs.map(log => log.id));
                        setLastLogId(highestId);
                    }
                } else if (newLogs.length > 0) {
                    // If we don't have a lastLogId yet, just add all the logs
                    setLogs(prevLogs => [...prevLogs, ...newLogs]);
                    setLastLogId(Math.max(...newLogs.map(log => log.id)));
                }
            }
        } catch (error) {
            console.error("Failed to load new project logs:", error);
        }
    };

    // const loadProjectLogs = async (id: number) => {
    //     try {
    //         const response = await getProjectLogs(id);
    //         if (response && response.data) {
    //             // Check if data is an array or a single object
    //             if (Array.isArray(response.data)) {
    //                 setLogs(response.data);
    //             } else if (response.data.id) {
    //                 // If it's a single log object, create an array with just that object
    //                 setLogs([response.data]);
    //             } else {
    //                 // If no logs or unclear format, set empty array
    //                 setLogs([]);
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Failed to load project logs:", error);
    //         setSampleLogs();
    //     }
    // };

    // const refreshBuildLogs = async () => {
    //     setRefreshingBuildLogs(true);
    //     await loadBuildHistory();  // or however you're fetching logs
    //     setRefreshingBuildLogs(false);
    // };

    const loadBuildHistory = async () => {
        const response = await getAllBuildLogs(projectId!!);
        console.log(response);
        const newLogs = Array.isArray(response.data) ? response.data : [response.data];
        const sortedLogs = newLogs.sort((a, b) => {
            // If times are the same, higher ID first
            return b.id - a.id;
        });
        console.log('sorted');
        console.log(sortedLogs);
        setBuildHistory(sortedLogs);
    };

    // const getBuildLogs =async () => {
    //     const response = await getAllBuildLogs(projectId!!);
    //     setBuildHistory( response.data || []);
    // }

    const executeProjectBuild = async () => {
        if (!projectId) return;

        setIsExecuting(true);
        try {
            const response = await executeProject(projectId);
            if (response.success) {
                // Update logs
                await fetchNewLogs(projectId);
                // Fetch latest project details to get updated status
                await loadProjectDetails(projectId);
                // Refresh build history
                await loadBuildHistory();
                setActiveTab('logs');

                // Show success toast
                toast.success('Build started successfully');
            } else {
                toast.error('Failed to start build');
            }
        } catch (error) {
            console.error("Failed to execute project:", error);
            toast.error('Failed to execute project');
        } finally {
            setIsExecuting(false);
        }
    };

    const refreshLogs = async () => {
        if (projectId) {
            await fetchAllLogs(projectId);
            toast.success('Logs refreshed');
        }
    };

    // const toggleAutoRefresh = () => {
    //     setAutoRefresh(!autoRefresh);
    // };

    const setSampleProject = () => {
        const sampleProject: Project = {
            projectId: 204,
            userId: "7a7a0300-0634-4d9a-bc9c-6ef30376c312",
            description: "A demo project to showcase CI/CD functionality",
            projectStatus: "SUCCESS",
            lastRun: "2025-05-17T14:30:45.844362",
            lastBuildTime: "1m 23s",
            projectName: "Demo Project",
            createDateTime: "2025-05-17T15:53:45.844362",
            projectConfig: {
                id: 354,
                githubUrl: "https://github.com/ankitchauhan09/demo",
                shellCommand: "npm install && npm run build && npm test",
                branch: "main",
                environmentVariables: "NODE_ENV=production\nAPI_URL=https://api.example.com"
            }
        };
        setProject(sampleProject);
    };

    const setSampleLogs = () => {
        const sampleLogs: LogEntry[] = [
            {id: 1, logTime: "2025-05-17T15:53:50.123456", log: "Build started", projectId: 206},
            {
                id: 2,
                logTime: "2025-05-17T15:53:51.234567",
                log: "Cloning repository from https://github.com/ankitchauhan09/demo",
                projectId: 206
            },
            {id: 3, logTime: "2025-05-17T15:53:52.345678", log: "Using branch: main", projectId: 206},
            {id: 4, logTime: "2025-05-17T15:53:53.456789", log: "Repository cloned successfully", projectId: 206},
            {id: 5, logTime: "2025-05-17T15:53:54.567890", log: "Installing dependencies", projectId: 206},
            {
                id: 6,
                logTime: "2025-05-17T15:54:10.678901",
                log: "npm WARN deprecated request@2.88.2: request has been deprecated, see https://github.com/request/request/issues/3142",
                projectId: 206
            },
            {id: 7, logTime: "2025-05-17T15:54:30.789012", log: "Dependencies installed successfully", projectId: 206},
            {id: 8, logTime: "2025-05-17T15:54:31.890123", log: "Running build command", projectId: 206},
            {id: 9, logTime: "2025-05-17T15:54:50.901234", log: "Build completed successfully", projectId: 206},
            {id: 10, logTime: "2025-05-17T15:54:51.012345", log: "Running tests", projectId: 206},
            {
                id: 11,
                logTime: "2025-05-17T15:55:10.123456",
                log: "Test failed: Expected value to be true but got false",
                projectId: 206
            },
            {id: 12, logTime: "2025-05-17T15:55:11.234567", log: "Tests completed with 1 failure", projectId: 206},
            {id: 13, logTime: "2025-05-17T15:55:12.345678", log: "Build pipeline completed", projectId: 206}
        ];
        setLogs(sampleLogs);
    };

    // const setSampleBuildHistory = () => {
    //     const sampleHistory: BuildHistory[] = [
    //         {
    //             id: 1,
    //             buildNumber: 15,
    //             status: "SUCCESS",
    //             startTime: "2025-05-17T14:30:45.844362",
    //             endTime: "2025-05-17T14:32:08.123456",
    //             duration: "1m 23s",
    //             triggeredBy: "User"
    //         },
    //         {
    //             id: 2,
    //             buildNumber: 14,
    //             status: "FAILED",
    //             startTime: "2025-05-17T12:15:22.844362",
    //             endTime: "2025-05-17T12:16:45.123456",
    //             duration: "1m 23s",
    //             triggeredBy: "Webhook"
    //         },
    //         {
    //             id: 3,
    //             buildNumber: 13,
    //             status: "SUCCESS",
    //             startTime: "2025-05-16T18:45:12.844362",
    //             endTime: "2025-05-16T18:46:33.123456",
    //             duration: "1m 21s",
    //             triggeredBy: "Schedule"
    //         },
    //         {
    //             id: 4,
    //             buildNumber: 12,
    //             status: "SUCCESS",
    //             startTime: "2025-05-15T09:12:33.844362",
    //             endTime: "2025-05-15T09:13:51.123456",
    //             duration: "1m 18s",
    //             triggeredBy: "User"
    //         },
    //         {
    //             id: 5,
    //             buildNumber: 11,
    //             status: "FAILED",
    //             startTime: "2025-05-14T16:22:45.844362",
    //             endTime: "2025-05-14T16:24:05.123456",
    //             duration: "1m 20s",
    //             triggeredBy: "Webhook"
    //         }
    //     ];
    //     setBuildHistory(sampleHistory);
    // };

    // Format date to readable format
    const formatDate = (dateString: string) => {
        if (!dateString || dateString === '-') return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleString();
        } catch (e) {
            return dateString;
        }
    };

    // Status icon mapping
    const statusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle className="h-5 w-5 text-green-500"/>;
            case 'RUNNING':
                return <Play className="h-5 w-5 text-blue-500"/>;
            case 'FAILURE':
                return <AlertCircle className="h-5 w-5 text-red-500"/>;
            case 'PENDING':
                return <Pause className="h-5 w-5 text-yellow-500"/>;
            default:
                return null;
        }
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return 'bg-green-500';
            case 'RUNNING':
                return 'bg-blue-500';
            case 'FAILED':
                return 'bg-red-500';
            case 'PENDING':
                return 'bg-yellow-500';
            default:
                return 'bg-gray-500';
        }
    };

    // Get log level color
    const getLogLevelColor = (level: string) => {
        switch (level) {
            case 'INFO':
                return 'text-blue-600';
            case 'ERROR':
                return 'text-red-600';
            case 'WARNING':
                return 'text-yellow-600';
            case 'DEBUG':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Head>
                <title>{project?.projectName || 'Project'} | Mini Jenkins</title>
                <meta name="description" content="Project details and logs for CI/CD pipeline"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>

            <Navbar/>

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Back button */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1"/>
                        Back to Dashboard
                    </button>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : project ? (
                    <>
                        {/* Project Header */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                            <div className={`h-2 ${getStatusColor(project.projectStatus)}`}></div>
                            <div className="p-6">
                                <div
                                    className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                    <div className="flex items-center mb-4 md:mb-0">
                                        <h1 className="text-2xl font-bold text-gray-900 mr-3">{project.projectName}</h1>
                                        <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                                            {statusIcon(project.projectStatus)}
                                            <span
                                                className="ml-2 text-sm font-medium capitalize">{project.projectStatus.toLowerCase()}</span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={executeProjectBuild}
                                            disabled={isExecuting || project.projectStatus === 'RUNNING'}
                                            className={`flex items-center ${
                                                isExecuting || project.projectStatus === 'RUNNING'
                                                    ? 'bg-gray-300 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            } text-white px-4 py-2 rounded-md transition-colors shadow-sm`}
                                        >
                                            {isExecuting ? (
                                                <>
                                                    <div
                                                        className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Running...
                                                </>
                                            ) : (
                                                <>
                                                    <Play className="h-5 w-5 mr-2"/>
                                                    Run Build
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setShowScheduleModal(true)}
                                            className="flex items-center bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors shadow-sm"
                                        >
                                            <Clock className="h-5 w-5 mr-2"/>
                                            Schedule Build
                                        </button>
                                        <button
                                            className="flex items-center bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors shadow-sm"
                                            onClick={() => router.push(`/projects/${projectId}/settings`)}
                                        >
                                            <Settings className="h-5 w-5 mr-2"/>
                                            Settings
                                        </button>
                                    </div>
                                </div>
                                <p className="text-gray-700 mt-2">{project.description}</p>

                                {/* Project Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 text-gray-500 mr-2"/>
                                        <div>
                                            <div className="text-xs text-gray-500">Last Run</div>
                                            <div className="text-sm font-medium">{formatDate(project.lastRun)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <GitBranch className="h-5 w-5 text-gray-500 mr-2"/>
                                        <div>
                                            <div className="text-xs text-gray-500">Branch</div>
                                            <div
                                                className="text-sm font-medium">{project.projectConfig?.branch || 'Not specified'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Terminal className="h-5 w-5 text-gray-500 mr-2"/>
                                        <div>
                                            <div className="text-xs text-gray-500">Duration</div>
                                            <div
                                                className="text-sm font-medium">{project.lastBuildTime || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Github className="h-5 w-5 text-gray-500 mr-2"/>
                                        <div>
                                            <div className="text-xs text-gray-500">Repository</div>
                                            <div className="text-sm font-medium truncate max-w-xs">
                                                <a
                                                    href={project.projectConfig?.githubUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    {project.projectConfig?.githubUrl.replace('https://github.com/', '')}
                                                    <ExternalLink className="h-3 w-3 ml-1"/>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
                            <div className="border-b border-gray-200">
                                <nav className="flex -mb-px">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                            activeTab === 'overview'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Overview
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('logs')}
                                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                            activeTab === 'logs'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Logs
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                            activeTab === 'history'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Build History
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('config')}
                                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                            activeTab === 'config'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Configuration
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('pipeline')}
                                        className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                                            activeTab === 'pipeline'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Pipeline
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Project Summary */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Project
                                                    Summary</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-gray-600 font-medium">Name:</span>
                                                        <span className="ml-2">{project.projectName}</span>
                                                    </div>
                                                    <div>
                                                            <span
                                                                className="text-gray-600 font-medium">Description:</span>
                                                        <span className="ml-2">{project.description}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 font-medium">Status:</span>
                                                        <span className="ml-2 flex items-center">
                                                            {statusIcon(project.projectStatus)}
                                                            <span
                                                                className="ml-1 capitalize">{project.projectStatus.toLowerCase()}</span>
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 font-medium">Created:</span>
                                                        <span
                                                            className="ml-2">{formatDate(project.createDateTime)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 font-medium">Last Run:</span>
                                                        <span className="ml-2">{formatDate(project.lastRun)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 font-medium">Duration:</span>
                                                        <span
                                                            className="ml-2">{project.lastBuildTime || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Repository Information */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository
                                                    Information</h3>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span
                                                            className="text-gray-600 font-medium">Repository URL:</span>
                                                        <a
                                                            href={project.projectConfig?.githubUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="ml-2 text-blue-600 hover:text-blue-800 flex items-center"
                                                        >
                                                            {project.projectConfig?.githubUrl}
                                                            <ExternalLink className="h-3 w-3 ml-1"/>
                                                        </a>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600 font-medium">Branch:</span>
                                                        <span
                                                            className="ml-2">{project.projectConfig?.branch || 'Not specified'}</span>
                                                    </div>
                                                    <div>
                                                        <span
                                                            className="text-gray-600 font-medium">Shell Command:</span>
                                                        <div
                                                            className="mt-1 p-2 bg-gray-800 text-white rounded text-sm font-mono overflow-x-auto">
                                                            {project.projectConfig?.shellCommand || 'Not specified'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Latest Build Info */}
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest
                                                Build</h3>
                                            {buildHistory.length > 0 && (
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center mb-2">
                                                        <div className={`w-8 h-8 rounded-full ${
                                                            buildHistory[0].status === 'SUCCESS' ? 'bg-green-100' :
                                                                buildHistory[0].status === 'FAILURE' ? 'bg-red-100' :
                                                                    'bg-yellow-100'
                                                        } flex items-center justify-center mr-3`}>
                                                            {statusIcon(buildHistory[0].status)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">Build
                                                                #{buildHistory[0].id}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                {formatDate(buildHistory[0].timestamp)} • {buildHistory[0].executionTime}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4">
                                                        <button
                                                            onClick={() => setActiveTab('logs')}
                                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                                        >
                                                            <Terminal className="h-4 w-4 mr-1"/>
                                                            View Logs
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Logs Tab */}
                                {activeTab === 'logs' && (
                                    <div>
                                        <div className="flex justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Build Logs</h3>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={refreshLogs}
                                                    className="flex items-center bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-md text-sm"
                                                >
                                                    <RefreshCw className="h-4 w-4 mr-1"/>
                                                    Refresh
                                                </button>
                                                <button
                                                    className="flex items-center bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-md text-sm"
                                                >
                                                    <Download className="h-4 w-4 mr-1"/>
                                                    Download
                                                </button>
                                                <button
                                                    className="flex items-center bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-md text-sm"
                                                    onClick={clearLogs} // Clear logs
                                                >
                                                    <Trash className="h-4 w-4 mr-1"/>
                                                    Clear Logs
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-gray-800 text-white rounded-lg p-4 overflow-x-auto">
                                            <div className="font-mono text-sm">
                                                {logs.length > 0 ? (
                                                    logs.map(log => (
                                                        <div key={log.id} className="mb-1 flex">
                                                            <span
                                                                className="text-gray-400 inline-block w-48 flex-shrink-0">
                                                                {new Date(log.logTime).toLocaleTimeString()}
                                                            </span>
                                                            <span>{log.log}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-gray-400">No logs available</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Build History Tab */}
                                {activeTab === 'history' && (
                                    <div>
                                        <div className="mb-4 flex justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Build
                                                History</h3>
                                            <button
                                                onClick={loadBuildHistory}
                                                className="flex items-center bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1 rounded-md text-sm"
                                            >
                                                <RefreshCw className="h-4 w-4 mr-1"/>
                                                Refresh
                                            </button>

                                        </div>
                                        <div
                                            className="bg-white shadow overflow-hidden border border-gray-200 sm:rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Build ID
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Timestamp
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Duration
                                                    </th>
                                                    <th scope="col"
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Triggered By
                                                    </th>
                                                </tr>
                                                </thead>

                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {buildHistory.map((build) => (
                                                    <tr key={build.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div
                                                                className="text-sm font-medium text-gray-900">#{build.id}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                {statusIcon(build.status)}
                                                                <span
                                                                    className="ml-2 text-sm text-gray-700 capitalize">{build.status.toLowerCase()}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div
                                                                className="text-sm text-gray-700">{formatDate(build.timestamp)}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div
                                                                className="text-sm text-gray-700">{build.executionTime}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div
                                                                className="text-sm text-gray-700">User
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'pipeline' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Pipeline
                                                Configuration</h3>
                                            {!isPipelineEditMode && (
                                                <button
                                                    onClick={handlePipelineEditMode}
                                                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                                >
                                                    <Settings className="h-4 w-4 mr-2"/>
                                                    Edit Pipeline
                                                </button>
                                            )}
                                        </div>

                                        {project?.pipelineConfig && !isPipelineEditMode ? (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">Pipeline
                                                        Information</h4>
                                                    <div className="text-sm">
                                                        <p className="font-medium">Name: {project.pipelineConfig.name}</p>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">Pipeline Stages</h4>
                                                    <div className="space-y-4">
                                                        {project.pipelineConfig.stages.map((stage, index) => (
                                                            <div key={index}
                                                                 className="border border-gray-200 rounded-lg p-4">
                                                                <h5 className="font-medium mb-2">Stage {index + 1}: {stage.name}</h5>
                                                                <pre
                                                                    className="bg-gray-800 text-white p-3 rounded-md text-sm overflow-x-auto">
                                    {stage.command}
                                </pre>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : isPipelineEditMode ? (
                                            <div className="space-y-6">
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <h4 className="font-medium text-gray-900 mb-3">Pipeline
                                                        Information</h4>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label
                                                                className="block text-sm font-medium text-gray-700 mb-1">
                                                                Pipeline Name
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={pipelineForm.pipelineRequest.name}
                                                                onChange={(e) => setPipelineForm({
                                                                    ...pipelineForm,
                                                                    pipelineRequest: {
                                                                        ...pipelineForm.pipelineRequest,
                                                                        name: e.target.value
                                                                    }
                                                                })}
                                                                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-medium text-gray-900">Pipeline Stages</h4>
                                                        <button
                                                            onClick={() => setPipelineForm({
                                                                ...pipelineForm,
                                                                pipelineRequest: {
                                                                    ...pipelineForm.pipelineRequest,
                                                                    stages: [...pipelineForm.pipelineRequest.stages, {
                                                                        name: '',
                                                                        command: ''
                                                                    }]
                                                                }
                                                            })}
                                                            className="text-blue-600 hover:text-blue-700"
                                                        >
                                                            + Add Stage
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {pipelineForm.pipelineRequest.stages.map((stage, index) => (
                                                            <div key={index}
                                                                 className="border border-gray-200 rounded-lg p-4">
                                                                <div className="flex justify-between items-center mb-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Stage Name"
                                                                        value={stage.name}
                                                                        onChange={(e) => {
                                                                            const newStages = [...pipelineForm.pipelineRequest.stages];
                                                                            newStages[index] = {
                                                                                ...stage,
                                                                                name: e.target.value
                                                                            };
                                                                            setPipelineForm({
                                                                                ...pipelineForm,
                                                                                pipelineRequest: {
                                                                                    ...pipelineForm.pipelineRequest,
                                                                                    stages: newStages
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm"
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            const newStages = pipelineForm.pipelineRequest.stages.filter((_, i) => i !== index);
                                                                            setPipelineForm({
                                                                                ...pipelineForm,
                                                                                pipelineRequest: {
                                                                                    ...pipelineForm.pipelineRequest,
                                                                                    stages: newStages
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                                <textarea
                                                                    placeholder="Stage Command"
                                                                    value={stage.command}
                                                                    onChange={(e) => {
                                                                        const newStages = [...pipelineForm.pipelineRequest.stages];
                                                                        newStages[index] = {
                                                                            ...stage,
                                                                            command: e.target.value
                                                                        };
                                                                        setPipelineForm({
                                                                            ...pipelineForm,
                                                                            pipelineRequest: {
                                                                                ...pipelineForm.pipelineRequest,
                                                                                stages: newStages
                                                                            }
                                                                        });
                                                                    }}
                                                                    rows={3}
                                                                    className="w-full mt-2 rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm font-mono"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => setIsPipelineEditMode(false)}
                                                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handlePipelineSubmit}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                                    >
                                                        Save Pipeline
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 rounded-lg p-6 text-center">
                                                <Terminal className="h-12 w-12 mx-auto text-gray-400 mb-4"/>
                                                <h4 className="font-medium text-gray-900 mb-2">No Pipeline
                                                    Configured</h4>
                                                <p className="text-gray-600 mb-4">
                                                    This project doesn't have a pipeline configuration yet.
                                                </p>
                                                <button
                                                    onClick={() => setIsPipelineEditMode(true)}
                                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                                >
                                                    Configure Pipeline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Configuration Tab */}
                                {activeTab === 'config' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Project
                                                Configuration</h3>
                                            {!isEditMode && (
                                                <button
                                                    onClick={startEditing}
                                                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                                                >
                                                    <Settings className="h-4 w-4 mr-2"/>
                                                    Edit Configuration
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-6">
                                            {/* Repository Configuration */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-3">Repository Settings</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Repository URL {formErrors.githubUrl && <span
                                                            className="text-red-500 ml-1">{formErrors.githubUrl}</span>}
                                                        </label>
                                                        {isEditMode ? (
                                                            <input
                                                                type="text"
                                                                name="githubUrl"
                                                                value={configForm.githubUrl}
                                                                onChange={handleFormChange}
                                                                placeholder="https://github.com/username/repository"
                                                                className={`w-full rounded-md border ${formErrors.githubUrl ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <input
                                                                    type="text"
                                                                    value={project?.projectConfig?.githubUrl || ''}
                                                                    readOnly
                                                                    className="flex-grow bg-white rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm"
                                                                />
                                                                <a
                                                                    href={project?.projectConfig?.githubUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="ml-2 bg-gray-100 p-2 rounded-md hover:bg-gray-200 transition-colors"
                                                                >
                                                                    <ExternalLink className="h-5 w-5 text-gray-600"/>
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Branch {formErrors.branch && <span
                                                            className="text-red-500 ml-1">{formErrors.branch}</span>}
                                                        </label>
                                                        {isEditMode ? (
                                                            <input
                                                                type="text"
                                                                name="branch"
                                                                value={configForm.branch}
                                                                onChange={handleFormChange}
                                                                placeholder="main"
                                                                className={`w-full rounded-md border ${formErrors.branch ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                                                            />
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={project?.projectConfig?.branch || ''}
                                                                disabled={true}
                                                                className="w-full bg-white rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Build Configuration */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-3">Build Settings</h4>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Build Command {formErrors.shellCommand && <span
                                                            className="text-red-500 ml-1">{formErrors.shellCommand}</span>}
                                                        </label>
                                                        {isEditMode ? (
                                                            <textarea
                                                                name="shellCommand"
                                                                value={configForm.shellCommand}
                                                                onChange={handleFormChange}
                                                                placeholder="npm install && npm run build"
                                                                rows={3}
                                                                className={`w-full rounded-md border ${formErrors.shellCommand ? 'border-red-300' : 'border-gray-300'} shadow-sm px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono`}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="bg-gray-800 text-white rounded-md p-3 font-mono text-sm overflow-x-auto">
                                                                {project?.projectConfig?.shellCommand || 'No command specified'}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Environment Variables */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h4 className="font-medium text-gray-900 mb-3">Environment
                                                    Variables</h4>
                                                <p className="text-sm text-gray-500 mb-2">Enter one variable per line in
                                                    KEY=VALUE format</p>
                                                {isEditMode ? (
                                                    <textarea
                                                        name="environmentVariables"
                                                        value={configForm.environmentVariables}
                                                        onChange={handleFormChange}
                                                        placeholder="NODE_ENV=production&#10;API_URL=https://api.example.com"
                                                        rows={5}
                                                        className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                                                    />
                                                ) : (
                                                    project?.projectConfig?.environmentVariables ? (
                                                        <div
                                                            className="bg-gray-800 text-white rounded-md p-3 font-mono text-sm overflow-x-auto whitespace-pre">
                                                            {project.projectConfig.environmentVariables}
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-500">No environment variables
                                                            set</div>
                                                    )
                                                )}
                                            </div>

                                            {/* Configuration Actions */}
                                            {isEditMode && (
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() => setIsEditMode(false)}
                                                        disabled={isSaving}
                                                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleUpdateConfig}
                                                        disabled={isSaving}
                                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex items-center"
                                                    >
                                                        {isSaving && <div
                                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                                                        {isSaving ? 'Saving...' : 'Save Configuration'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Environment Details */}
                        <div className="mt-6">
                            <details className="bg-white rounded-xl shadow-md overflow-hidden">
                                <summary className="px-6 py-4 flex items-center justify-between cursor-pointer">
                                    <h3 className="text-lg font-semibold text-gray-900">Environment Details</h3>
                                    <div className="text-blue-600">
                                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg"
                                             viewBox="0 0 20 20"
                                             fill="currentColor">
                                            <path fillRule="evenodd"
                                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                  clipRule="evenodd"/>
                                        </svg>
                                    </div>
                                </summary>
                                <div className="p-6 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">System
                                                Information</h4>
                                            <div className="bg-gray-50 rounded-md p-3">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="text-gray-600">OS:</div>
                                                    <div>Ubuntu 22.04 LTS</div>
                                                    <div className="text-gray-600">CPU:</div>
                                                    <div>4 cores</div>
                                                    <div className="text-gray-600">Memory:</div>
                                                    <div>8 GB</div>
                                                    <div className="text-gray-600">Docker:</div>
                                                    <div>v24.0.2</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Worker Node</h4>
                                            <div className="bg-gray-50 rounded-md p-3">
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div className="text-gray-600">Node ID:</div>
                                                    <div>worker-node-03</div>
                                                    <div className="text-gray-600">Status:</div>
                                                    <div className="flex items-center">
                                                            <span
                                                                className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                                        Active
                                                    </div>
                                                    <div className="text-gray-600">IP Address:</div>
                                                    <div>10.0.1.45</div>
                                                    <div className="text-gray-600">Queue:</div>
                                                    <div>2 pending jobs</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="text-gray-500 mb-4">Project not found</div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
                {showScheduleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                            <h3 className="text-lg font-semibold mb-4">Schedule Project Execution</h3>
                            <label className="block text-sm font-medium mb-2">
                                Select Date & Time
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full border border-gray-300 rounded px-3 py-2 mb-4"
                                value={scheduleDateTime}
                                onChange={e => setScheduleDateTime(e.target.value)}
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        setShowScheduleModal(false);
                                        // Call your scheduling handler here, e.g. handleScheduleBuild()
                                        handleScheduleBuild()
                                    }}
                                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                    disabled={!scheduleDateTime}
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>


            <footer className="bg-gray-800 text-white py-8 mt-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <div className="flex items-center">
                                <div className="bg-blue-600 text-white p-2 rounded-md mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                    </svg>
                                </div>
                                <span className="text-lg font-semibold text-white">Mini Jenkins</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-300">Modern continuous integration and deployment</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <p className="text-sm text-gray-300">&copy; 2025 All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </footer>


        </div>
    );
};

export default ProjectDetails;