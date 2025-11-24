import api from '../utils/Api';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/api/auth';
import { ApiResponse } from '../types/api/common';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@user_data';

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        try {
            const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
                email: credentials.identifier,
                mat_khau: credentials.password,
            });

            const data = response.data.data;
            if (data.token) {
                await AsyncStorage.setItem(TOKEN_KEY, data.token);
            }
            if (data.user) {
                await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    register: async (data: RegisterRequest): Promise<void> => {
        await api.post('/auth/register', data);
    },

    logout: async (): Promise<void> => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            // Ignore error on logout
        } finally {
            await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
        }
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    getToken: async (): Promise<string | null> => {
        return await AsyncStorage.getItem(TOKEN_KEY);
    },

    getUser: async (): Promise<User | null> => {
        const json = await AsyncStorage.getItem(USER_KEY);
        return json ? JSON.parse(json) : null;
    }
};
