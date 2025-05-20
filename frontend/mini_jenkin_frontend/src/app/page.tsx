// pages/index.tsx
import React from 'react';
import Head from 'next/head';
import Navbar from './components/Navbar';

const Home: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Head>
                <title>CI/CD by Ankit Chauhan</title>
                <meta name="description" content="A modern Jenkins clone for CI/CD pipelines" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Navbar />

            <main className="flex-grow">
                {/* Hero Section with MUCH improved contrast */}
                {/* Hero Section with better wave coverage */}
                <div className="relative bg-blue-700 text-white overflow-hidden">
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black opacity-30"></div>

                    {/* Hero Content */}
                    <div className="container mx-auto px-4 pt-32 pb-48 relative z-10"> {/* Notice increased padding */}
                        <div className="max-w-3xl mx-auto text-center">
                            <h1 className="text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
                                Modern CI/CD Pipeline
                                <span className="block text-white">Simplified</span>
                            </h1>
                            <p className="text-xl text-white mb-10 leading-relaxed font-medium drop-shadow-md">
                                A lightweight, powerful continuous integration and deployment platform
                                designed for modern development workflows.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button
                                    className="bg-white text-blue-700 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg">
                                    Get Started
                                </button>
                                <button
                                    className="bg-blue-600 text-white border-2 border-white px-8 py-3 rounded-full font-medium hover:bg-blue-500 transition-colors">
                                    View Demo
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Wave shape at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]">
                    </div>

                </div>


                {/* Features Section */}
                <div className="py-24 px-4 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
                            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
                                Built for developers who value simplicity without sacrificing power.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature 1 */}
                            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="p-8">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Configuration</h3>
                                    <p className="text-gray-800">Simple YAML-based configuration with sensible defaults. Get started in minutes, not hours.</p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="p-8">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Deployment</h3>
                                    <p className="text-gray-800">Optimized performance with parallel execution and caching capabilities to speed up your builds and deployments.</p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <div className="p-8">
                                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">Detailed Analytics</h3>
                                    <p className="text-gray-800">Comprehensive insights into build performance, test results, and deployment metrics to optimize your CI/CD process.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-blue-600 py-16">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">Ready to streamline your workflow?</h2>
                        <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg">
                            Start Building Now
                        </button>
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
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;