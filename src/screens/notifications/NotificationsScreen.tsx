import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../../component/PageHeader';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, SCREEN_PADDING } from '../../theme';
import { notificationService } from '../../services/notificationService';
import { Notification } from '../../types/api/notification';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await notificationService.getNotifications();
      if (response.success) {
        setNotifications(response.data);
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

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationPress = async (item: Notification) => {
    if (!item.da_doc) {
      try {
        await notificationService.markAsRead(item.id);
        // Optimistic update
        setNotifications(prev =>
          prev.map(n => n.id === item.id ? { ...n, da_doc: true } : n)
        );
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }

    // Navigate based on type/data if needed
    // if (item.data?.report_id) navigation.navigate('ReportDetail', { id: item.data.report_id });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'system': return 'information';
      case 'report_update': return 'file-document-edit-outline';
      case 'reward': return 'gift-outline';
      case 'warning': return 'alert-circle-outline';
      default: return 'bell-outline';
    }
  };

  const getColorForType = (type: string) => {
    switch (type) {
      case 'system': return theme.colors.info;
      case 'report_update': return theme.colors.primary;
      case 'reward': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.itemContainer, !item.da_doc && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getColorForType(item.loai) + '15' }]}>
        <Icon name={getIconForType(item.loai)} size={24} color={getColorForType(item.loai)} />
      </View>
      <View style={styles.itemContent}>
        <Text style={[styles.itemTitle, !item.da_doc && styles.unreadText]}>{item.tieu_de}</Text>
        <Text style={styles.itemBody} numberOfLines={2}>{item.noi_dung}</Text>
        <Text style={styles.itemTime}>
          {new Date(item.ngay_tao).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      {!item.da_doc && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

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
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
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
    marginBottom: 4,
  },
  itemTime: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
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


