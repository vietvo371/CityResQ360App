import PushNotificationHelper from '../utils/PushNotificationHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from './authService';

const FCM_TOKEN_KEY = '@fcm_token';

class NotificationTokenService {
  /**
   * Lưu FCM token vào AsyncStorage
   */
  static async saveFCMToken(token: string) {
    try {
      await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
      console.log('FCM token đã được lưu vào AsyncStorage');
    } catch (error) {
      console.error('Lỗi khi lưu FCM token:', error);
    }
  }

  /**
   * Lấy FCM token từ AsyncStorage
   */
  static async getSavedFCMToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(FCM_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Lỗi khi lấy FCM token từ AsyncStorage:', error);
      return null;
    }
  }

  /**
   * Xóa FCM token khỏi AsyncStorage
   */
  static async clearFCMToken() {
    try {
      await AsyncStorage.removeItem(FCM_TOKEN_KEY);
      console.log('FCM token đã được xóa khỏi AsyncStorage');
    } catch (error) {
      console.error('Lỗi khi xóa FCM token:', error);
    }
  }

  /**
   * Đăng ký FCM token với server khi user đăng nhập
   * Sử dụng authService.updateFcmToken có sẵn
   */
  static async registerTokenAfterLogin() {
    try {
      // Kiểm tra quyền thông báo
      const hasPermission = await PushNotificationHelper.checkPermission();
      
      if (!hasPermission) {
        console.log('Chưa có quyền thông báo, yêu cầu quyền...');
        const granted = await PushNotificationHelper.requestPermission();
        
        if (!granted) {
          console.log('Người dùng từ chối quyền thông báo');
          return false;
        }
      }

      // Lấy FCM token
      const fcmToken = await PushNotificationHelper.getToken();
      
      if (!fcmToken) {
        console.error('Không thể lấy FCM token');
        return false;
      }

      // Lưu token vào AsyncStorage
      await this.saveFCMToken(fcmToken);

      // Gửi token lên server bằng authService
      await authService.updateFcmToken(fcmToken);
      console.log('Đã đăng ký FCM token thành công với server');
      return true;
    } catch (error) {
      console.error('Lỗi trong quá trình đăng ký FCM token:', error);
      return false;
    }
  }

  /**
   * Hủy đăng ký FCM token khi user đăng xuất
   */
  static async unregisterTokenAfterLogout() {
    try {
      // Gửi empty token hoặc xóa token trên server
      try {
        await authService.updateFcmToken('');
        console.log('Đã hủy đăng ký FCM token với server');
      } catch (error) {
        console.log('Lỗi khi hủy đăng ký FCM token với server:', error);
      }

      // Xóa token khỏi Firebase
      await PushNotificationHelper.deleteToken();

      // Xóa token khỏi AsyncStorage
      await this.clearFCMToken();

      return true;
    } catch (error) {
      console.error('Lỗi khi hủy đăng ký FCM token:', error);
      return false;
    }
  }

  /**
   * Cập nhật FCM token khi token bị refresh
   */
  static async updateTokenOnRefresh(newToken: string) {
    try {
      // Lưu token mới vào AsyncStorage
      await this.saveFCMToken(newToken);

      // Gửi token mới lên server bằng authService
      await authService.updateFcmToken(newToken);
      console.log('Đã cập nhật FCM token mới với server');
      return true;
    } catch (error) {
      console.error('Lỗi khi cập nhật FCM token:', error);
      return false;
    }
  }
}

export default NotificationTokenService;
