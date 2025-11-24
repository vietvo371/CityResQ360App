import React, { useState } from 'react';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch data from API
    setTimeout(() => setRefreshing(false), 1000);
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

  const statsData = [
    {
      id: 'total',
      title: 'Tổng sự cố',
      value: '1,247',
      change: '12%',
      trend: 'up',
      icon: 'alert-circle-outline',
      color: theme.colors.primary,
    },
    {
      id: 'resolved',
      title: 'Đã xử lý',
      value: '1,089',
      change: '8%',
      trend: 'up',
      icon: 'check-circle-outline',
      color: theme.colors.success,
    },
    {
      id: 'pending',
      title: 'Đang xử lý',
      value: '158',
      change: '5%',
      trend: 'down',
      icon: 'progress-clock',
      color: theme.colors.warning,
    },
  ];

  const recentReports = [
    {
      id: 1,
      title: 'Sụt lún mặt đường Nguyễn Huệ',
      category: 'Hạ tầng',
      status: 'pending',
      priority: 'high',
      time: '14:30 - Hôm nay',
      location: 'Quận 1, TP.HCM',
      ticketId: '#INC-2023-001',
    },
    {
      id: 2,
      title: 'Sự cố đèn chiếu sáng công cộng',
      category: 'Điện lực',
      status: 'in_progress',
      priority: 'medium',
      time: '09:15 - Hôm nay',
      location: 'Quận 3, TP.HCM',
      ticketId: '#INC-2023-002',
    },
    {
      id: 3,
      title: 'Tập kết rác thải sai quy định',
      category: 'Môi trường',
      status: 'resolved',
      priority: 'low',
      time: '16:45 - Hôm qua',
      location: 'Quận 7, TP.HCM',
      ticketId: '#INC-2023-003',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'in_progress': return theme.colors.info;
      case 'resolved': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Tiếp nhận';
      case 'in_progress': return 'Đang xử lý';
      case 'resolved': return 'Hoàn thành';
      default: return 'Khác';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return theme.colors.error;
      case 'medium': return theme.colors.warning;
      case 'low': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text style={styles.headerGreeting}>
            Xin chào, {user?.name || user?.fullName || 'Cư dân'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="bell-outline" size={ICON_SIZE.md} color={theme.colors.text} />
          <View style={styles.badge} />
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
            {statsData.map((stat) => (
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

        {/* Recent Incidents List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sự cố mới nhất</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ReportList')}>
              <Text style={styles.seeAllLink}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          {recentReports.map((report) => (
            <TouchableOpacity
              key={report.id}
              style={styles.reportItem}
              onPress={() => navigation.navigate('ReportDetail', { id: report.id })}
              activeOpacity={0.7}
            >
              <View style={[styles.priorityStrip, { backgroundColor: getPriorityColor(report.priority) }]} />
              <View style={styles.reportMain}>
                <View style={styles.reportTop}>
                  <Text style={styles.ticketId}>{report.ticketId}</Text>
                  <View style={[styles.statusTag, { backgroundColor: getStatusColor(report.status) + '15' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(report.status) }]}>
                      {getStatusLabel(report.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
                <View style={styles.reportFooter}>
                  <View style={styles.reportInfo}>
                    <Icon name="tag-outline" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
                    <Text style={styles.reportInfoText}>{report.category}</Text>
                  </View>
                  <View style={styles.reportInfo}>
                    <Icon name="clock-outline" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
                    <Text style={styles.reportInfoText}>{report.time}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    width: wp('2%'),
    height: wp('2%'),
    borderRadius: wp('1%'),
    backgroundColor: theme.colors.error,
    borderWidth: 1,
    borderColor: theme.colors.white,
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
});

export default HomeScreen;

