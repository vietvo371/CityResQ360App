import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { Media } from '../types/api/report';

export const mediaService = {
    uploadMedia: async (
        file: any,
        type: 'image' | 'video' = 'image',
        lien_ket_den: 'phan_anh' | 'binh_luan' = 'phan_anh',
        mo_ta: string = ''
    ): Promise<ApiResponse<Media>> => {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.type,
            name: file.fileName || `upload_${Date.now()}.${type === 'image' ? 'jpg' : 'mp4'}`,
        });
        formData.append('type', type);
        formData.append('lien_ket_den', lien_ket_den);
        formData.append('mo_ta', mo_ta);

        const response = await api.post<ApiResponse<Media>>('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
            transformRequest: (data, headers) => {
                // React Native's FormData handling requires this to prevent axios from stringifying the body
                return formData;
            },
        });
        return response.data;
    }
};
