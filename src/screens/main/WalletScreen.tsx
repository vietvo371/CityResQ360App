import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  theme,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  ICON_SIZE,
  SCREEN_PADDING,
  wp,
  hp,
} from '../../theme';

const WalletScreen = () => {
  const transactions = [
    { id: 1, title: 'Báo cáo sự cố được duyệt', date: '20/11/2023', amount: '+50', type: 'earn' },
    { id: 2, title: 'Đổi voucher Coffee House', date: '18/11/2023', amount: '-200', type: 'spend' },
    { id: 3, title: 'Đóng góp quỹ xanh', date: '15/11/2023', amount: '-100', type: 'spend' },
    { id: 4, title: 'Hoàn thành khảo sát', date: '10/11/2023', amount: '+20', type: 'earn' },
  ];

  const quickActions = [
    { id: 'redeem', icon: 'gift-outline', label: 'Đổi quà', color: theme.colors.primary },
    { id: 'history', icon: 'history', label: 'Lịch sử', color: theme.colors.info },
    { id: 'donate', icon: 'hand-heart-outline', label: 'Quyên góp', color: theme.colors.error },
    { id: 'scan', icon: 'qrcode-scan', label: 'Quét mã', color: theme.colors.success },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ví điểm CityPoint</Text>
        <TouchableOpacity>
          <Icon name="help-circle-outline" size={ICON_SIZE.md} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <LinearGradient
          colors={[theme.colors.primary, '#4facfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View>
            <Text style={styles.balanceLabel}>Tổng điểm tích lũy</Text>
            <Text style={styles.balanceValue}>1,250</Text>
          </View>
          <View style={styles.rankBadge}>
            <Icon name="crown" size={16} color="#FFD700" />
            <Text style={styles.rankText}>Thành viên Vàng</Text>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.actionItem}>
              <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                <Icon name={action.icon} size={ICON_SIZE.lg} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          {transactions.map((item) => (
            <View key={item.id} style={styles.transactionItem}>
              <View style={[styles.transIcon, { backgroundColor: item.type === 'earn' ? theme.colors.success + '15' : theme.colors.textSecondary + '15' }]}>
                <Icon
                  name={item.type === 'earn' ? 'arrow-down-left' : 'arrow-up-right'}
                  size={ICON_SIZE.md}
                  color={item.type === 'earn' ? theme.colors.success : theme.colors.textSecondary}
                />
              </View>
              <View style={styles.transInfo}>
                <Text style={styles.transTitle}>{item.title}</Text>
                <Text style={styles.transDate}>{item.date}</Text>
              </View>
              <Text style={[styles.transAmount, { color: item.type === 'earn' ? theme.colors.success : theme.colors.text }]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
  },
  scrollContent: {
    padding: SCREEN_PADDING.horizontal,
    paddingBottom: hp('5%'),
  },
  balanceCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    ...theme.shadows.md,
  },
  balanceLabel: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: SPACING.xs,
  },
  balanceValue: {
    fontSize: FONT_SIZE['4xl'],
    fontWeight: '700',
    color: theme.colors.white,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  rankText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.white,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  actionItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionIcon: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.text,
    fontWeight: '500',
  },
  section: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: SPACING.md,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  transIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  transInfo: {
    flex: 1,
  },
  transTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  transDate: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  transAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});

export default WalletScreen;


