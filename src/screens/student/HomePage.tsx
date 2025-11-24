import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
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

const courseRoutes = [
  { id: '1', name: 'IELTS Intermediate', classCode: 'IELTS-6A', status: 'Đã học lại', statusKey: 'repeat', completed: 12, total: 24, teacher: 'Mr. John', schedule: 'T2, T4, T6' },
  { id: '2', name: 'TOEIC Premium', classCode: 'TOEIC-900', status: 'Đã học xong', statusKey: 'done', completed: 30, total: 30, teacher: 'Ms. Anna', schedule: 'T3, T5, T7' },
  { id: '3', name: 'Giao tiếp Doanh nghiệp', classCode: 'BUS-ENG-02', status: 'Đang học', statusKey: 'in-progress', completed: 15, total: 20, teacher: 'Mr. David', schedule: 'T2, T4' },
  { id: '4', name: 'Phát âm cơ bản', classCode: 'PRON-101', status: 'Chưa học', statusKey: 'not-started', completed: 0, total: 16, teacher: 'Ms. Sarah', schedule: 'T3, T6' },
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
  { id: 'total', label: 'Tổng khóa', value: '8', icon: require('../../assets/icons/flaticon/stats/book-education.png'), color: theme.colors.primary },
  { id: 'completed', label: 'Hoàn thành', value: '5', icon: require('../../assets/icons/flaticon/stats/check-circle.png'), color: theme.colors.success },
  { id: 'in-progress', label: 'Đang học', value: '2', icon: require('../../assets/icons/flaticon/stats/clock.png'), color: '#F59E0B' },
];

const HomePage = () => {
  const progressAnimations = useRef(courseRoutes.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = courseRoutes.map((route, index) =>
      Animated.timing(progressAnimations[index], {
        toValue: (route.completed / route.total) * 100,
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
          title="Học viên WISE"
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
                <Image source={item.icon} style={styles.iconStats} />
              </View>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Courses Section */}
        <View style={styles.coursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Khóa học của bạn</Text>

          </View>

          {courseRoutes.map((course, index) => {
            const status = STATUS_STYLES[course.statusKey] || STATUS_STYLES['not-started'];
            const progressPercent = Math.round((course.completed / course.total) * 100);
            const progressWidth = progressAnimations[index].interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            });

            return (
              <TouchableOpacity key={course.id} style={styles.courseCard} activeOpacity={0.7}>
                <View style={styles.courseCardHeader}>
                  <View style={[styles.courseIconWrapper, { backgroundColor: status.color + '15' }]}>
                    <Icon name="book-open-variant" size={ICON_SIZE.md} color={status.color} />
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseName}>{course.name}</Text>
                    <Text style={styles.classCode}>Lớp: {course.classCode}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: status.color + '15' }]}>
                    <Icon name={status.icon} size={ICON_SIZE.xs} color={status.color} />
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.courseDetails}>
                  <View style={styles.detailRow}>
                    <Icon name="account-outline" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{course.teacher}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Icon name="calendar-outline" size={ICON_SIZE.xs} color={theme.colors.textSecondary} />
                    <Text style={styles.detailText}>{course.schedule}</Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Tiến độ</Text>
                    <Text style={styles.progressValue}>
                      {course.completed}/{course.total} buổi
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
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  statIconWrapper: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  iconStats: {
    width: wp('11%'),
    height: wp('11%'),
  },
  statValue: {
    fontSize: FONT_SIZE['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },

  // Courses Section
  coursesSection: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },

  // Course Card
  courseCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.xl,
    ...theme.shadows.md,
  },
  courseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  courseIconWrapper: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  courseInfo: {
    flex: 1,
  },
  courseName: {
    fontSize: FONT_SIZE.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  classCode: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  statusBadge: {
    width: wp('9%'),
    height: wp('9%'),
    borderRadius: wp('4.5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: SPACING.md,
  },

  // Course Details
  courseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    flex: 1,
  },
  detailText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },

  // Progress Section
  progressSection: {
    marginTop: SPACING.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  progressValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  progressPercent: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'right',
  },

  bottomSpacing: {
    height: SPACING['3xl'],
  },
});

export default HomePage;
