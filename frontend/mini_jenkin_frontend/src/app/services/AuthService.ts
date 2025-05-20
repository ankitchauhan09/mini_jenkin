import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

interface ErrorApiResponse {
    success: false;
    message: string;
    detail: string;
}

class ApiService {
    private static createInstance(baseUrl: string): AxiosInstance {
        const token = localStorage.getItem('token');  // or whatever your key is
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return axios.create({
            baseURL: baseUrl,
            headers,
            withCredentials: true,
        });
    }

    static async get<T>(baseUrl: string, endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T> | ErrorApiResponse> {
        const api = this.createInstance(baseUrl);
        try {
            const response = await api.get(endpoint, {params});
            return {success: true, data: response.data.data, message: "Request was successful"};
        } catch (error) {
            return this.handleError(error);
        }
    }

    static async post<T>(baseUrl: string, data: T, endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T> | ErrorApiResponse> {
        const api = this.createInstance(baseUrl);
        try {
            const response = await api.post(endpoint, data, config);
            return {success: true, data: response.data.data, message: response.data.message};
        } catch (error) {
            return this.handleError(error);
        }
    }

    private static handleError(error: any): ErrorApiResponse {
        console.error(error);
        return {
            success: false,
            message: error.response?.data?.message || "An unknown error occurred",
            detail: error.response?.data?.detail || error.message || "No further details available."
        };
    }
}

export default ApiService;
