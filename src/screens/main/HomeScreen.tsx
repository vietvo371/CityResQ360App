import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  theme,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  ICON_SIZE,
  SCREEN_PADDING,
  CARD,
  LIST_ITEM,
  cardStyles,
  textStyles,
  containerStyles,
  wp,
  hp,
} from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services/notificationService';
import { statsService } from '../../services/statsService';
import { reportService } from '../../services/reportService';
import { Report } from '../../types/api/report';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TopCategory {
  danh_muc: number;
  danh_muc_text: string;
  total: number;
}

interface StatsData {
  tong_phan_anh: number;
  da_giai_quyet: number;
  dang_xu_ly: number;
  ty_le_giai_quyet?: number;
  thoi_gian_xu_ly_trung_binh?: number;
  top_danh_muc?: TopCategory[];
}

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsResponse = await statsService.getCityStats();
      console.log('statsResponse', statsResponse);
      if (statsResponse.success) {
        setStatsData({
          tong_phan_anh: statsResponse.data.tong_phan_anh || 0,
          da_giai_quyet: statsResponse.data.da_giai_quyet || 0,
          dang_xu_ly: statsResponse.data.dang_xu_ly || 0,
          ty_le_giai_quyet: statsResponse.data.ty_le_giai_quyet,
          thoi_gian_xu_ly_trung_binh: statsResponse.data.thoi_gian_xu_ly_trung_binh,
          top_danh_muc: statsResponse.data.top_danh_muc,
        });
      }

      // Fetch recent reports
      const reportsResponse = await reportService.getReports({
        page: 1,
        per_page: 3,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      console.log('reportsResponse', reportsResponse);
      if (reportsResponse.success && reportsResponse.data) {
        setRecentReports(reportsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        if (response.success) {
          setUnreadCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    fetchData();

    // Optional: Poll every minute or use socket if available
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    // Also refresh unread count
    try {
      const response = await notificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  }, []);

  const quickActions = [
    {
      id: 'create-report',
      title: 'Báo cáo',
      subtitle: 'Gửi phản ánh mới',
      icon: 'plus-box-outline',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('CreateReport'),
    },
    {
      id: 'my-reports',
      title: 'Của tôi',
      subtitle: 'Lịch sử phản ánh',
      icon: 'file-document-outline',
      color: theme.colors.info,
      onPress: () => navigation.navigate('MyReports'),
    },
    {
      id: 'nearby',
      title: 'Gần đây',
      subtitle: 'Sự cố quanh bạn',
      icon: 'map-marker-radius-outline',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('NearbyReports'),
    },
    {
      id: 'stats',
      title: 'Thống kê',
      subtitle: 'Dữ liệu tổng hợp',
      icon: 'chart-box-outline',
      color: theme.colors.success,
      onPress: () => navigation.navigate('Dashboard'),
    },
  ];

  // Dynamic stats from API
  const getStatsCards = () => {
    if (!statsData) {
      return [
        {
          id: 'total',
          title: 'Tổng phản ánh',
          value: '---',
          change: '--',
          trend: 'up' as const,
          icon: 'alert-circle-outline',
          color: theme.colors.primary,
        },
        {
          id: 'resolved',
          title: 'Đã giải quyết',
          value: '---',
          change: '--',
          trend: 'up' as const,
          icon: 'check-circle-outline',
          color: theme.colors.success,
        },
        {
          id: 'pending',
          title: 'Đang xử lý',
          value: '---',
          change: '--',
          trend: 'down' as const,
          icon: 'progress-clock',
          color: theme.colors.warning,
        },
      ];
    }

    const resolvedPercentage = statsData.ty_le_giai_quyet
      ? `${statsData.ty_le_giai_quyet.toFixed(1)}%`
      : '--';

    return [
      {
        id: 'total',
        title: 'Tổng phản ánh',
        value: formatNumber(statsData.tong_phan_anh),
        change: resolvedPercentage,
        trend: 'up' as const,
        icon: 'alert-circle-outline',
        color: theme.colors.primary,
      },
      {
        id: 'resolved',
        title: 'Đã giải quyết',
        value: formatNumber(statsData.da_giai_quyet),
        change: resolvedPercentage,
        trend: 'up' as const,
        icon: 'check-circle-outline',
        color: theme.colors.success,
      },
      {
        id: 'pending',
        title: 'Đang xử lý',
        value: formatNumber(statsData.dang_xu_ly),
        change: statsData.thoi_gian_xu_ly_trung_binh
          ? `${Math.round(statsData.thoi_gian_xu_ly_trung_binh)}h`
          : '--',
        trend: 'down' as const,
        icon: 'progress-clock',
        color: theme.colors.warning,
      },
    ];
  };

  const getCategoryColor = (categoryId: number): string => {
    const colors = [
      theme.colors.primary,   // 0: Giao thông
      theme.colors.success,   // 1: Môi trường
      theme.colors.error,     // 2: Cháy nổ
      theme.colors.warning,   // 3: Rác thải
      theme.colors.info,      // 4: Ngập lụt
    ];
    return colors[categoryId] || theme.colors.textSecondary;
  };

  const getPriorityColor = (priorityLevel: number): string => {
    switch (priorityLevel) {
      case 3: return theme.colors.error;      // Khẩn cấp
      case 2: return theme.colors.warning;    // Cao
      case 1: return theme.colors.info;       // Trung bình
      default: return theme.colors.textSecondary; // Thấp
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 0: return theme.colors.warning;
      case 1: return theme.colors.info;
      case 2: return theme.colors.info;
      case 3: return theme.colors.success;
      case 4: return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case 0: return 'Tiếp nhận';
      case 1: return 'Đã xác minh';
      case 2: return 'Đang xử lý';
      case 3: return 'Hoàn thành';
      case 4: return 'Từ chối';
      default: return 'Khác';
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Không rõ';

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Không rõ';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return `${diffMins} phút trước`;
      } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
      } else if (diffDays === 1) {
        return 'Hôm qua';
      } else if (diffDays < 7) {
        return `${diffDays} ngày trước`;
      } else {
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      }
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Không rõ';
    }
  };

  const getCategoryName = (categoryId: number): string => {
    const categories: { [key: number]: string } = {
      0: 'Giao thông',
      1: 'Môi trường',
      2: 'Cháy nổ',
      3: 'Rác thải',
      4: 'Ngập lụt',
      5: 'Khác',
    };
    return categories[categoryId] || 'Khác';
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text style={styles.headerGreeting}>
            Xin chào, {user?.ho_ten || 'Cư dân'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell-outline" size={ICON_SIZE.md} color={theme.colors.text} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              {unreadCount < 10 && (
                <Text style={styles.badgeText}>{unreadCount}</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.locationBar}>
        <Icon name="map-marker-outline" size={ICON_SIZE.xs} color={theme.colors.primary} />
        <Text style={styles.locationText}>TP. Hồ Chí Minh</Text>
        <Icon name="chevron-down" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            {getStatsCards().map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Icon name={stat.icon} size={ICON_SIZE.sm} color={stat.color} />
                  <View style={[styles.trendBadge, { backgroundColor: stat.trend === 'up' ? theme.colors.successLight : theme.colors.errorLight }]}>
                    <Icon
                      name={stat.trend === 'up' ? 'arrow-up' : 'arrow-down'}
                      size={ICON_SIZE.xs * 0.7}
                      color={stat.trend === 'up' ? theme.colors.success : theme.colors.error}
                    />
                    <Text style={[styles.trendText, { color: stat.trend === 'up' ? theme.colors.success : theme.colors.error }]}>
                      {stat.change}
                    </Text>
                  </View>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chức năng chính</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionItem}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconBox, { backgroundColor: action.color + '10' }]}>
                  <Icon name={action.icon} size={ICON_SIZE.lg} color={action.color} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Categories Section */}
        {statsData?.top_danh_muc && statsData.top_danh_muc.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Danh mục phổ biến</Text>
            <View style={styles.categoryList}>
              {statsData.top_danh_muc.slice(0, 5).map((category, index) => {
                const percentage = statsData.tong_phan_anh > 0
                  ? ((category.total / statsData.tong_phan_anh) * 100).toFixed(1)
                  : '0';
                return (
                  <View key={category.danh_muc} style={styles.categoryItem}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryRank, {
                        backgroundColor: index === 0 ? theme.colors.primary + '15' : theme.colors.backgroundSecondary
                      }]}>
                        <Text style={[styles.categoryRankText, {
                          color: index === 0 ? theme.colors.primary : theme.colors.textSecondary
                        }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.categoryInfo}>
                        <Text style={styles.categoryName}>{category.danh_muc_text}</Text>
                        <View style={styles.categoryProgressBar}>
                          <View
                            style={[styles.categoryProgress, {
                              width: percentage + '%' as any,
                              backgroundColor: getCategoryColor(category.danh_muc)
                            }]}
                          />
                        </View>
                      </View>
                    </View>
                    <View style={styles.categoryRight}>
                      <Text style={styles.categoryCount}>{category.total}</Text>
                      <Text style={styles.categoryPercentage}>{percentage}%</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Recent Incidents List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự cố mới nhất</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReportList')}>
              <Text style={styles.seeAllLink}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : recentReports.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="inbox-outline" size={ICON_SIZE['2xl']} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Chưa có phản ánh nào</Text>
            </View>
          ) : (
            recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportItem}
                onPress={() => navigation.navigate('ReportDetail', { id: report.id, reportId: report.id })}
                activeOpacity={0.7}
              >
                <View style={[styles.priorityStrip, {
                  backgroundColor: getPriorityColor(report.uu_tien?.cap_do || 0)
                }]} />
                <View style={styles.reportMain}>
                  <View style={styles.reportTop}>
                    <Text style={styles.ticketId}>#{report.id.toString().padStart(6, '0')}</Text>
                    <View style={[styles.statusTag, {
                      backgroundColor: getStatusColor(report.trang_thai) + '15'
                    }]}>
                      <Text style={[styles.statusText, {
                        color: getStatusColor(report.trang_thai)
                      }]}>
                        {getStatusLabel(report.trang_thai)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportTitle} numberOfLines={1}>
                    {report.tieu_de}
                  </Text>
                  <View style={styles.reportFooter}>
                    <View style={styles.reportInfo}>
                      <Icon name="tag-outline" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
                      <Text style={styles.reportInfoText}>
                        {report.danh_muc?.ten_danh_muc || getCategoryName(report.danh_muc_id)}
                      </Text>
                    </View>
                    <View style={styles.reportInfo}>
                      <Icon name="clock-outline" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
                      <Text style={styles.reportInfoText}>
                        {formatDate(report.created_at)}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* System Status Footer */}
        <View style={styles.systemStatus}>
          <Icon name="server-network" size={ICON_SIZE.xs} color={theme.colors.success} />
          <Text style={styles.systemStatusText}>Hệ thống CityResQ360 hoạt động bình thường</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  headerContainer: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SCREEN_PADDING.vertical,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerDate: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
  },
  headerGreeting: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  notificationBtn: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: wp('2%'),
    right: wp('2%'),
    minWidth: wp('4.5%'),
    height: wp('4.5%'),
    borderRadius: wp('2.25%'),
    backgroundColor: theme.colors.error,
    borderWidth: 2,
    borderColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: FONT_SIZE['2xs'],
    fontWeight: '700',
  },
  loadingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    padding: SPACING['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginTop: SPACING.md,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  locationText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SCREEN_PADDING.horizontal,
    paddingBottom: SPACING['4xl'],
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: SPACING.md,
  },
  seeAllLink: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: CARD.paddingSmall,
    ...theme.shadows.sm,
    minHeight: hp('14%'),
    justifyContent: 'space-between',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  trendText: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: '700',
  },
  statValue: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionItem: {
    width: (wp('100%') - SCREEN_PADDING.horizontal * 2 - SPACING.md) / 2,
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: CARD.padding,
    flexDirection: 'column',
    ...theme.shadows.sm,
  },
  actionIconBox: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  reportItem: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.sm,
    minHeight: LIST_ITEM.medium,
  },
  priorityStrip: {
    width: wp('1%'),
    height: '100%',
  },
  reportMain: {
    flex: 1,
    padding: CARD.paddingSmall,
  },
  reportTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  ticketId: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  reportTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.sm,
  },
  reportFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  reportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportInfoText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  systemStatus: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.md,
    opacity: 0.7,
  },
  systemStatusText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  categoryList: {
    gap: SPACING.sm,
  },
  categoryItem: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.md,
    padding: CARD.paddingSmall,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.sm,
    marginBottom: SPACING.sm,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  categoryRank: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryRankText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  categoryProgressBar: {
    height: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    borderRadius: 2,
  },
  categoryRight: {
    alignItems: 'flex-end',
    marginLeft: SPACING.sm,
  },
  categoryCount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
  },
  categoryPercentage: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

export default HomeScreen;

