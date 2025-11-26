import { ApiResponse } from './common';

export type UserRole = 'citizen' | 'student' | 'teacher' | 'urban_manager' | 'researcher' | 'business' | 'verifier' | 'government';

export interface User {
    id: number;
    ho_ten: string;
    email?: string;
    so_dien_thoai?: string;
    anh_dai_dien?: string | null;
    vai_tro?: number; // 0 = citizen, 1 = government, etc.
    diem_thanh_pho?: number; // City points
    diem_uy_tin?: number; // Reputation points
    cap_huy_hieu?: number; // Badge level
    cap_huy_hieu_text?: string;
    xac_thuc_cong_dan?: boolean; // Citizen verification status
    tong_so_phan_anh?: number; // Total reports
    ty_le_chinh_xac?: number; // Accuracy rate
    ngay_tham_gia?: string; // Join date
    role?: UserRole;
}

export interface LoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

export interface LoginRequest {
    email: string;
    mat_khau: string;
    remember?: boolean;
}

export interface RegisterRequest {
    ho_ten: string;
    email: string;
    so_dien_thoai: string;
    mat_khau: string;
    mat_khau_confirmation: string;
}

export interface UpdateProfileRequest {
    ho_ten?: string;
    so_dien_thoai?: string;
    anh_dai_dien?: string; // base64 image or URL
}

export interface ChangePasswordRequest {
    mat_khau_cu: string;
    mat_khau_moi: string;
    mat_khau_moi_confirmation: string;
}

export interface ResetPasswordRequest {
    token: string;
    email: string;
    mat_khau: string;
    mat_khau_confirmation: string;
}

export interface VerifyCodeRequest {
    code: string;
}

export interface UpdateFcmTokenRequest {
    push_token: string; // Changed from fcm_token to push_token to match API
}
