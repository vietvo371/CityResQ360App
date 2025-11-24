export interface WalletInfo {
    diem_thanh_pho: number;
    diem_uy_tin: number;
    cap_huy_hieu: number;
    cap_huy_hieu_text: string;
    next_level_points: number;
    progress_percentage: number;
}

export interface Transaction {
    id: number;
    loai_giao_dich: number; // 0: reward, 1: spend, 2: admin_adjust
    loai_giao_dich_text: string;
    so_diem: number;
    so_du_truoc: number;
    so_du_sau: number;
    ly_do: string;
    ngay_tao: string;
}

export interface Reward {
    id: number;
    ten_phan_thuong: string;
    mo_ta: string;
    so_diem_can: number;
    hinh_anh: string;
    so_luong_con_lai: number;
    ngay_het_han: string;
}

export interface RedeemResponse {
    so_du_moi: number;
    voucher_code: string;
}

export interface TransactionFilterParams {
    page?: number;
    per_page?: number;
    loai_giao_dich?: number;
}
