import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
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
  SCREEN_PADDING,
} from '../../theme';
import PageHeader from '../../component/PageHeader';
import ReportCard from '../../components/reports/ReportCard';
import ReportFilters, { FilterOptions } from '../../components/reports/ReportFilters';
import { reportService } from '../../services/reportService';
import { Report } from '../../types/api/report';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ReportsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  const fetchReports = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (page === 1) {
        isRefresh ? setRefreshing(true) : setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await reportService.getReports({
        ...filters,
        page,
        per_page: 20
      });

      if (response.success && response.data) {
        if (page === 1) {
          setReports(response.data);
        } else {
          setReports(prev => [...prev, ...response.data]);
        }

        if (response.meta) {
          setCurrentPage(response.meta.current_page);
          setTotalPages(response.meta.last_page);
        }
      }
    } catch (error) {
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReports(1);
  }, [filters]);

  const onRefresh = useCallback(() => {
    fetchReports(1, true);
  }, [fetchReports]);

  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages) {
      fetchReports(currentPage + 1);
    }
  };

  const handleReportPress = (report: Report) => {
    navigation.navigate('ReportDetail', { id: report.id, reportId: report.id });
  };

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <ReportCard
      report={item}
      onPress={() => handleReportPress(item)}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="file-document-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyText}>Không có phản ánh nào</Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateReport')}
      >
        <Icon name="plus-circle" size={20} color={theme.colors.white} />
        <Text style={styles.createButtonText}>Tạo phản ánh mới</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader
        title="Phản ánh"
        variant="default"
        showNotification={true}
      />

      {/* Filters Bar */}
      <View style={styles.filtersBar}>
        <ReportFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
        <TouchableOpacity
          style={styles.createIconButton}
          onPress={() => navigation.navigate('CreateReport')}
        >
          <Icon name="plus" size={24} color={theme.colors.white} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateReport')}
      >
        <Icon name="plus" size={28} color={theme.colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  filtersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SPACING.sm,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  createIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listContent: {
    padding: SCREEN_PADDING.horizontal,
    paddingBottom: 100,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING['4xl'],
  },
  emptyText: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
    color: theme.colors.textSecondary,
    fontSize: FONT_SIZE.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  createButtonText: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  footerLoader: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ReportsScreen;
