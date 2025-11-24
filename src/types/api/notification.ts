export interface Notification {
    id: number;
    tieu_de: string;
    noi_dung: string;
    loai: string; // 'system', 'report_update', 'reward', etc.
    da_doc: boolean;
    data?: any; // JSON data related to notification (e.g., report_id)
    ngay_tao: string;
}

export interface NotificationFilterParams {
    page?: number;
    per_page?: number;
    da_doc?: boolean;
}
