/**
 * Cấu hình môi trường ứng dụng - FILE MẪU
 * Copy file này thành env.ts và điền thông tin thích hợp
 */

const env = {
// API URL
  API_URL: 'https://mimo.dragonlab.vn',
  BROADCAST_HOST: 'mimo.dragonlab.vn',
  PUSHER_KEY: 'mgo7rulpwxlwtslgbr4k',
  // EKYC Configuration
  EKYC: {
    TOKEN_KEY: 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKDkNJECt3ow2jyClCKo3r2gJ+0zBhS0T3CPvjnWbdfhgCwO19R7bmhzLGFKuMfumnmnnxK73KnQfppt/jKsGWcCAwEAAQ==',
    TOKEN_ID: '3e87ddb5-25d2-06ce-e063-63199f0afe5b',
    ACCESS_TOKEN: 'bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cmFuc2FjdGlvbl9pZCI6ImQzOThiY2FlLTlhZDEtNDA4ZC05NWQxLTY3YjdmZjAxOTc5MiIsInN1YiI6ImJjN2JmZDI2LThmMTYtMTFmMC1hNzY5LWY3MjI4MWE1OTJjOCIsImF1ZCI6WyJyZXN0c2VydmljZSJdLCJ1c2VyX25hbWUiOiJxdW9jbG9uZ2RuZ0BnbWFpbC5jb20iLCJzY29wZSI6WyJyZWFkIl0sImlzcyI6Imh0dHBzOi8vbG9jYWxob3N0IiwibmFtZSI6InF1b2Nsb25nZG5nQGdtYWlsLmNvbSIsInV1aWRfYWNjb3VudCI6ImJjN2JmZDI2LThmMTYtMTFmMC1hNzY5LWY3MjI4MWE1OTJjOCIsImF1dGhvcml0aWVzIjpbIlVTRVIiXSwianRpIjoiZDNjZDBhYzctNjMxNC00ZDMwLWEwYmItMzZlMjNhMGU1ZGU4IiwiY2xpZW50X2lkIjoiYWRtaW5hcHAifQ.hAhyzXtFPKCf0x6QKMxsqWps5Oq81wrRdeNZ8MoIkbQhCag8wJ6rZaPoJQmhiXt9AhEyd6kzc3XQtdgD-pUy1vdUT_6UsBVxHDlfBm5_XTmJPimYQSPSKV87mE2ND8kY41az8khGxQtGLQYp4A-YDLddT6ovI9GchwNDTJu_zitfvWvr4SDYYgzPmoJ5fZAXTH3OO_RkTyCb2n2i3wi2qr_-W2gTKLQjBajbGLV0A3x8JhqkDx-5gjn1nD4TWBHlbBy51sfFgMhCGVL3bKNadIIVTD_UbMYogrUMjofMqFRq6rh0BIwcWjOWO2ivKe8yB7jUemfo2H4PYv1Ut4v5zw', // Đảm bảo JWT token có đủ 3 phần header.payload.signature
  },

  // Các cấu hình khác
  TIMEOUT: 15000,
  DEBUG: true,
  MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtZ3ZxazFmbDBndnMyanIxMzN0dHV1eGcifQ.lhk4cDYUEIozqnFfkSebaw',
  MAPBOX_DOWNLOADS_TOKEN: 'sk.eyJ1IjoidmlldHZvMzcxIiwiYSI6ImNtaHgxZmgxMDA1c2cyanM0bzh3ampmcDkifQ.Dt8r7flOpb0eJTL8cAou6Q',
};

export default env;
