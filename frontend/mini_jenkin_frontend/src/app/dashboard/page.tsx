// pages/dashboard.tsx
"use client";
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import {
    AlertCircle,
    CheckCircle,
    Clock,
    GitBranch,
    Grid,
    List,
    Package,
    Pause,
    Play,
    PlusCircle,
    Search,
    Settings,
    Terminal
} from 'lucide-react';
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import {executeProject, getAllProjects} from "@/app/services/PipelineService";

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
}

const Dashboard: React.FC = () => {
    const { user } = useUser();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Check if the user is logged in
    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else {
            loadAllProjects();
        }
    }, [user]);

    const loadAllProjects = async () => {
        setIsLoading(true);
        try {
            const response = await getAllProjects(user?.id);
            if (response && response.data) {
                console.log("Projects loaded:", response.data);
                setProjects(response.data);
            }
        } catch (error) {
            console.error("Failed to load projects:", error);
            // Set sample project for demonstration
            setSampleProject();
        } finally {
            setIsLoading(false);
        }
    };

    const execute = async (projectId : number) => {
        try {
            const response = await executeProject(projectId)
            loadAllProjects()
            console.log(response)
        } catch (error) {
            console.error("Failed to execute project:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const setSampleProject = () => {
        // Using the exact format provided
        const sampleProject: Project = {
            projectId: 204,
            userId: "7a7a0300-0634-4d9a-bc9c-6ef30376c312",
            description: "asdf",
            projectStatus: "PENDING",
            lastRun: "-",
            lastBuildTime: "",
            projectName: "fdas",
            createDateTime: "2025-05-17T15:53:45.844362",
            projectConfig: {
                id: 354,
                githubUrl: "https://github.com/ankitchauhan09/demo",
                shellCommand: "type ankit.txt",
                branch: "main",
                environmentVariables: ""
            }
        };
        setProjects([sampleProject]);
    };

    // Stats
    const stats = [
        {
            name: 'Total Projects',
            value: projects.length.toString(),
            icon: <Terminal className="h-6 w-6" />
        },
        {
            name: 'Successful Builds',
            value: projects.length > 0
                ? `${Math.round((projects.filter(p => p.projectStatus === 'SUCCESS').length / projects.length) * 100)}%`
                : '0%',
            icon: <CheckCircle className="h-6 w-6" />
        },
        {
            name: 'Active Workers',
            value: '3',
            icon: <Package className="h-6 w-6" />
        },
        {
            name: 'Branches Monitored',
            value: projects.length > 0
                ? [...new Set(projects.filter(p => p.projectConfig && p.projectConfig.branch)
                    .map(p => p.projectConfig.branch))].length.toString()
                : '0',
            icon: <GitBranch className="h-6 w-6" />
        }
    ];

    // View state (grid or list)
    const [viewMode, setViewMode] = useState('grid');

    // Status icon mapping
    const statusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'RUNNING':
                return <Play className="h-5 w-5 text-blue-500" />;
            case 'FAILED':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'PENDING':
                return <Pause className="h-5 w-5 text-yellow-500" />;
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

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Head>
                <title>Dashboard | Mini Jenkins</title>
                <meta name="description" content="Dashboard for monitoring CI/CD pipelines" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
                        <p className="text-gray-700 mt-1">Monitor and manage your CI/CD projects</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <button
                            onClick={() => router.push('/new-pipeline')}
                            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                            <PlusCircle className="h-5 w-5 mr-2" />
                            New Project
                        </button>
                        <button
                            className="flex items-center bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors shadow-sm">
                            <Settings className="h-5 w-5 mr-2" />
                            Settings
                        </button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index}
                             className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300">
                            <div className="flex items-center">
                                <div
                                    className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                                    <div className="text-blue-600">
                                        {stat.icon}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Project List Header */}
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Active Projects</h2>
                        <div
                            className="flex flex-col sm:flex-row w-full md:w-auto space-y-4 sm:space-y-0 space-x-0 sm:space-x-4">
                            <div className="relative flex-grow md:w-64">
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <div className="absolute left-3 top-2.5 text-gray-400">
                                    <Search className="h-5 w-5" />
                                </div>
                            </div>
                            <div className="flex border border-gray-300 rounded-md overflow-hidden">
                                <button
                                    className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-5 w-5" />
                                </button>
                                <button
                                    className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {/* Projects Grid/List View */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {projects.map((project) => (
                                    <div key={project.projectId}
                                         className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                                        <div className={`h-2 ${getStatusColor(project.projectStatus)}`}></div>
                                        <div className="p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">{project.projectName}</h3>
                                                {statusIcon(project.projectStatus)}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center text-gray-600">
                                                    <Clock className="h-4 w-4 mr-2" />
                                                    <span>Last Run: {project.lastRun}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <GitBranch className="h-4 w-4 mr-2" />
                                                    <span>{project.projectConfig?.branch || 'No branch specified'}</span>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Terminal className="h-4 w-4 mr-2" />
                                                    <span>Duration: {project.lastBuildTime || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 flex space-x-2">
                                                <button
                                                    onClick={() => router.push(`/projects/${project.projectId}`)}
                                                    className="flex-1 bg-blue-600 text-white px-3 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors">
                                                    View Details
                                                </button>
                                                <button
                                                    onClick={() => execute(project!!.projectId)}
                                                    className="bg-gray-100 text-gray-700 p-2 rounded-md hover:bg-gray-200 transition-colors">
                                                    <Play className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {/* Add New Project Card */}
                                <div
                                    className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-500 hover:shadow-lg transition-all duration-300 flex items-center justify-center p-6"
                                    onClick={() => router.push('/new-pipeline')}>
                                    <div className="text-center">
                                        <div
                                            className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                            <PlusCircle className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Project</h3>
                                        <p className="text-gray-600 text-sm">Set up a new CI/CD project</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last
                                            Run
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration
                                        </th>
                                        <th scope="col"
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {projects.map((project) => (
                                        <tr key={project.projectId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                                                <div className="text-xs text-gray-500">{project.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {statusIcon(project.projectStatus)}
                                                    <span
                                                        className="ml-2 text-sm text-gray-700 capitalize">{project.projectStatus.toLowerCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{project.projectConfig?.branch || 'No branch specified'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{project.lastRun}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-700">{project.lastBuildTime || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        className="bg-blue-100 text-blue-600 p-1.5 rounded-md hover:bg-blue-200 transition-colors">
                                                        <Play className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        className="bg-gray-100 text-gray-600 p-1.5 rounded-md hover:bg-gray-200 transition-colors">
                                                        <Settings className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}

                {/* Recent Activity Section */}
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        {projects.length > 0 ? (
                            <div className="p-6 space-y-4">
                                {projects.map((project) => (
                                    <div key={project.projectId} className="flex items-start">
                                        <div
                                            className={`w-10 h-10 rounded-full ${
                                                project.projectStatus === 'SUCCESS' ? 'bg-green-100' :
                                                    project.projectStatus === 'RUNNING' ? 'bg-blue-100' :
                                                        project.projectStatus === 'FAILED' ? 'bg-red-100' :
                                                            'bg-yellow-100'
                                            } flex items-center justify-center mr-3`}>
                                            {statusIcon(project.projectStatus)}
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-900">
                                                <span className="font-semibold">{project.projectName}</span> {' '}
                                                {project.projectStatus === 'SUCCESS' ? 'completed successfully' :
                                                    project.projectStatus === 'RUNNING' ? 'started running' :
                                                        project.projectStatus === 'FAILED' ? 'failed' :
                                                            'pending'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">{formatDate(project.createDateTime)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                No recent activity to display
                            </div>
                        )}
                        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all
                                activity</a>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-blue-600 rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 text-white">
                        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <button
                                onClick={() => router.push('/new-pipeline')}
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg text-center transition-colors">
                                <PlusCircle className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm">New Project</span>
                            </button>
                            <button
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg text-center transition-colors">
                                <Settings className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm">Configure</span>
                            </button>
                            <button
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg text-center transition-colors">
                                <Terminal className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm">Logs</span>
                            </button>
                            <button
                                className="bg-white bg-opacity-20 hover:bg-opacity-30 p-4 rounded-lg text-center transition-colors">
                                <Package className="h-6 w-6 mx-auto mb-2" />
                                <span className="text-sm">Workers</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <div className="flex items-center">
                                <div className="bg-blue-600 text-white p-2 rounded-md mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                                         viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M13 10V3L4 14h7v7l9-11h-7z" />
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

export default Dashboard;