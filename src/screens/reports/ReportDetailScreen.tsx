import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import PageHeader from '../../component/PageHeader';
import { theme, SPACING, FONT_SIZE } from '../../theme';

type ReportDetailRouteProp = RouteProp<RootStackParamList, 'ReportDetail'>;

const ReportDetailScreen = () => {
  const route = useRoute<ReportDetailRouteProp>();
  const { id } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Chi tiết phản ánh" variant="simple" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.placeholderText}>Chi tiết phản ánh #{id}</Text>
          <Text style={styles.placeholderSubtext}>Đang được phát triển</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  placeholderText: {
    fontSize: FONT_SIZE.lg,
    color: theme.colors.text,
    marginBottom: SPACING.sm,
  },
  placeholderSubtext: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
  },
});

export default ReportDetailScreen;


