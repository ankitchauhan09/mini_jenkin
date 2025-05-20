"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface UserContextType {
    user: User | null | undefined;
    setUser: (user: User | null | undefined) => void;
    loginUser: (userData: User, token: any) => void;
    updateUser: (updatedUserData: User) => void;
    logout: () => void;
    isLoading: boolean;
}

interface User {
    name: string;
    email: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null | undefined>(undefined); // undefined to distinguish from null (logged out)
    const [isLoading, setIsLoading] = useState(true);

    // Initialize user on mount
    useEffect(() => {
        const fetchUserFromLocalStorage = () => {
            try {
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(null); // Explicitly set to null if no user found
                }
            } catch (error) {
                console.error("Error loading user from localStorage:", error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserFromLocalStorage();
    }, []);

    // Update localStorage whenever user changes
    useEffect(() => {
        if (user === undefined) return; // Skip initial undefined state

        if (user) {
            localStorage.setItem("user", JSON.stringify(user));
        } else {
            localStorage.removeItem("user");
        }
    }, [user]);

    const loginUser = (userData: User, token : string) => {
        setUser(userData);
        localStorage.setItem('token', token);
    };

    const updateUser = (updatedUserData: User) => {
        setUser(updatedUserData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <UserContext.Provider
            value={{
                user,
                setUser,
                loginUser,
                updateUser,
                logout,
                isLoading,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be within a UserContextProvider");
    }
    return context;
};
