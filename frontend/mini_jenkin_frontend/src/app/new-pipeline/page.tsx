"use client";
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { ArrowLeft, FileText, GitBranch, Github, Play, Save, Terminal, Variable } from 'lucide-react';
import { checkGithubUrl, createNewProject } from "@/app/services/PipelineService";

// Project interfaces
interface PipelineStage {
    name: string;
    command: string;
}
type ProjectStatus = 'PENDING' | 'ACTIVE' | 'FAILED' | 'COMPLETED';

interface PipelineRequest {
    name: string;
    stages: PipelineStage[];
}

interface PipelineConfig {
    pipelineRequest: PipelineRequest;
}

interface ProjectConfig {
    id?: number;
    githubUrl: string;
    shellCommand: string;
    branch: string;
    environmentVariables: string;
    project?: Project;
}

interface Project {
    projectId?: number;
    userId?: string;
    description: string;
    projectStatus?: ProjectStatus;
    lastRun?: string;
    lastBuildTime?: string;
    projectName: string;
    createDateTime?: string;
    projectConfig?: ProjectConfig;
    pipelineConfig?: PipelineConfig;
}
interface ProjectForm {
    projectName: string;
    description: string;
    projectConfig: ProjectConfig;
    pipelineConfig: PipelineConfig;
}

const NewProject: React.FC = () => {
    const { user } = useUser();
    const router = useRouter();

    const [formState, setFormState] = useState<ProjectForm>({
        projectName: '',
        description: '',
        projectConfig: {
            githubUrl: '',
            shellCommand: '',
            branch: 'main',
            environmentVariables: ''
        },
        pipelineConfig: {
            pipelineRequest: {
                name: '',
                stages: [{ name: '', command: '' }]
            }
        }
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Handle array paths (e.g., pipelineConfig.pipelineRequest.stages[0].name)
        if (name.includes('[') && name.includes(']')) {
            const arrayPathRegex = /^(.+)\[(\d+)\]\.(.+)$/;
            const match = name.match(arrayPathRegex);

            if (match) {
                const [, parentPath, indexStr, property] = match;
                const index = parseInt(indexStr, 10);

                setFormState(prev => {
                    const parent = getNestedValue(prev, parentPath);
                    if (Array.isArray(parent)) {
                        const newArray = [...parent];
                        if (index < newArray.length) {
                            newArray[index] = {
                                ...newArray[index],
                                [property]: value
                            };
                            return setNestedValue(prev, parentPath, newArray);
                        }
                    }
                    return prev;
                });
                return;
            }
        }

        // Handle dot notation paths
        if (name.includes('.')) {
            const keys = name.split('.');
            setFormState(prev => {
                const newState = { ...prev };
                let current: any = newState;

                for (let i = 0; i < keys.length - 1; i++) {
                    const key = keys[i];
                    if (!current[key]) {
                        current[key] = {};
                    }
                    current = current[key];
                }

                current[keys[keys.length - 1]] = value;
                return newState;
            });
        } else {
            setFormState(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Helper functions for nested state updates
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, key) => {
            return acc && acc[key];
        }, obj);
    };

    const setNestedValue = (obj: any, path: string, value: any) => {
        const keys = path.split('.');
        const newObj = { ...obj };
        let current: any = newObj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key]) {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
        return newObj;
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formState.projectName.trim()) {
            newErrors.projectName = 'Project name is required';
        }

        if (!formState.projectConfig.shellCommand.trim()) {
            newErrors['projectConfig.shellCommand'] = 'Build command is required';
        }

        if (formState.projectConfig.githubUrl && !formState.projectConfig.githubUrl.includes('github.com')) {
            newErrors['projectConfig.githubUrl'] = 'Please enter a valid GitHub URL';
        }

        // Validate pipeline stages
        formState.pipelineConfig.pipelineRequest.stages.forEach((stage, index) => {
            if (!stage.name.trim()) {
                newErrors[`pipelineStageName-${index}`] = `Stage ${index + 1} name is required`;
            }
            if (!stage.command.trim()) {
                newErrors[`pipelineStageCommand-${index}`] = `Stage ${index + 1} command is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const testConnection = async () => {
        if (!formState.projectConfig.githubUrl) {
            setErrors(prev => ({
                ...prev,
                'projectConfig.githubUrl': 'Please enter a GitHub URL to test'
            }));
            return;
        }

        try {
            const response = await checkGithubUrl(formState.projectConfig.githubUrl);
            if (!response.success) {
                setErrors(prev => ({
                    ...prev,
                    'projectConfig.githubUrl': response.detail.includes("private")
                        ? "This is a private repository. Please provide a public repository"
                        : response.detail || response.message || "Invalid GitHub URL"
                }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors['projectConfig.githubUrl'];
                    return newErrors;
                });
                alert('GitHub repository is valid and accessible!');
            }
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                'projectConfig.githubUrl': 'Failed to verify repository URL'
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);

        try {
            const project: Project = {
                projectName: formState.projectName,
                description: formState.description,
                userId: user?.id,
                projectStatus: 'PENDING',
                lastRun: 'Never',
                projectConfig: {
                    githubUrl: formState.projectConfig.githubUrl,
                    shellCommand: formState.projectConfig.shellCommand,
                    branch: formState.projectConfig.branch,
                    environmentVariables: formState.projectConfig.environmentVariables
                },
                pipelineConfig: formState.pipelineConfig
            };

            const response = await createNewProject(project);
            if (!response.success) {
                throw new Error(response.message + " = [" + response.detail + "]");
            }
            setSubmitSuccess(true);
            setTimeout(() => router.push('/dashboard'), 3000);
        } catch (error) {
            console.error('Failed to create project:', error);
            setErrors({ submit: error instanceof Error ? error.message : 'Failed to create project. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const addPipelineStage = () => {
        setFormState(prev => ({
            ...prev,
            pipelineConfig: {
                ...prev.pipelineConfig,
                pipelineRequest: {
                    ...prev.pipelineConfig.pipelineRequest,
                    stages: [
                        ...prev.pipelineConfig.pipelineRequest.stages,
                        { name: '', command: '' }
                    ]
                }
            }
        }));
    };

    const removePipelineStage = (index: number) => {
        setFormState(prev => ({
            ...prev,
            pipelineConfig: {
                ...prev.pipelineConfig,
                pipelineRequest: {
                    ...prev.pipelineConfig.pipelineRequest,
                    stages: prev.pipelineConfig.pipelineRequest.stages.filter((_, i) => i !== index)
                }
            }
        }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Head>
                <title>New Project | Mini Jenkins</title>
                <meta name="description" content="Create a new CI/CD project" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="mr-4 p-2 rounded-full hover:bg-gray-200 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
                        <p className="text-gray-700 mt-1">Set up a new CI/CD pipeline</p>
                    </div>
                </div>

                {submitSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Save className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-bold text-green-800 mb-2">Project Created Successfully!</h2>
                        <p className="text-green-700">Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
                        <div className="space-y-8">
                            {/* Basic Information Section */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Name*
                                        </label>
                                        <input
                                            type="text"
                                            name="projectName"
                                            value={formState.projectName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.projectName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="Enter project name"
                                        />
                                        {errors.projectName && (
                                            <p className="mt-1 text-sm text-red-600">{errors.projectName}</p>
                                        )}
                                    </div>

                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formState.description}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe your project"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Repository Configuration */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Repository
                                    Configuration</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            GitHub Repository URL (Optional)
                                        </label>
                                        <div className="flex">
                                            <div className="relative flex-grow">
                                                <div
                                                    className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Github className="h-5 w-5 text-gray-400"/>
                                                </div>
                                                <input
                                                    type="text"
                                                    name="projectConfig.githubUrl"
                                                    value={formState.projectConfig.githubUrl}
                                                    onChange={handleInputChange}
                                                    className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                        errors['projectConfig.githubUrl'] ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                    placeholder="https://github.com/username/repository"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={testConnection}
                                                className="ml-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                            >
                                                Test
                                            </button>
                                        </div>
                                        {errors['projectConfig.githubUrl'] && (
                                            <p className="mt-1 text-sm text-red-600">{errors['projectConfig.githubUrl']}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Branch
                                        </label>
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <GitBranch className="h-5 w-5 text-gray-400"/>
                                            </div>
                                            <input
                                                type="text"
                                                name="projectConfig.branch"
                                                value={formState.projectConfig.branch}
                                                onChange={handleInputChange}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="main"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Build Configuration */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Build
                                    Configuration</h2>
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Build Command*
                                        </label>
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Terminal className="h-5 w-5 text-gray-400"/>
                                            </div>
                                            <input
                                                type="text"
                                                name="projectConfig.shellCommand"
                                                value={formState.projectConfig.shellCommand}
                                                onChange={handleInputChange}
                                                className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors['projectConfig.shellCommand'] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="npm install && npm run build"
                                            />
                                        </div>
                                        {errors['projectConfig.shellCommand'] && (
                                            <p className="mt-1 text-sm text-red-600">{errors['projectConfig.shellCommand']}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Environment Variables (Optional)
                                        </label>
                                        <div className="relative">
                                            <div
                                                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Variable className="h-5 w-5 text-gray-400"/>
                                            </div>
                                            <textarea
                                                name="projectConfig.environmentVariables"
                                                value={formState.projectConfig.environmentVariables}
                                                onChange={handleInputChange}
                                                rows={3}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="NODE_ENV=production
API_URL=https://api.example.com"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Enter each variable on a new line in KEY=VALUE format
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pipeline Configuration */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pipeline Configuration</h2>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pipeline Name
                                    </label>
                                    <input
                                        type="text"
                                        name="pipelineConfig.pipelineRequest.name"
                                        value={formState.pipelineConfig.pipelineRequest.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter pipeline name"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Stages*</h3>
                                    {formState.pipelineConfig.pipelineRequest.stages.map((stage, index) => (
                                        <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <h4 className="font-medium text-gray-700">Stage {index + 1}</h4>
                                                <button
                                                    type="button"
                                                    onClick={() => removePipelineStage(index)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                    disabled={formState.pipelineConfig.pipelineRequest.stages.length <= 1}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Stage Name*
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name={`pipelineConfig.pipelineRequest.stages[${index}].name`}
                                                        value={stage.name}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            errors[`pipelineStageName-${index}`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                        placeholder="Enter stage name"
                                                    />
                                                    {errors[`pipelineStageName-${index}`] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors[`pipelineStageName-${index}`]}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Command*
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name={`pipelineConfig.pipelineRequest.stages[${index}].command`}
                                                        value={stage.command}
                                                        onChange={handleInputChange}
                                                        className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                            errors[`pipelineStageCommand-${index}`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                        placeholder="Enter command"
                                                    />
                                                    {errors[`pipelineStageCommand-${index}`] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors[`pipelineStageCommand-${index}`]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addPipelineStage}
                                        className="flex items-center text-blue-600 hover:text-blue-800 mt-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Add Stage
                                    </button>
                                </div>
                            </div>

                            {/* Additional Settings Section */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional
                                    Settings</h2>
                                <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
                                    <div className="flex">
                                        <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5"/>
                                        <div>
                                            <p className="text-sm text-blue-700">
                                                Advanced settings will be available after creating the project.
                                                You'll be able to configure:
                                            </p>
                                            <ul className="list-disc list-inside mt-2 text-sm text-blue-600 space-y-1">
                                                <li>Build triggers and scheduling</li>
                                                <li>Notifications and alerts</li>
                                                <li>Post-build actions</li>
                                                <li>Workspace configuration</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errors.submit && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-sm text-red-600">{errors.submit}</p>
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                             xmlns="http://www.w3.org/2000/svg" fill="none"
                                             viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10"
                                                    stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor"
                                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-5 w-5 mr-2"/>
                                        Create Project
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
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

export default NewProject;