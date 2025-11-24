import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomIcon from '../../component/CustomIcon';
import PageHeader from '../../component/PageHeader';
import {
  theme,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  ICON_SIZE,
  CARD,
  wp,
  hp,
} from '../../theme';

const childrenData = [
  { id: '1', name: 'Nguyễn Văn A', classCode: 'IELTS-6A', status: 'Đang học', statusKey: 'in-progress', completed: 12, total: 24, teacher: 'Mr. John', schedule: 'T2, T4, T6' },
  { id: '2', name: 'Nguyễn Thị B', classCode: 'TOEIC-900', status: 'Đã học xong', statusKey: 'done', completed: 30, total: 30, teacher: 'Ms. Anna', schedule: 'T3, T5, T7' },
];

const STATUS_STYLES: Record<
  string,
  { color: string; icon: string; label: string }
> = {
  repeat: { color: '#2563EB', icon: 'refresh', label: 'Học lại' },
  done: { color: '#10B981', icon: 'check-circle', label: 'Hoàn thành' },
  'in-progress': { color: '#F59E0B', icon: 'progress-clock', label: 'Đang học' },
  stopped: { color: '#EF4444', icon: 'alert-octagon', label: 'Dừng học' },
  'not-started': { color: '#6B7280', icon: 'pause-circle', label: 'Chưa học' },
};

const overviewStats = [
  { id: 'children', label: 'Số con', value: '2', icon: 'stats/book-education', color: theme.colors.primary, iconType: 'custom' as const },
  { id: 'completed', label: 'Hoàn thành', value: '5', icon: 'stats/check-circle', color: theme.colors.success, iconType: 'custom' as const },
  { id: 'in-progress', label: 'Đang học', value: '2', icon: 'stats/clock', color: '#F59E0B', iconType: 'custom' as const },
];

const ParentHomePage = () => {
  const progressAnimations = useRef(childrenData.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = childrenData.map((child, index) =>
      Animated.timing(progressAnimations[index], {
        toValue: (child.completed / child.total) * 100,
        duration: 800,
        delay: index * 120,
        useNativeDriver: false,
      }),
    );
    Animated.stagger(150, animations).start();
  }, [progressAnimations]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <PageHeader 
          title="Phụ Huynh"
          subtitle="Xin chào"
          variant="gradient"
          showNotification={true}
          notificationCount={3}
          onNotificationPress={() => console.log('Notification pressed')}
        />

        {/* Stats Overview Cards */}
        <View style={styles.statsContainer}>
          {overviewStats.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.statCard,
                { marginRight: index === overviewStats.length - 1 ? 0 : SPACING.md }
              ]}
            >
              <View style={[styles.statIconWrapper, { backgroundColor: theme.colors.backgroundSecondary }]}>
                {item.iconType === 'custom' ? (
                  <CustomIcon name={item.icon} size={ICON_SIZE.md} />
                ) : (
                  <Icon name={item.icon} size={ICON_SIZE.md} color={item.color} />
                )}
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Children Section */}
        <View style={styles.childrenSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Con của bạn</Text>
          </View>

          {childrenData.map((child, index) => {
            const status = STATUS_STYLES[child.statusKey] || STATUS_STYLES['not-started'];
            const progressPercent = Math.round((child.completed / child.total) * 100);
            const progressWidth = progressAnimations[index].interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            });

            return (
              <TouchableOpacity key={child.id} style={styles.childCard} activeOpacity={0.7}>
                <View style={styles.childCardHeader}>
                  <View style={[styles.childIconWrapper, { backgroundColor: status.color + '15' }]}>
                    <Icon name="account-circle" size={ICON_SIZE.md} color={status.color} />
                  </View>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.classCode}>Lớp: {child.classCode}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
                    <Icon name={status.icon} size={ICON_SIZE.xs} color={status.color} />
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.childDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="account-outline" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{child.teacher}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="calendar-outline" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{child.schedule}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Tiến độ</Text>
                    <Text style={styles.progressValue}>
                      {child.completed}/{child.total} buổi
                    </Text>
                  </View>

                  <View style={styles.progressBarContainer}>
                    <Animated.View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: status.color,
                          width: progressWidth,
                        },
                      ]}
                    />
                  </View>

                  <Text style={[styles.progressPercent, { color: status.color }]}>
                    {progressPercent}% hoàn thành
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  scrollContent: {
    paddingBottom: SPACING['4xl'],
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  statIconWrapper: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE['2xs'],
    color: theme.colors.textSecondary,
    marginTop: SPACING.xs / 2,
  },

  // Children Section
  childrenSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  childCard: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...theme.shadows.md,
  },
  childCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  childIconWrapper: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: FONT_SIZE.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  classCode: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  statusBadge: {
    width: wp('8%'),
    height: wp('8%'),
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: SPACING.md,
  },
  childDetails: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  progressLabel: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  progressValue: {
    fontSize: FONT_SIZE.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressPercent: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  bottomSpacing: {
    height: SPACING['2xl'],
  },
});

export default ParentHomePage;

