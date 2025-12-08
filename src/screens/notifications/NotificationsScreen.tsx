import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../../component/PageHeader';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, SCREEN_PADDING } from '../../theme';
import { useNotifications, Notification as WSNotification } from '../../hooks/useNotifications';
import { notificationService } from '../../services/notificationService';
import { Notification as APINotification } from '../../types/api/notification';

// Unified notification type
interface UnifiedNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
  source: 'api' | 'websocket';
}

const NotificationsScreen = () => {
  const navigation = useNavigation();
  
  // WebSocket notifications (realtime)
  const wsHook = useNotifications();
  console.log('🔍 wsHook:', wsHook);
  
  const [apiNotifications, setApiNotifications] = useState<APINotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Convert API notification to unified format
  const convertAPINotification = (n: APINotification): UnifiedNotification => {
    // Map API data structure to match WebSocket format
    const reportId = n.du_lieu_mo_rong?.phan_anh_id;
    
    return {
      id: `api-${n.id}`,
      type: n.loai || 'system',
      title: n.tieu_de,
      message: n.noi_dung,
      timestamp: new Date(n.ngay_tao),
      read: n.da_doc,
      data: reportId ? { id: reportId, ...n.du_lieu_mo_rong } : n.du_lieu_mo_rong,
      source: 'api',
    };
  };

  // Convert WebSocket notification to unified format
  const convertWSNotification = (n: WSNotification): UnifiedNotification => ({
    id: `ws-${n.id}`,
    type: n.type,
    title: n.title,
    message: n.message,
    timestamp: n.timestamp,
    read: n.read || false,
    data: n.data,
    source: 'websocket',
  });

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications();
      console.log('🔍 fetchNotifications response:', response);
      if (response.success) {
        setApiNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Merge and sort notifications
  const wsNotifsArray = wsHook?.notifications || [];
  const allNotifications: UnifiedNotification[] = [
    ...wsNotifsArray.map(convertWSNotification),
    ...apiNotifications.map(convertAPINotification),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const handleMarkAllRead = async () => {
    // Mark WebSocket notifications as read
    if (wsHook?.markAllAsRead) {
      wsHook.markAllAsRead();
    }
    
    // Mark API notifications as read
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationPress = async (item: UnifiedNotification) => {
    console.log('🔔 Notification pressed:', item);
    
    // Mark as read based on source
    if (!item.read) {
      console.log('📖 Marking as read...');
      if (item.source === 'websocket') {
        if (wsHook?.markAsRead) {
          wsHook.markAsRead(item.id.replace('ws-', ''));
        }
      } else {
        try {
          const apiId = parseInt(item.id.replace('api-', ''));
          await notificationService.markAsRead(apiId);
          // Optimistic update
          setApiNotifications(prev =>
            prev.map(n => n.id === apiId ? { ...n, da_doc: true } : n)
          );
        } catch (error) {
          console.error('Error marking as read:', error);
        }
      }
    }

    // Navigate to report detail if it's a report notification
    const isReportNotification = item.type === 'report_status' || 
                                  item.type === 'report_status_update';
    
    if (isReportNotification && item.data?.id) {
      console.log('🚀 Navigating to ReportDetail with ID:', item.data.id);
      navigation.navigate('ReportDetail' as any, { 
        reportId: item.data.id ,
        id: item.data.id
      } as any);
    } else {
      console.log('⚠️ No report data to navigate to. Type:', item.type, 'Data:', item.data);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'report_status':
      case 'report_status_update':
        return 'file-document-edit-outline';
      case 'points_updated':
        return 'star-circle';
      case 'wallet_updated':
        return 'wallet';
      case 'new_nearby_report':
        return 'map-marker-alert';
      default:
        return 'bell-outline';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'report_status':
      case 'report_status_update':
        return theme.colors.primary;
      case 'points_updated':
        return theme.colors.success;
      case 'wallet_updated':
        return theme.colors.warning;
      case 'new_nearby_report':
        return '#8B5CF6';
      default:
        return theme.colors.textSecondary;
    }
  };

  const renderItem = ({ item }: { item: UnifiedNotification }) => {
    const isReportNotification = item.type === 'report_status' || 
                                  item.type === 'report_status_update';
    const hasReportDetail = isReportNotification && item.data?.id;
    
    return (
      <TouchableOpacity
        style={[styles.itemContainer, !item.read && styles.unreadItem]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: getColorForType(item.type) + '15' }]}>
          <Icon name={getIconForType(item.type)} size={24} color={getColorForType(item.type)} />
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, !item.read && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.itemBody} numberOfLines={2}>{item.message}</Text>
          
          <View style={styles.itemFooter}>
            <Text style={styles.itemTime}>
              {new Date(item.timestamp).toLocaleDateString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              })}
            </Text>
            
            {hasReportDetail && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleNotificationPress(item);
                }}
              >
                <Text style={styles.actionText}>Xem chi tiết</Text>
                <Icon name="chevron-right" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader
        title="Thông báo"
        variant="default"
        rightIcon="check-all"
        onRightPress={handleMarkAllRead}
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={allNotifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="bell-sleep-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Không có thông báo nào</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: SCREEN_PADDING.horizontal,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    ...theme.shadows.sm,
  },
  unreadItem: {
    backgroundColor: theme.colors.primary + '05', // Slight tint
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  unreadText: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  itemBody: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTime: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: BORDER_RADIUS.sm,
  },
  actionText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.primary,
    fontWeight: '600',
    marginRight: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: SPACING['4xl'],
  },
  emptyText: {
    marginTop: SPACING.md,
    color: theme.colors.textSecondary,
    fontSize: FONT_SIZE.md,
  },
});

export default NotificationsScreen;


