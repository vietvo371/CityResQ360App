import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { Report, ReportDetail, CreateReportRequest, ReportFilterParams } from '../types/api/report';

export const reportService = {
    getReports: async (params?: ReportFilterParams): Promise<ApiResponse<Report[]>> => {
        const response = await api.get<ApiResponse<Report[]>>('/reports', { params });
        return response.data;
    },

    getReportDetail: async (id: number): Promise<ApiResponse<ReportDetail>> => {
        const response = await api.get<ApiResponse<ReportDetail>>(`/reports/${id}`);
        return response.data;
    },

    createReport: async (data: CreateReportRequest): Promise<ApiResponse<Report>> => {
        const response = await api.post<ApiResponse<Report>>('/reports', data);
        return response.data;
    },

    getMyReports: async (params?: ReportFilterParams): Promise<ApiResponse<Report[]>> => {
        const response = await api.get<ApiResponse<Report[]>>('/reports/my', { params });
        return response.data;
    },

    getNearbyReports: async (lat: number, long: number, radius: number = 5): Promise<ApiResponse<Report[]>> => {
        const response = await api.get<ApiResponse<Report[]>>('/reports/nearby', {
            params: { vi_do: lat, kinh_do: long, radius }
        });
        return response.data;
    },

    voteReport: async (id: number, type: 'upvote' | 'downvote'): Promise<ApiResponse<any>> => {
        const loai_binh_chon = type === 'upvote' ? 1 : -1;
        const response = await api.post<ApiResponse<any>>(`/reports/${id}/vote`, { loai_binh_chon });
        return response.data;
    }
};
