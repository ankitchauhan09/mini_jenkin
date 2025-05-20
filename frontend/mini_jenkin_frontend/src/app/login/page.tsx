"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { FaGoogle, FaGithub, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import FormInput from '../components/auth/FormInput';
import {login} from '@/app/services/UserService'
import {useUser} from "../context/UserContext";

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const {loginUser} = useUser();
    const onSubmit = async (data: any) => {
        console.log(data);
        const response = await login(data.email, data.password);
        loginUser(response.data.user, response.data.token)
        console.log(localStorage.getItem("jwtToken"))
        window.location.href = '/dashboard';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link
                    href="/"
                    className="absolute top-4 left-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                >
                    <FaHome className="w-5 h-5"/>
                    <span>Go to Home</span>
                </Link>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <FormInput
                            id="email"
                            label="Email address"
                            type="email"
                            register={register}
                            errors={errors}
                            placeholder="Enter your email"
                        />

                        <FormInput
                            id="password"
                            label="Password"
                            type="password"
                            register={register}
                            errors={errors}
                            placeholder="Enter your password"
                        />

                        <div className="flex items-center justify-between">

                            <div className="text-sm">
                                <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Sign in
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;