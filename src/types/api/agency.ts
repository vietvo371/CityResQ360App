// Agency Types

export interface Agency {
    id: number;
    ten_co_quan: string; // Agency name
    ma_co_quan?: string; // Agency code
    loai_co_quan?: number; // 0:government, 1:department, 2:district, 3:ward
    dia_chi?: string;
    so_dien_thoai?: string;
    email?: string;
    website?: string;
    mo_ta?: string;
    anh_dai_dien?: string;
    trang_thai?: number; // 0:inactive, 1:active
    nguoi_phu_trach?: string;
    so_dien_thoai_lien_he?: string;
    created_at?: string;
    updated_at?: string;
}

export interface AgencyStats {
    agency_id: number;
    agency_name: string;
    total_reports: number;
    verified_reports: number;
    in_progress_reports: number;
    resolved_reports: number;
    rejected_reports: number;
    avg_response_time: number; // in hours
    avg_resolution_time: number; // in hours
    accuracy_rate: number; // percentage
    satisfaction_rate: number; // percentage
    categories: {
        category: number;
        category_name: string;
        count: number;
    }[];
    monthly_performance: {
        month: string; // YYYY-MM
        total: number;
        resolved: number;
        avg_time: number;
    }[];
}
