import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  theme,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  ICON_SIZE,
  AVATAR_SIZE,
  wp,
  hp,
} from '../../theme';
import PageHeader from '../../component/PageHeader';

const detailItems = [
  { id: 'phone', icon: 'phone', label: 'Số điện thoại', value: '0901 234 567' },
  { id: 'email', icon: 'email-outline', label: 'Email', value: 'parent@wise.edu.vn' },
  { id: 'address', icon: 'map-marker-outline', label: 'Địa chỉ', value: '123 Đường ABC, Quận 1, TP.HCM' },
  { id: 'hotline', icon: 'phone', label: 'Hotline hỗ trợ', value: '1900 636 526' },
];

const ParentProfile = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <PageHeader 
          title="Cá Nhân"
          subtitle="Thông tin tài khoản phụ huynh"
          variant="gradient"
          showNotification={false}
        />

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <Image 
              source={require('../../assets/images/avatar.jpeg')} 
              style={styles.avatar} 
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Phụ Huynh WISE</Text>
              <Text style={styles.profileSub}>Mã PH: PH20241119</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Icon name="pencil" size={ICON_SIZE.xs} color={theme.colors.primary} />
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeValue}>2</Text>
              <Text style={styles.badgeLabel}>Số con</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeValue}>8</Text>
              <Text style={styles.badgeLabel}>Khóa học</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeValue}>256</Text>
              <Text style={styles.badgeLabel}>Giờ học</Text>
            </View>
          </View>
        </View>

        {/* Contact Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          {detailItems.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.detailRow, 
                index !== detailItems.length - 1 && styles.detailDivider
              ]}
            >
              <View style={styles.detailIconWrapper}>
                <Icon name={item.icon} size={ICON_SIZE.sm} color={theme.colors.primary} />
              </View>
              <View style={styles.detailTextWrapper}>
                <Text style={styles.detailLabel}>{item.label}</Text>
                <Text style={styles.detailValue}>{item.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Icon name="logout-variant" size={ICON_SIZE.sm} color={theme.colors.error} />
          <Text style={styles.logoutLabel}>Đăng xuất</Text>
        </TouchableOpacity>

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
  content: {
    paddingBottom: SPACING['4xl'],
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    ...theme.shadows.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: AVATAR_SIZE.lg,
    height: AVATAR_SIZE.lg,
    borderRadius: AVATAR_SIZE.lg / 2,
    marginRight: SPACING.md,
    borderWidth: 2,
    borderColor: theme.colors.primary + '20',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  profileSub: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    marginTop: SPACING.xs / 2,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  editText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  badgeValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  badgeLabel: {
    fontSize: FONT_SIZE['2xs'],
    color: theme.colors.textSecondary,
    marginTop: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: SPACING.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  detailDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  detailIconWrapper: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: SPACING.xs / 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.error + '30',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    gap: SPACING.xs,
    ...theme.shadows.sm,
  },
  logoutLabel: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.bold,
  },
  bottomSpacing: {
    height: SPACING['2xl'],
  },
});

export default ParentProfile;

