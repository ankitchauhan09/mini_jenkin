"use client";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaGoogle, FaGithub, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import FormInput from '../components/auth/FormInput';
import SocialButton from '../components/auth/SocialButton';
import PasswordStrength from '../components/auth/PasswordStrength';

const SignupPage = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [password, setPassword] = useState('');

    const onSubmit = (data: any) => {
        console.log(data);
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
                    Create your account
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <FormInput
                            id="name"
                            label="Full name"
                            type="text"
                            register={register}
                            errors={errors}
                            placeholder="Enter your full name"
                        />

                        <FormInput
                            id="email"
                            label="Email address"
                            type="email"
                            register={register}
                            errors={errors}
                            placeholder="Enter your email"
                        />

                        <div>
                            <FormInput
                                id="password"
                                label="Password"
                                type="password"
                                register={register}
                                errors={errors}
                                placeholder="Create a password"
                            />
                            <PasswordStrength password={watch('password') || ''}/>
                        </div>

                        <FormInput
                            id="confirmPassword"
                            label="Confirm password"
                            type="password"
                            register={register}
                            errors={errors}
                            placeholder="Confirm your password"
                        />

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Sign up
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;