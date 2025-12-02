import api from '../utils/Api';
import { ApiResponse } from '../types/api/common';
import { WalletInfo, Transaction, Reward, RedeemResponse, TransactionFilterParams } from '../types/api/wallet';

export const walletService = {
    getWalletInfo: async (): Promise<ApiResponse<WalletInfo>> => {
        const response = await api.get<ApiResponse<WalletInfo>>('/wallet');
        return response.data;
    },

    getTransactions: async (params?: TransactionFilterParams): Promise<ApiResponse<Transaction[]>> => {
        const response = await api.get<ApiResponse<Transaction[]>>('/wallet/transactions', { params });
        return response.data;
    },

    getRewards: async (page: number = 1): Promise<ApiResponse<Reward[]>> => {
        const response = await api.get<ApiResponse<Reward[]>>('/wallet/rewards', {
            params: { page }
        });
        return response.data;
    },

    redeemReward: async (rewardId: number): Promise<ApiResponse<RedeemResponse>> => {
        const response = await api.post<ApiResponse<RedeemResponse>>('/wallet/redeem', {
            phan_thuong_id: rewardId
        });
        return response.data;
    }
};
