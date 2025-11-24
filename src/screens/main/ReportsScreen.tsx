import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  wp,
  hp,
} from '../../theme';
import PageHeader from '../../component/PageHeader';
import { reportService } from '../../services/reportService';
import { Report } from '../../types/api/report';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ReportsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const params: any = {
        sort_by: 'ngay_tao',
        sort_order: 'desc',
      };

      if (activeTab !== 'all') {
        // Map tab to status code (approximate mapping based on API docs)
        // 0: Pending, 1: Verified/In Progress, 2: Resolved, 3: Rejected
        // This logic might need adjustment based on exact API enums
        params.trang_thai = activeTab === 'pending' ? 0 : 2;
      }

      if (searchQuery) {
        params.tu_khoa = searchQuery;
      }

      const response = await reportService.getReports(params);
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchReports();
  }, [fetchReports]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return theme.colors.warning; // Pending
      case 1: return theme.colors.info;    // In Progress
      case 2: return theme.colors.success; // Resolved
      case 3: return theme.colors.error;   // Rejected
      default: return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return theme.colors.error;   // High/Critical
      case 2: return theme.colors.warning; // Medium
      case 1: return theme.colors.success; // Low
      default: return theme.colors.textSecondary;
    }
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityStrip, { backgroundColor: getPriorityColor(item.uu_tien) }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>#{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.trang_thai) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.trang_thai) }]}>
              {item.trang_thai_text}
            </Text>
          </View>
        </View>

        <Text style={styles.reportTitle} numberOfLines={2}>{item.tieu_de}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Icon name="map-marker-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.footerText} numberOfLines={1}>{item.dia_chi}</Text>
          </View>
          <View style={styles.footerItem}>
            <Icon name="clock-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.footerText}>
              {new Date(item.ngay_tao).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader
        title="Danh sách phản ánh"
        variant="default"
        rightIcon="filter-variant"
        onRightPress={() => { }}
      />

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Icon name="magnify" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phản ánh..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={theme.colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {(['all', 'pending', 'resolved'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'all' ? 'Tất cả' : tab === 'pending' ? 'Đang xử lý' : 'Đã xong'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="file-document-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>Không có phản ánh nào</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateReport')}
      >
        <Icon name="plus" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  searchContainer: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
    marginBottom: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    height: 48,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  tab: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.white,
  },
  listContent: {
    padding: SCREEN_PADDING.horizontal,
    paddingBottom: 80,
  },
  reportCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  priorityStrip: {
    width: 4,
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
    // The original instruction had {{ ... }} here, assuming it meant to keep the rest of the styles as is or fill in.
    // I will fill in the missing part based on the original code's cardContent and cardHeader styles.
  },
  cardHeader: {
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
  statusBadge: {
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
  cardFooter: {
    gap: 4,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
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

export default ReportsScreen;
