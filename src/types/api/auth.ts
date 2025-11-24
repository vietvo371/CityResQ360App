import { ApiResponse } from './common';

export type UserRole = 'citizen' | 'student' | 'teacher' | 'urban_manager' | 'researcher' | 'business' | 'verifier' | 'government';

export interface User {
    id: number;
    ho_ten: string;
    email?: string;
    so_dien_thoai?: string;
    anh_dai_dien?: string;
    cap_huy_hieu?: number;
    cap_huy_hieu_text?: string;
    diem_uy_tin?: number;
    tong_so_phan_anh?: number;
    ty_le_chinh_xac?: number;
    ngay_tham_gia?: string;
    role?: UserRole;
}

export interface LoginResponse {
    user: User;
    token: string;
    refreshToken?: string;
}

export interface LoginRequest {
    identifier: string; // email or phone
    password: string;
    type?: 'email' | 'phone';
}

export interface RegisterRequest {
    ho_ten: string;
    email?: string;
    so_dien_thoai?: string;
    mat_khau: string;
    role?: UserRole;
}
