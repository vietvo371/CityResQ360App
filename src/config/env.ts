/**
 * Cấu hình môi trường ứng dụng
 */

const env = {
  // API URL
  API_URL: 'https://api.cityresq360.io.vn',

  // WebSocket Configuration
  // Backend dùng Nginx reverse proxy: /app/ -> localhost:6001
  // Mobile app kết nối qua HTTPS (port 443) giống web
  REVERB_APP_ID:808212,
  REVERB_APP_KEY: 'lwf6joghdvbowg9hb7p4',
  REVERB_APP_SECRET: 'yh8dts6nhxqzn2i77yim',
  REVERB_HOST: 'api.cityresq360.io.vn',
  REVERB_PORT: 443,  // Port HTTPS thay vì 6001
  REVERB_SCHEME: 'https',
  
  // Bật WebSocket (web đã hoạt động, mobile cũng sẽ hoạt động với port 443)
  ENABLE_WEBSOCKET: true,

  // System Configuration
  TIMEOUT: 15000,
  DEBUG: true,

  // Mapbox Configuration

  MAPTILER_API_KEY: 'dpmkld1oGcbPpGtsRgKX',
  MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtZ3ZxazFmbDBndnMyanIxMzN0dHV1eGcifQ.lhk4cDYUEIozqnFfkSebaw',
  MAPBOX_DOWNLOADS_TOKEN: 'sk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtaHgxZmgxMDA1c2cyanM0bzh3ampmcDkifQ.Dt8r7flOpb0eJTL8cAou6Q',
};

export default env;
