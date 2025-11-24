export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    meta?: PaginationMeta;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export interface PaginationParams {
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}
