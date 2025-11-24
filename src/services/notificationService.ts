import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { Notification, NotificationFilterParams } from '../types/api/notification';

export const notificationService = {
    getNotifications: async (params?: NotificationFilterParams): Promise<ApiResponse<Notification[]>> => {
        const response = await api.get<ApiResponse<Notification[]>>('/notifications', { params });
        return response.data;
    },

    markAsRead: async (id: number): Promise<ApiResponse<any>> => {
        const response = await api.put<ApiResponse<any>>(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async (): Promise<ApiResponse<any>> => {
        const response = await api.put<ApiResponse<any>>('/notifications/read-all');
        return response.data;
    },

    getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
        const response = await api.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
        return response.data;
    }
};
