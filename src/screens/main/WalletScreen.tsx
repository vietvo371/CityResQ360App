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
import { WalletInfo, Transaction } from '../../types/api/wallet';

const WalletScreen = () => {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [infoRes, transRes] = await Promise.all([
        walletService.getWalletInfo(),
        walletService.getTransactions({ per_page: 5 })
      ]);

      if (infoRes.success) {
        setWalletInfo(infoRes.data);
      }
      if (transRes.success) {
        setTransactions(transRes.data);
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

  const quickActions = [
    { id: 'redeem', icon: 'gift-outline', label: 'Đổi quà', color: theme.colors.primary },
    { id: 'history', icon: 'history', label: 'Lịch sử', color: theme.colors.info },
    { id: 'donate', icon: 'hand-heart-outline', label: 'Quyên góp', color: theme.colors.error },
    { id: 'scan', icon: 'qrcode-scan', label: 'Quét mã', color: theme.colors.success },
  ];

  const formatPoints = (points: number) => {
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader
        title="Ví điểm CityPoint"
        variant="default"
        rightIcon="help-circle-outline"
        onRightPress={() => { }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <LinearGradient
          colors={[theme.colors.primary, '#2196F3', '#4facfe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          {/* Background Pattern (Optional decorative circles) */}
          <View style={styles.cardPatternCircle1} />
          <View style={styles.cardPatternCircle2} />

          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>Tổng điểm tích lũy</Text>
              <Text style={styles.cardSubLabel}>CityResQ360 Rewards</Text>
            </View>

          </View>

          <View style={styles.cardBody}>
            <Text style={styles.balanceValue}>
              {walletInfo ? formatPoints(walletInfo.diem_thanh_pho) : '...'}
            </Text>
            <Text style={styles.currencyLabel}>CityPoints</Text>
          </View>

          <View style={styles.cardFooter}>
            <View style={styles.idContainer}>
              <Text style={styles.idLabel}>ID: </Text>
              <Text style={styles.idValue}>
                {walletInfo ? `MB-${walletInfo.cap_huy_hieu || '00'}-${Math.floor(Math.random() * 10000)}` : '...'}
              </Text>
            </View>
            <Icon name="contactless-payment" size={24} color="rgba(255,255,255,0.8)" />
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
    minHeight: 200,
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
  },
  cardPatternCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    marginVertical: SPACING.md,
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
  emptyText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});

export default WalletScreen;


