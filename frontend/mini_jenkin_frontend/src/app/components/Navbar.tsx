"use client"
import React, {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useUser} from "../context/UserContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const Navbar: React.FC = () => {
    const router = useRouter();
    const {user, logout} = useUser();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const navigateToLogin = () => {
        router.push('/login');
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-white py-4 px-6 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="bg-blue-600 text-white p-2 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                 stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M13 10V3L4 14h7v7l9-11h-7z"/>
                            </svg>
                        </div>
                        <span className="text-xl font-bold text-blue-600">
                            CI/CD by Ankit Chauhan
                        </span>
                    </Link>
                </div>
                <div className="relative" ref={dropdownRef}>
                    {!user ? (
                        <button
                            onClick={navigateToLogin}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors"
                        >
                            Login / Sign In
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            >

                                <DropdownMenu>
                                    <DropdownMenuTrigger> <span>{user.name}</span></DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                        <DropdownMenuSeparator/>
                                        <DropdownMenuItem
                                            onClick={() => router.push('/dashboard')}>Dashboard</DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                            </button>

                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar