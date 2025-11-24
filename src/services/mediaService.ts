import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { Media } from '../types/api/report';

export const mediaService = {
    uploadMedia: async (file: any): Promise<ApiResponse<Media>> => {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type,
            name: file.fileName || 'upload.jpg',
        });

        const response = await api.post<ApiResponse<Media>>('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
