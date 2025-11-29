import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null); // Reset error state

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
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
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
      subtitle: 'Danh sách báo cáo',
      icon: 'file-document-outline',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Reports'),
    },
    {
      id: 'my-reports',
      title: 'Của tôi',
      subtitle: 'Lịch sử phản ánh',
      icon: 'file-document-outline',
      color: theme.colors.info,
      onPress: () => navigation.navigate('MainTabs', { screen: 'Profile' }),

    },
    {
      id: 'map',
      title: 'Bản đồ',
      subtitle: 'Xem trên bản đồ',
      icon: 'map-outline',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('MainTabs', { screen: 'Map' }),
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
        <View style={styles.headerLeft}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user?.ho_ten?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.headerDate}>
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={styles.headerGreeting}>
              Xin chào, {user?.ho_ten?.split(' ').pop() || 'Cư dân'}! 👋
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell-outline" size={ICON_SIZE.md} color={theme.colors.white} />
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
        <View style={styles.locationBadge}>
          <Icon name="map-marker" size={ICON_SIZE.xs} color={theme.colors.white} />
          <Text style={styles.locationText}>TP. Hồ Chí Minh</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.backgroundSecondary} />

      {renderHeader()}

      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle-outline" size={ICON_SIZE.md} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Dashboard Stats */}
        <View style={styles.section}>
          <View style={styles.statsRow}>
            {getStatsCards().map((stat, index) => (
              <TouchableOpacity
                key={stat.id}
                style={[styles.statCard, {
                  backgroundColor:
                    index === 0 ? theme.colors.primary
                      : index === 1 ? theme.colors.success
                        : theme.colors.warning
                }]}
                activeOpacity={0.8}
              >
                <View style={styles.statIconContainer}>
                  <Icon name={stat.icon} size={ICON_SIZE.xl} color="rgba(255, 255, 255, 0.9)" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                  <View style={styles.statTrend}>
                    <Icon
                      name={stat.trend === 'up' ? 'trending-up' : 'trending-down'}
                      size={ICON_SIZE.xs}
                      color="rgba(255, 255, 255, 0.9)"
                    />
                    <Text style={styles.statChange}>{stat.change}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Chức năng chính</Text>
            <View style={styles.sectionDivider} />
          </View>
          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionItem}
                onPress={action.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.actionCard}>
                  <View style={[styles.actionIconBox, { backgroundColor: action.color }]}>
                    <Icon name={action.icon} size={ICON_SIZE.xl} color={theme.colors.white} />
                  </View>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                  <View style={styles.actionArrow}>
                    <Icon name="chevron-right" size={ICON_SIZE.sm} color={theme.colors.textSecondary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Categories Section */}
        {statsData?.top_danh_muc && statsData.top_danh_muc.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Danh mục phổ biến</Text>
              <View style={styles.sectionDivider} />
            </View>
            <View style={styles.categoryCard}>
              {statsData.top_danh_muc.slice(0, 5).map((category, index) => {
                const percentage = statsData.tong_phan_anh > 0
                  ? ((category.total / statsData.tong_phan_anh) * 100).toFixed(1)
                  : '0';
                return (
                  <View key={category.danh_muc} style={styles.categoryItem}>
                    <View style={styles.categoryLeft}>
                      <View style={[styles.categoryRank, {
                        backgroundColor: index === 0 ? theme.colors.primary : theme.colors.backgroundSecondary
                      }]}>
                        <Text style={[styles.categoryRankText, {
                          color: index === 0 ? theme.colors.white : theme.colors.textSecondary
                        }]}>
                          #{index + 1}
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
                      {/* <Text style={styles.categoryCount}>{category.total}</Text> */}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: SPACING.md }}>
              <Text style={styles.sectionTitle}>Sự cố mới nhất</Text>
              <View style={[styles.sectionDivider, { flex: 1, maxWidth: 100 }]} />
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Reports' })}>
              <Text style={styles.seeAllLink}>Xem tất cả →</Text>
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
              <Text style={styles.emptySubtext}>Hãy là người đầu tiên báo cáo sự cố trong khu vực</Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('CreateReport')}
              >
                <Icon name="plus-circle-outline" size={ICON_SIZE.md} color={theme.colors.white} />
                <Text style={styles.emptyButtonText}>Tạo phản ánh mới</Text>
              </TouchableOpacity>
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
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  // Header Styles
  headerContainer: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingTop: SPACING.md,
    paddingBottom: SPACING['2xl'],
    borderBottomLeftRadius: BORDER_RADIUS['2xl'],
    borderBottomRightRadius: BORDER_RADIUS['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  avatarCircle: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  greetingContainer: {
    flex: 1,
  },
  headerDate: {
    fontSize: FONT_SIZE['2xs'],
    color: 'rgba(255, 255, 255, 0.85)',
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  headerGreeting: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.white,
  },
  notificationBtn: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('5.5%'),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  emptyButtonText: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  locationBar: {
    marginTop: SPACING.md,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  locationText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.white,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SCREEN_PADDING.horizontal,
    paddingBottom: SPACING['4xl'],
    marginTop: SPACING['2xl'],
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
  },
  seeAllLink: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  // Stats Card Styles
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: -SPACING['3xl'],
  },
  statCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    minHeight: hp('16%'),
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  statIconContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statContent: {
    marginTop: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE['3xl'],
    fontWeight: '800',
    color: theme.colors.white,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  statTitle: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  statTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChange: {
    fontSize: FONT_SIZE.xs,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
  },
  // Section Header Styles
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  sectionDivider: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.primary + '30',
    borderRadius: 1,
  },
  // Action Grid Styles
  actionGrid: {
    gap: SPACING.md,
  },
  actionItem: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    gap: SPACING.md,
  },
  actionIconBox: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  actionArrow: {
    opacity: 0.5,
  },
  // Report Item Styles
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
  categoryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    ...theme.shadows.md,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight + '40',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  categoryRank: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryRankText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: SPACING.xs,
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
  },
  categoryProgress: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorLight || theme.colors.error + '15',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  errorText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: theme.colors.error,
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: theme.colors.error,
    borderRadius: BORDER_RADIUS.sm,
  },
  retryButtonText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.white,
    fontWeight: '600',
  },
});

export default HomeScreen;

