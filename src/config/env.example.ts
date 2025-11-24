/**
 * Cấu hình môi trường ứng dụng - FILE MẪU
 * Copy file này thành env.ts và điền thông tin thích hợp
 */

const env = {
  // API URL
  API_URL: 'https://api.example.com',
  
  // EKYC Configuration
  EKYC: {
    TOKEN_KEY: 'YOUR_EKYC_TOKEN_KEY',
    TOKEN_ID: 'YOUR_EKYC_TOKEN_ID',
    ACCESS_TOKEN: 'bearer YOUR_EKYC_JWT_TOKEN', // Đảm bảo JWT token có đủ 3 phần header.payload.signature
  },

  // Các cấu hình khác
  TIMEOUT: 15000,
  DEBUG: true,
};

export default env;
