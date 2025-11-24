
/**
 * Cấu hình môi trường ứng dụng - FILE MẪU
 * Copy file này thành env.ts và điền thông tin thích hợp
 */

const env = {
  // API URL
    API_URL: 'http://localhost:8000',
    BROADCAST_HOST: 'mimo.dragonlab.vn',
    PUSHER_KEY: '1',
    // EKYC Configuration
    // Các cấu hình khác
    TIMEOUT: 15000,
    DEBUG: true,
    MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtZ3ZxazFmbDBndnMyanIxMzN0dHV1eGcifQ.lhk4cDYUEIozqnFfkSebaw',
    MAPBOX_DOWNLOADS_TOKEN: 'sk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtaHgxZmgxMDA1c2cyanM0bzh3ampmcDkifQ.Dt8r7flOpb0eJTL8cAou6Q',
  };
  
  export default env;
  