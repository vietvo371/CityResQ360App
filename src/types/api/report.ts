import { User } from './auth';

export interface Report {
    id: number;
    tieu_de: string;
    mo_ta: string;
    danh_muc: number;
    danh_muc_text: string;
    trang_thai: number;
    trang_thai_text: string;
    uu_tien: number;
    uu_tien_text: string;
    vi_do: number;
    kinh_do: number;
    dia_chi: string;
    luot_ung_ho: number;
    luot_khong_ung_ho: number;
    luot_xem: number;
    nhan_ai?: string;
    do_tin_cay?: number;
    user?: User;
    agency?: {
        id: number;
        ten_co_quan: string;
    };
    media?: Media[];
    ngay_tao: string;
    ngay_cap_nhat: string;
}

export interface Media {
    id: number;
    url: string;
    type: 'image' | 'video';
    thumbnail_url?: string;
}

export interface ReportDetail extends Report {
    comments?: Comment[];
    votes?: {
        total_upvotes: number;
        total_downvotes: number;
        user_voted: number | null; // 1: upvoted, -1: downvoted, null: not voted
    };
}

export interface Comment {
    id: number;
    noi_dung: string;
    user: User;
    luot_thich: number;
    user_liked: boolean;
    ngay_tao: string;
}

export interface CreateReportRequest {
    tieu_de: string;
    mo_ta: string;
    danh_muc: number;
    uu_tien?: number;
    vi_do: number;
    kinh_do: number;
    dia_chi: string;
    la_cong_khai?: boolean;
    the_tags?: string[];
    media_ids?: number[];
}

export interface ReportFilterParams {
    page?: number;
    per_page?: number;
    danh_muc?: number;
    trang_thai?: number;
    uu_tien?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    tu_khoa?: string;
}
