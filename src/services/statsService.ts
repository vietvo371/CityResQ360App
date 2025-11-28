import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { OverviewStats, CategoryStats, TimelineStats, LeaderboardEntry, CityStats } from '../types/api/stats';

export const statsService = {
    getOverviewStats: async (): Promise<ApiResponse<OverviewStats>> => {
        const response = await api.get<ApiResponse<OverviewStats>>('/stats/overview');
        return response.data;
    },

    getCategoriesStats: async (): Promise<ApiResponse<CategoryStats[]>> => {
        const response = await api.get<ApiResponse<CategoryStats[]>>('/stats/categories');
        return response.data;
    },

    getTimelineStats: async (period: '7d' | '30d' | '90d' | '1y' = '7d'): Promise<ApiResponse<TimelineStats>> => {
        const response = await api.get<ApiResponse<TimelineStats>>('/stats/timeline', {
            params: { period }
        });
        return response.data;
    },

    getLeaderboard: async (limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> => {
        const response = await api.get<ApiResponse<LeaderboardEntry[]>>('/stats/leaderboard', {
            params: { limit }
        });
        return response.data;
    },

    getCityStats: async (): Promise<ApiResponse<CityStats>> => {
        const response = await api.get<ApiResponse<CityStats>>('/stats/city');
        return response.data;
    }
};
