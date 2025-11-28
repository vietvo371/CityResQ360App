import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { Agency, AgencyStats } from '../types/api/agency';
import { Report } from '../types/api/report';

export const agencyService = {
    getAgencies: async (): Promise<ApiResponse<Agency[]>> => {
        const response = await api.get<ApiResponse<Agency[]>>('/agencies');
        return response.data;
    },

    getAgencyDetail: async (agencyId: number): Promise<ApiResponse<Agency>> => {
        const response = await api.get<ApiResponse<Agency>>(`/agencies/${agencyId}`);
        return response.data;
    },

    getAgencyReports: async (agencyId: number, page: number = 1): Promise<ApiResponse<Report[]>> => {
        const response = await api.get<ApiResponse<Report[]>>(`/agencies/${agencyId}/reports`, {
            params: { page }
        });
        return response.data;
    },

    getAgencyStats: async (agencyId: number): Promise<ApiResponse<AgencyStats>> => {
        const response = await api.get<ApiResponse<AgencyStats>>(`/agencies/${agencyId}/stats`);
        return response.data;
    }
};
