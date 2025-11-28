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
    },

    updateComment: async (commentId: number, content: string): Promise<ApiResponse<Comment>> => {
        const response = await api.put<ApiResponse<Comment>>(`/comments/${commentId}`, {
            noi_dung: content
        });
        return response.data;
    },

    deleteComment: async (commentId: number): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/comments/${commentId}`);
        return response.data;
    },

    likeComment: async (commentId: number): Promise<ApiResponse<any>> => {
        const response = await api.post<ApiResponse<any>>(`/comments/${commentId}/like`);
        return response.data;
    },

    unlikeComment: async (commentId: number): Promise<ApiResponse<any>> => {
        const response = await api.delete<ApiResponse<any>>(`/comments/${commentId}/like`);
        return response.data;
    }
};
