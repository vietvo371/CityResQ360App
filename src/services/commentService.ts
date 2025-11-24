import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { Comment } from '../types/api/report';

export const commentService = {
    getComments: async (reportId: number, page: number = 1): Promise<ApiResponse<Comment[]>> => {
        const response = await api.get<ApiResponse<Comment[]>>(`/reports/${reportId}/comments`, {
            params: { page }
        });
        return response.data;
    },

    addComment: async (reportId: number, content: string): Promise<ApiResponse<Comment>> => {
        const response = await api.post<ApiResponse<Comment>>(`/reports/${reportId}/comments`, {
            noi_dung: content
        });
        return response.data;
    }
};
