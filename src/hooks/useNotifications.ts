import { useEffect, useState } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  type: 'report_status' | 'points_updated' | 'new_nearby_report' | 'wallet_updated';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  read?: boolean;
}

export const useNotifications = () => {
  const { isConnected, subscribe, unsubscribe, listen } = useWebSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isConnected || !user?.id) return;

    // Subscribe to user's private channel
    const userChannel = `private-user.${user.id}`;
    subscribe(userChannel);

    // Listen to report status updates
    // Laravel Echo events có thể dùng dot notation hoặc event class names
    listen(userChannel, 'report.status.updated', (data) => {
      console.log('📢 Report status updated:', data);
      
      const notification: Notification = {
        id: `report-${Date.now()}`,
        type: 'report_status',
        title: 'Cập nhật phản ánh',
        message: `Phản ánh "${data.report?.tieu_de || data?.tieu_de || 'của bạn'}" đã được ${getStatusText(data.report?.trang_thai || data?.trang_thai)}`,
        data: data.report || data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen to points updates
    listen(userChannel, 'points.updated', (data) => {
      console.log('💰 Points updated:', data);
      
      const notification: Notification = {
        id: `points-${Date.now()}`,
        type: 'points_updated',
        title: 'Điểm uy tín thay đổi',
        message: `${data.change > 0 ? '+' : ''}${data.change} điểm. Tổng: ${data.new_balance}`,
        data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen to wallet updates
    listen(userChannel, 'wallet.updated', (data) => {
      console.log('💰 Wallet updated:', data);
      
      const notification: Notification = {
        id: `wallet-${Date.now()}`,
        type: 'wallet_updated',
        title: 'Cập nhật ví',
        message: `Số dư ví: ${data.balance} điểm`,
        data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Listen to notification sent event
    listen(userChannel, 'notification.sent', (data) => {
      console.log('🔔 Notification sent:', data);
      
      const notification: Notification = {
        id: `notif-${Date.now()}`,
        type: 'report_status',
        title: data.title || 'Thông báo mới',
        message: data.message || '',
        data,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
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
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
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
