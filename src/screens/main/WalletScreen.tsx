import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl, ActivityIndicator, Platform } from 'react-native';
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
import PageHeader from '../../component/PageHeader';
import { walletService } from '../../services/walletService';
import { WalletInfo, Transaction, Reward } from '../../types/api/wallet';

const WalletScreen = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');

  const fetchData = useCallback(async () => {
    try {
      const [infoRes, transRes, rewardsRes] = await Promise.all([
        walletService.getWalletInfo(),
        walletService.getTransactions({ per_page: 10 }),
        walletService.getRewards(1)
      ]);

      if (infoRes.success) {
        setWalletInfo(infoRes.data);
      }
      if (transRes.success) {
        setTransactions(transRes.data);
      }
      if (rewardsRes.success) {
        setRewards(rewardsRes.data);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatPoints = (points: number) => {
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* <PageHeader
        title="Ví điểm CityPoint"
        variant="gradient"
        rightIcon="help-circle-outline"
        onRightPress={() => { }}
      /> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          {/* Gradient Background */}
          <LinearGradient
            colors={[theme.colors.primary, '#2196F3', '#4facfe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Background Pattern */}
          <View style={styles.cardPatternCircle1} />
          <View style={styles.cardPatternCircle2} />

          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>Tổng điểm tích lũy</Text>
              <Text style={styles.cardSubLabel}>CityResQ360 Rewards</Text>
            </View>
            {walletInfo && (
              <View style={styles.rankBadge}>
                <Icon name="crown" size={14} color="#FFD700" />
                <Text style={styles.rankText}>{walletInfo.cap_huy_hieu_text}</Text>
              </View>
            )}
          </View>

          {/* Body */}
          <View style={styles.cardBody}>
            <Text style={styles.balanceValue}>
              {walletInfo ? formatPoints(walletInfo.diem_thanh_pho) : '...'}
            </Text>
            <Text style={styles.currencyLabel}>CityPoints</Text>

            {walletInfo && (
              <View style={styles.reputationBadge}>
                <Icon name="shield-check" size={14} color="white" style={{ marginRight: 4 }} />
                <Text style={styles.reputationText}>Uy tín: {walletInfo.diem_uy_tin}</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <View style={{ flex: 1, marginRight: 12 }}>
              {walletInfo && walletInfo.next_level_points > 0 ? (
                <View>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Tiến độ lên hạng</Text>
                    <Text style={styles.progressValue}>{walletInfo.progress_percentage}%</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${walletInfo.progress_percentage}%` }]} />
                  </View>
                </View>
              ) : (
                <View style={styles.idContainer}>
                  <Text style={styles.idLabel}>Thành viên </Text>
                  <Text style={styles.idValue}>
                    {walletInfo ? `#${String(walletInfo.cap_huy_hieu).padStart(2, '0')}` : '...'}
                  </Text>
                </View>
              )}
            </View>
            <Icon name="contactless-payment" size={24} color="rgba(255,255,255,0.8)" />
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
            onPress={() => setActiveTab('rewards')}
          >
            <Icon
              name="gift-outline"
              size={ICON_SIZE.md}
              color={activeTab === 'rewards' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[styles.tabLabel, activeTab === 'rewards' && styles.tabLabelActive]}>
              Đổi quà
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Icon
              name="history"
              size={ICON_SIZE.md}
              color={activeTab === 'history' ? theme.colors.primary : theme.colors.textSecondary}
            />
            <Text style={[styles.tabLabel, activeTab === 'history' && styles.tabLabelActive]}>
              Lịch sử
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'rewards' ? (
          // Rewards Tab
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phần thưởng có thể đổi</Text>
            {loading && !refreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : rewards.length > 0 ? (
              rewards.map((reward) => (
                <View key={reward.id} style={styles.rewardItem}>
                  <View style={styles.rewardIcon}>
                    <Icon name="gift" size={ICON_SIZE.lg} color={theme.colors.primary} />
                  </View>
                  <View style={styles.rewardInfo}>
                    <Text style={styles.rewardTitle}>{reward.ten_phan_thuong}</Text>
                    <Text style={styles.rewardPoints}>{reward.so_diem_can} điểm</Text>
                  </View>
                  <TouchableOpacity style={styles.redeemButton}>
                    <Text style={styles.redeemButtonText}>Đổi</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Chưa có phần thưởng nào</Text>
            )}
          </View>
        ) : (
          // History Tab
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
            {loading && !refreshing ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : transactions.length > 0 ? (
              transactions.map((item) => (
                <View key={item.id} style={styles.transactionItem}>
                  <View style={[styles.transIcon, {
                    backgroundColor: item.loai_giao_dich === 0 ? theme.colors.success + '15' : theme.colors.textSecondary + '15'
                  }]}>
                    <Icon
                      name={item.loai_giao_dich === 0 ? 'arrow-down-left' : 'arrow-up-right'}
                      size={ICON_SIZE.md}
                      color={item.loai_giao_dich === 0 ? theme.colors.success : theme.colors.textSecondary}
                    />
                  </View>
                  <View style={styles.transInfo}>
                    <Text style={styles.transTitle}>{item.loai_giao_dich_text}</Text>
                    <Text style={styles.transDate}>
                      {new Date(item.ngay_tao).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                  <Text style={[styles.transAmount, {
                    color: item.loai_giao_dich === 0 ? theme.colors.success : theme.colors.text
                  }]}>
                    {item.loai_giao_dich === 0 ? '+' : '-'}{item.so_diem}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
            )}
          </View>
        )}
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
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    ...theme.shadows.md,
  },
  cardPatternCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 0,
  },
  cardPatternCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  },
  cardLabel: {
    fontSize: FONT_SIZE.sm,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  cardSubLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
    maxWidth: '45%',
    alignSelf: 'flex-start',
  },
  rankText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.white,
    fontWeight: '700',
    flexShrink: 1,
  },
  cardBody: {
    marginVertical: SPACING.sm,
    zIndex: 1,
  },
  balanceValue: {
    fontSize: 42,
    fontWeight: '800',
    color: theme.colors.white,
    letterSpacing: -1,
  },
  currencyLabel: {
    fontSize: FONT_SIZE.md,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    marginTop: -4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  idValue: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '600',
  },
  // Tab Selector
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F7FA', // Light gray background for the track
    borderRadius: BORDER_RADIUS['2xl'],
    padding: 4,
    marginBottom: SPACING.xl,
    marginHorizontal: SPACING.xs, // Add some margin from screen edges if needed, or keep 0
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, // Taller touch area
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    gap: 6,
  },
  tabActive: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm, // Add shadow to active tab for "floating" effect
    shadowOpacity: 0.1,
  },
  tabLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  // Rewards
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.sm,
    shadowColor: theme.colors.primary, // Subtle colored shadow
    shadowOpacity: 0.05,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: 20, // Squircle shape
    backgroundColor: '#F0F7FF', // Very light primary
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  rewardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  rewardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.primary,
    fontWeight: '700',
    backgroundColor: '#F0F7FF',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  redeemButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  redeemButtonText: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  section: {
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800', // Bolder title
    color: theme.colors.text,
    marginBottom: SPACING.lg,
    marginLeft: SPACING.xs,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.md,
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#F5F7FA',
  },
  transIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginBottom: 4,
  },
  transDate: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  transAmount: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
    fontStyle: 'italic',
  },
  reputationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  reputationText: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  progressValue: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: 2,
  },
});

export default WalletScreen;


