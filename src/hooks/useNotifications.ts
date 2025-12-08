import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';
import { notificationService } from '../services/notificationService';

export interface Notification {
  id: string;
  type: 'report_status' | 'points_updated' | 'new_nearby_report' | 'wallet_updated';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read?: boolean;
}

// Callback type for refresh actions
type RefreshCallback = () => void;
let refreshCallbacks: RefreshCallback[] = [];

export const useNotifications = () => {
  const { isConnected, subscribe, unsubscribe, listen, subscribePusher } = useWebSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Function to fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        console.log('📊 Unread count from API:', response.data.count);
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error);
    }
  }, []);

  // Function to register refresh callback
  const registerRefreshCallback = useCallback((callback: RefreshCallback) => {
    refreshCallbacks.push(callback);
    return () => {
      refreshCallbacks = refreshCallbacks.filter(cb => cb !== callback);
    };
  }, []);

  // Function to trigger all refresh callbacks
  const triggerRefresh = useCallback(() => {
    console.log('🔄 Triggering refresh callbacks:', refreshCallbacks.length);
    refreshCallbacks.forEach(callback => callback());
  }, []);

  // Fetch unread count on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount();
    }
  }, [user?.id, fetchUnreadCount]);

  useEffect(() => {
    if (!isConnected || !user?.id) {
      console.log('⚠️ useNotifications - Not ready:', { isConnected, userId: user?.id });
      return;
    }

    console.log('🎯 Setting up WebSocket listeners for user:', user.id);

    // Subscribe to user's private channel
    const userChannel = `private-user.${user.id}`;
    subscribe(userChannel);

    // Subscribe to public user-reports channel
    const publicChannel = 'user-reports';
    subscribe(publicChannel);

    // Handler cho report status updates
    const handleReportStatusUpdate = (data: any) => {
      console.log('📢 Report status updated:', data);
      console.log('📢 Event data structure:', JSON.stringify(data, null, 2));
      
      // Backend gửi: { report_id, old_status, new_status, status_text, report: {...} }
      const reportTitle = data.report?.tieu_de || 'Phản ánh của bạn';
      const newStatus = data.new_status ?? data.report?.trang_thai;
      const oldStatus = data.old_status;
      const statusText = data.status_text || getStatusText(newStatus);
      
      // Tạo message dựa trên status change
      let message = '';
      let icon = '';
      
      switch (newStatus) {
        case 0: // Tiếp nhận
          message = `"${reportTitle}" đã được tiếp nhận`;
          break;
        case 1: // Xác minh
          message = `"${reportTitle}" đang được xác minh`;
          break;
        case 2: // Đang xử lý
          message = `"${reportTitle}" đang được xử lý`;
          break;
        case 3: // Hoàn thành
          message = `"${reportTitle}" đã hoàn thành`;
          break;
        case 4: // Từ chối
          message = `"${reportTitle}" đã bị từ chối`;
          break;
        default:
          message = `"${reportTitle}" đã cập nhật: ${statusText}`;
      }
      
      const notification: Notification = {
        id: `report-${data.report_id || Date.now()}`,
        type: 'report_status',
        title: 'Cập nhật trạng thái',
        message: message,
        data: {
          ...data.report,
          old_status: oldStatus,
          new_status: newStatus,
          status_text: statusText,
        },
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      
      console.log('✅ Notification created:', notification);
      
      // Fetch updated unread count from API
      fetchUnreadCount();
      
      // Trigger refresh for HomeScreen and Map
      triggerRefresh();
    };

    // Listen to report status updates - TRY MULTIPLE EVENT NAME FORMATS
    // Method 1: Laravel Echo API
    try {
      listen(userChannel, 'report.status.updated', handleReportStatusUpdate);
      listen(userChannel, 'App\\Events\\ReportStatusUpdated', handleReportStatusUpdate);
      listen(userChannel, 'App\\Events\\ReportStatusUpdatedForUsers', handleReportStatusUpdate);
      listen(publicChannel, 'report.status.updated', handleReportStatusUpdate);
      listen(publicChannel, 'App\\Events\\ReportStatusUpdatedForUsers', handleReportStatusUpdate);
      console.log('✅ Registered Echo listeners for report.status.updated (5 formats)');
    } catch (error) {
      console.error('❌ Failed to register Echo listeners:', error);
    }
    
    // Method 2: Pusher API trực tiếp (backup method)
    try {
      subscribePusher('user-reports', 'report.status.updated', (data: any) => {
        console.log('📩 [Pusher] Received report.status.updated:', data);
        handleReportStatusUpdate(data);
      });
      console.log('✅ Registered Pusher listener for user-reports channel');
    } catch (error) {
      console.error('❌ Failed to register Pusher listener:', error);
    }

    // Listen to points updates
    listen(userChannel, 'points.updated', (data) => {
      console.log('💰 Points updated:', data);
      
      const change = data.change || data.points_change || 0;
      const newBalance = data.new_balance || data.total_points || data.points || 0;
      const reason = data.reason || data.ly_do || 'Cập nhật điểm';
      
      const notification: Notification = {
        id: `points-${Date.now()}`,
        type: 'points_updated',
        title: change > 0 ? 'Điểm uy tín tăng' : 'Điểm uy tín giảm',
        message: `${change > 0 ? '+' : ''}${change} điểm (${reason}). Tổng: ${newBalance} điểm`,
        data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      fetchUnreadCount();
      triggerRefresh();
    });

    // Listen to wallet updates
    listen(userChannel, 'wallet.updated', (data) => {
      console.log('💰 Wallet updated:', data);
      
      const change = data.change || data.amount || data.so_tien || 0;
      const newBalance = data.new_balance || data.balance || data.so_du || 0;
      const reason = data.reason || data.ly_do || data.mo_ta || 'Cập nhật ví';
      
      const notification: Notification = {
        id: `wallet-${Date.now()}`,
        type: 'wallet_updated',
        title: change > 0 ? 'Ví tăng' : 'Ví giảm',
        message: `${change > 0 ? '+' : ''}${Math.abs(change).toLocaleString('vi-VN')} VNĐ (${reason})\nSố dư: ${newBalance.toLocaleString('vi-VN')} VNĐ`,
        data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      fetchUnreadCount();
      triggerRefresh();
    });

    // Listen to notification sent event
    listen(userChannel, 'notification.sent', (data) => {
      console.log('🔔 Notification sent:', data);
      
      const notification: Notification = {
        id: `notif-${data.id || Date.now()}`,
        type: data.type || 'report_status',
        title: data.title || data.tieu_de || 'Thông báo mới',
        message: data.message || data.noi_dung || '',
        data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      fetchUnreadCount();
      triggerRefresh();
    });

    // Cleanup
    return () => {
      unsubscribe(userChannel);
    };
  }, [isConnected, user?.id]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    // Refetch unread count from API
    fetchUnreadCount();
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Refetch unread count from API
    fetchUnreadCount();
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    registerRefreshCallback,
  };
};

// Helper functions
function getStatusText(status: number): string {
  switch (status) {
    case 0: return 'tiếp nhận';
    case 1: return 'xác minh';
    case 2: return 'đang xử lý';
    case 3: return 'hoàn thành';
    case 4: return 'từ chối';
    default: return 'cập nhật';
  }
}
