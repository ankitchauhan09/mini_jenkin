// pages/settings.tsx
"use client";
import React, { useState } from 'react';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import { Settings, User, Shield, Bell, Key, Server, GitBranch, Terminal, Play, Pause } from 'lucide-react';

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [notifications, setNotifications] = useState({
        email: true,
        slack: false,
        webhook: true
    });
    const [security, setSecurity] = useState({
        twoFactor: false,
        sessionTimeout: 30
    });

    const tabs = [
        { id: 'general', name: 'General', icon: <Settings className="h-5 w-5" /> },
        { id: 'profile', name: 'Profile', icon: <User className="h-5 w-5" /> },
        { id: 'notifications', name: 'Notifications', icon: <Bell className="h-5 w-5" /> },
        { id: 'security', name: 'Security', icon: <Shield className="h-5 w-5" /> },
        { id: 'integrations', name: 'Integrations', icon: <GitBranch className="h-5 w-5" /> },
        { id: 'advanced', name: 'Advanced', icon: <Terminal className="h-5 w-5" /> }
    ];

    const handleNotificationChange = (key: keyof typeof notifications) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSecurityChange = (key: keyof typeof security, value: any) => {
        setSecurity(prev => ({
            ...prev,
            [key]: value
        }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Head>
                <title>Settings | CI/CD by Ankit Chauhan</title>
                <meta name="description" content="Settings for CI/CD pipelines" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar />

            <main className="flex-grow container mx-auto px-4 py-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-700 mt-1">Configure your CI/CD environment</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                            Save Changes
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Configuration</h2>
                            </div>
                            <nav className="p-2">
                                <ul className="space-y-1">
                                    {tabs.map(tab => (
                                        <li key={tab.id}>
                                            <button
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`w-full flex items-center px-4 py-3 rounded-md text-left ${activeTab === tab.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <span className="mr-3">{tab.icon}</span>
                                                <span>{tab.name}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>

                        {/* System Status */}
                        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-6">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-600">CI/CD Service</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Running
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-gray-600">Database</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Workers</span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        3 Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow">
                        {activeTab === 'general' && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="instance-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Instance Name
                                            </label>
                                            <input
                                                type="text"
                                                id="instance-name"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                defaultValue="CI/CD by Ankit Chauhan"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Timezone
                                            </label>
                                            <select
                                                id="timezone"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option>UTC</option>
                                                <option>Asia/Kolkata</option>
                                                <option>America/New_York</option>
                                                <option>Europe/London</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
                                                Theme
                                            </label>
                                            <select
                                                id="theme"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option>Light</option>
                                                <option>Dark</option>
                                                <option>System</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="auto-update"
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="auto-update" className="ml-2 block text-sm text-gray-700">
                                                Enable automatic updates
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                id="telemetry"
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                defaultChecked
                                            />
                                            <label htmlFor="telemetry" className="ml-2 block text-sm text-gray-700">
                                                Share anonymous usage data
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h2>

                                    <div className="space-y-6">
                                        <div className="flex items-center">
                                            <div className="mr-4">
                                                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                    <User className="h-8 w-8" />
                                                </div>
                                            </div>
                                            <div>
                                                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                                    Upload new photo
                                                </button>
                                                <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size 2MB</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    First Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="first-name"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    defaultValue="Ankit"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Last Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="last-name"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    defaultValue="Chauhan"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                defaultValue="ankit@example.com"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                                                Bio
                                            </label>
                                            <textarea
                                                id="bio"
                                                rows={3}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                defaultValue="CI/CD enthusiast and developer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Settings</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label htmlFor="email-build-success" className="block text-sm font-medium text-gray-700">
                                                            Build Success
                                                        </label>
                                                        <p className="text-xs text-gray-500">Receive email when builds succeed</p>
                                                    </div>
                                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                        <input
                                                            type="checkbox"
                                                            id="email-build-success"
                                                            className="sr-only"
                                                            checked={notifications.email}
                                                            onChange={() => handleNotificationChange('email')}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full ${notifications.email ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.email ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label htmlFor="email-build-failure" className="block text-sm font-medium text-gray-700">
                                                            Build Failure
                                                        </label>
                                                        <p className="text-xs text-gray-500">Receive email when builds fail</p>
                                                    </div>
                                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                        <input
                                                            type="checkbox"
                                                            id="email-build-failure"
                                                            className="sr-only"
                                                            checked={notifications.email}
                                                            onChange={() => handleNotificationChange('email')}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full ${notifications.email ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.email ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label htmlFor="email-deployment" className="block text-sm font-medium text-gray-700">
                                                            Deployment Status
                                                        </label>
                                                        <p className="text-xs text-gray-500">Receive email for deployment updates</p>
                                                    </div>
                                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                        <input
                                                            type="checkbox"
                                                            id="email-deployment"
                                                            className="sr-only"
                                                            checked={notifications.email}
                                                            onChange={() => handleNotificationChange('email')}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full ${notifications.email ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.email ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Slack Notifications</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label htmlFor="slack-build-status" className="block text-sm font-medium text-gray-700">
                                                            Build Status
                                                        </label>
                                                        <p className="text-xs text-gray-500">Receive Slack notifications for build status</p>
                                                    </div>
                                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                        <input
                                                            type="checkbox"
                                                            id="slack-build-status"
                                                            className="sr-only"
                                                            checked={notifications.slack}
                                                            onChange={() => handleNotificationChange('slack')}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full ${notifications.slack ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.slack ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label htmlFor="slack-deployment" className="block text-sm font-medium text-gray-700">
                                                            Deployment Alerts
                                                        </label>
                                                        <p className="text-xs text-gray-500">Receive Slack notifications for deployments</p>
                                                    </div>
                                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                        <input
                                                            type="checkbox"
                                                            id="slack-deployment"
                                                            className="sr-only"
                                                            checked={notifications.slack}
                                                            onChange={() => handleNotificationChange('slack')}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full ${notifications.slack ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.slack ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Notifications</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Webhook URL
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="webhook-url"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="https://example.com/webhook"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <label htmlFor="webhook-enabled" className="block text-sm font-medium text-gray-700">
                                                            Enable Webhook
                                                        </label>
                                                        <p className="text-xs text-gray-500">Send HTTP POST requests to your webhook</p>
                                                    </div>
                                                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                                                        <input
                                                            type="checkbox"
                                                            id="webhook-enabled"
                                                            className="sr-only"
                                                            checked={notifications.webhook}
                                                            onChange={() => handleNotificationChange('webhook')}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full ${notifications.webhook ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                                        <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifications.webhook ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">Add an extra layer of security to your account</p>
                                                    {security.twoFactor && (
                                                        <p className="text-xs text-green-600 mt-1">Currently enabled</p>
                                                    )}
                                                </div>
                                                <button
                                                    className={`px-4 py-2 rounded-md ${security.twoFactor ? 'bg-gray-100 text-gray-700' : 'bg-blue-600 text-white'}`}
                                                    onClick={() => handleSecurityChange('twoFactor', !security.twoFactor)}
                                                >
                                                    {security.twoFactor ? 'Disable' : 'Enable'}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Session Timeout</h3>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-700">Automatically log out after inactivity</p>
                                                </div>
                                                <select
                                                    value={security.sessionTimeout}
                                                    onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                                                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value={15}>15 minutes</option>
                                                    <option value={30}>30 minutes</option>
                                                    <option value={60}>1 hour</option>
                                                    <option value={120}>2 hours</option>
                                                    <option value={0}>Never</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Chrome on macOS</p>
                                                        <p className="text-xs text-gray-500">San Francisco, CA • Last active 2 hours ago</p>
                                                    </div>
                                                    <button className="text-sm text-red-600 hover:text-red-700">
                                                        Revoke
                                                    </button>
                                                </div>
                                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Firefox on Windows</p>
                                                        <p className="text-xs text-gray-500">New York, NY • Last active 1 day ago</p>
                                                    </div>
                                                    <button className="text-sm text-red-600 hover:text-red-700">
                                                        Revoke
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Password</h3>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'integrations' && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Integrations</h2>

                                    <div className="space-y-6">
                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                                        <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900">GitHub</h3>
                                                        <p className="text-xs text-gray-500">Connect your GitHub repositories</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                                                    Connect
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                                        <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09zM12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                            <path d="M1 1h22v22H1z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900">Google Cloud</h3>
                                                        <p className="text-xs text-gray-500">Deploy to Google Cloud Platform</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                                                    Configure
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                                        <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M12 0C5.374 0 0 5.372 0 12c0 6.627 5.374 12 12 12 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12zm-2 15.5v-7l6 3.5-6 3.5z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900">YouTube</h3>
                                                        <p className="text-xs text-gray-500">Post build status updates</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                                                    Connect
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                                        <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900">YouTube</h3>
                                                        <p className="text-xs text-gray-500">Post build status updates</p>
                                                    </div>
                                                </div>
                                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                                                    Connect
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'advanced' && (
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Advanced Settings</h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Worker Configuration</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="worker-count" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Number of Workers
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="worker-count"
                                                        min="1"
                                                        max="10"
                                                        className="w-20 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        defaultValue="3"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="worker-image" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Worker Docker Image
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="worker-image"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        defaultValue="ghcr.io/ankit-chauhan/cicd-worker:latest"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Build Configuration</h3>
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <input
                                                        id="parallel-builds"
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        defaultChecked
                                                    />
                                                    <label htmlFor="parallel-builds" className="ml-2 block text-sm text-gray-700">
                                                        Enable parallel builds
                                                    </label>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        id="cache-builds"
                                                        type="checkbox"
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        defaultChecked
                                                    />
                                                    <label htmlFor="cache-builds" className="ml-2 block text-sm text-gray-700">
                                                        Enable build caching
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                                            <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                                                <div>
                                                    <h4 className="text-sm font-medium text-red-800 mb-2">Reset All Settings</h4>
                                                    <p className="text-xs text-red-600 mb-3">This will reset all settings to their default values.</p>
                                                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                                                        Reset Settings
                                                    </button>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-red-800 mb-2">Delete All Data</h4>
                                                    <p className="text-xs text-red-600 mb-3">This will permanently delete all pipelines, builds, and logs.</p>
                                                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                                                        Delete All Data
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="bg-gray-800 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <div className="flex items-center">
                                <div className="bg-blue-600 text-white p-2 rounded-md mr-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <span className="text-lg font-semibold text-white">CI/CD by Ankit Chauhan</span>
                            </div>
                            <p className="mt-2 text-sm text-gray-300">Modern continuous integration and deployment</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <p className="text-sm text-gray-300">&copy; 2025 Ankit Chauhan. All rights reserved.</p>
                            <p className="text-sm text-gray-400 mt-1">Version 2.4.0</p>
                        </div>
                    </div>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <h4 className="text-white text-sm font-medium mb-3">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Features</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Pricing</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white text-sm font-medium mb-3">Support</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Community</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Status</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Contact Us</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white text-sm font-medium mb-3">Resources</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Case Studies</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Webinars</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Tutorials</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white text-sm font-medium mb-3">Company</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Careers</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Privacy</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white text-sm">Terms</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default SettingsPage;