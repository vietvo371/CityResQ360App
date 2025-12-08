export interface Notification {
    id: number;
    tieu_de: string;
    noi_dung: string;
    loai: string; // 'system', 'report_update', 'report_status_update', 'reward', etc.
    da_doc: boolean;
    data?: any; // JSON data related to notification (e.g., report_id)
    du_lieu_mo_rong?: {
        phan_anh_id?: number;
        trang_thai_moi?: number;
        [key: string]: any;
    };
    ngay_tao: string;
}

export interface NotificationFilterParams {
    page?: number;
    per_page?: number;
    da_doc?: boolean;
}

export interface NotificationSettings {
    push_enabled: boolean;
    email_enabled: boolean;
    report_updates: boolean;
    comment_replies: boolean;
}
