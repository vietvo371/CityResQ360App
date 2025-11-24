import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import PageHeader from '../../component/PageHeader';
import { theme, SPACING, FONT_SIZE } from '../../theme';

type EditReportRouteProp = RouteProp<RootStackParamList, 'EditReport'>;

const EditReportScreen = () => {
  const route = useRoute<EditReportRouteProp>();
  const { id } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Chỉnh sửa phản ánh" variant="simple" />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Form chỉnh sửa phản ánh #{id}</Text>
        <Text style={styles.placeholderSubtext}>Đang được phát triển</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  placeholderText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    marginBottom: SPACING.sm,
  },
  placeholderSubtext: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },
});

export default EditReportScreen;


