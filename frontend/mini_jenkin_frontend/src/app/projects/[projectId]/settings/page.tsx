'use client';
import React, { useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import { toast } from "sonner";
import { Link2, CheckCircle, Copy } from "lucide-react";

const WEBHOOK_URL = (projectId: number) =>
    `https://be64-2409-40e3-3052-1b18-a192-fa25-f1e5-802f.ngrok-free.app/webhook/github/${projectId}`;

const ProjectSettings: React.FC = () => {
    const params = useParams();
    const projectId = params?.projectId ? Number(params.projectId) : null;
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (projectId) {
            navigator.clipboard.writeText(WEBHOOK_URL(projectId));
            setCopied(true);
            toast.success("Webhook URL copied!");
            setTimeout(() => setCopied(false), 1500);
        }
    };

    return (
        <div>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4 flex items-center">
                        <Link2 className="mr-2" /> GitHub Webhook Integration
                    </h2>
                    <p className="mb-2">
                        To enable automatic builds on GitHub push, add the following webhook URL to your repository settings:
                    </p>
                    <div className="flex items-center bg-gray-100 rounded px-3 py-2 mb-2">
                        <span className="font-mono text-sm break-all">{projectId ? WEBHOOK_URL(projectId) : "..."}</span>
                        <button
                            onClick={handleCopy}
                            className="ml-2 p-1 rounded hover:bg-gray-200"
                            title="Copy Webhook URL"
                        >
                            {copied ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                        </button>
                    </div>
                    <ol className="list-decimal ml-6 text-sm text-gray-700">
                        <li>Go to your GitHub repository &rarr; Settings &rarr; Webhooks.</li>
                        <li>Click "Add webhook".</li>
                        <li>Paste the above URL as the Payload URL.</li>
                        <li>Set Content type to <b>application/json</b>.</li>
                        <li>Choose "Just the push event".</li>
                        <li>Save the webhook.</li>
                    </ol>
                </div>
                {/* Add more settings sections here */}
            </main>
        </div>
    );
};

export default ProjectSettings;