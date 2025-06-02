"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { toast } from "sonner";
import { Settings, Link2, CheckCircle } from "lucide-react";

const GITHUB_WEBHOOK_URL = (projectId: number) =>
    `${process.env.NEXT_PUBLIC_PROJECT_SERVICE}/webhook/github/${projectId}`;

const ProjectSettings: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const projectId = params?.projectId ? Number(params.projectId) : null;
    const [webhookEnabled, setWebhookEnabled] = useState(false);

    const handleWebhookToggle = () => {
        setWebhookEnabled((prev) => !prev);
        toast.success(
            webhookEnabled
                ? "GitHub Webhook disabled"
                : "GitHub Webhook enabled. Don't forget to add the webhook in your GitHub repo!"
        );
        // TODO: Call API to persist webhook setting if needed
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="mb-6 flex items-center">
                    <Settings className="h-6 w-6 text-blue-600 mr-2" />
                    <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
                </div>

                {/* GitHub Webhook Integration Section */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-2">GitHub Webhook Integration</h2>
                    <p className="text-gray-600 mb-4">
                        Enable this to trigger builds automatically when you push to your GitHub repository.
                    </p>
                    <div className="flex items-center mb-4">
                        <input
                            type="checkbox"
                            checked={webhookEnabled}
                            onChange={handleWebhookToggle}
                            className="mr-2"
                            id="webhook-toggle"
                        />
                        <label htmlFor="webhook-toggle" className="font-medium">
                            Enable Auto Build on GitHub Push
                        </label>
                        {webhookEnabled && <CheckCircle className="h-5 w-5 text-green-500 ml-2" />}
                    </div>
                    {webhookEnabled && projectId && (
                        <div className="bg-gray-50 rounded p-4 border border-gray-200">
                            <div className="mb-2 font-mono text-sm flex items-center">
                                <Link2 className="h-4 w-4 mr-1" />
                                <span>
                  <b>Webhook URL:</b> {GITHUB_WEBHOOK_URL(projectId)}
                </span>
                                <button
                                    className="ml-2 text-blue-600 hover:underline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(GITHUB_WEBHOOK_URL(projectId));
                                        toast.success("Webhook URL copied!");
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                            <ol className="text-xs text-gray-600 list-decimal ml-5">
                                <li>
                                    Go to your GitHub repository &rarr; Settings &rarr; Webhooks &rarr; Add webhook.
                                </li>
                                <li>
                                    Paste the above URL as the Payload URL.
                                </li>
                                <li>
                                    Set Content type to <b>application/json</b>.
                                </li>
                                <li>
                                    Choose <b>Just the push event</b> or select events as needed.
                                </li>
                                <li>
                                    Save the webhook.
                                </li>
                            </ol>
                        </div>
                    )}
                </div>
                {/* Add more settings sections here */}
            </main>
        </div>
    );
};

export default ProjectSettings;