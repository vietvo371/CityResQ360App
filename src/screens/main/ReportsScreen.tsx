import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
  cardStyles,
  textStyles
} from '../../theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ReportsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Đang xử lý' },
    { id: 'resolved', label: 'Hoàn thành' },
  ];

  // Mock data
  const reports = [
    {
      id: 1,
      ticketId: '#INC-2023-001',
      title: 'Sụt lún mặt đường Nguyễn Huệ',
      location: 'Quận 1, TP.HCM',
      status: 'pending',
      priority: 'high',
      time: '14:30 - Hôm nay',
      category: 'Hạ tầng',
    },
    {
      id: 2,
      ticketId: '#INC-2023-002',
      title: 'Đèn đường hỏng',
      location: 'Quận 3, TP.HCM',
      status: 'in_progress',
      priority: 'medium',
      time: '09:15 - Hôm nay',
      category: 'Điện lực',
    },
    {
      id: 3,
      ticketId: '#INC-2023-003',
      title: 'Rác thải tràn lan',
      location: 'Quận 7, TP.HCM',
      status: 'resolved',
      priority: 'low',
      time: '16:45 - Hôm qua',
      category: 'Môi trường',
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.reportCard}
      onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityStrip, {
        backgroundColor: item.priority === 'high' ? theme.colors.error :
          item.priority === 'medium' ? theme.colors.warning : theme.colors.success
      }]} />

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.ticketId}>{item.ticketId}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.reportTitle} numberOfLines={2}>{item.title}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>{item.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="clock-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{item.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý phản ánh</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Icon name="filter-variant" size={ICON_SIZE.md} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={ICON_SIZE.md} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo mã, tiêu đề..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.activeTab]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={reports}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateReport')}
      >
        <Icon name="plus" size={ICON_SIZE.lg} color={theme.colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SCREEN_PADDING.horizontal,
    paddingVertical: SPACING.md,
    backgroundColor: theme.colors.white,
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
  },
  filterBtn: {
    padding: SPACING.xs,
  },
  searchContainer: {
    padding: SCREEN_PADDING.horizontal,
    paddingVertical: SPACING.md,
    backgroundColor: theme.colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: hp('5.5%'),
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
    paddingVertical: SPACING.sm,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  tab: {
    marginRight: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContent: {
    padding: SCREEN_PADDING.horizontal,
    paddingTop: SPACING.md,
    paddingBottom: hp('10%'),
  },
  reportCard: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  priorityStrip: {
    width: wp('1.5%'),
    height: '100%',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.md,
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
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    maxWidth: wp('35%'),
  },
  fab: {
    position: 'absolute',
    bottom: hp('3%'),
    right: SCREEN_PADDING.horizontal,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
});

export default ReportsScreen;


