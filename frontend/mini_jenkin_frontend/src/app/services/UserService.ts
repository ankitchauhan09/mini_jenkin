import apiService from '@/app/services/AuthService'
import { useUser } from '../context/UserContext';

interface User {
    userId: string,
    name: string,
    email: string,
}

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE!;
const USER_SERVICE_URL = !process.env.NEXT_PUBLIC_USER_SERVICE_URL;

const login = async (email: string, password: string) => {
    console.log("Login attempt for emai : " + email);
    try {
        const response = await apiService.post(AUTH_SERVICE_URL, {email: email, password: password}, "/login")
        console.log(response)
        return response;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

const register = async (email: string, password: string, name: string) => {
    try {
        const response = await apiService.post(AUTH_SERVICE_URL, {
            email: email,
            password: password,
            name: name
        }, "/register");
        return {success: true, data: response.data.data};
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export {login, register};

