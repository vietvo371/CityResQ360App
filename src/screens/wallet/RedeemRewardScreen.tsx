import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/types';
import PageHeader from '../../component/PageHeader';
import { theme, SPACING, FONT_SIZE } from '../../theme';

type RedeemRewardRouteProp = RouteProp<RootStackParamList, 'RedeemReward'>;

const RedeemRewardScreen = () => {
  const route = useRoute<RedeemRewardRouteProp>();
  const { rewardId } = route.params;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <PageHeader title="Đổi phần thưởng" variant="simple" />
      <View style={styles.content}>
        <Text style={styles.placeholderText}>Đổi phần thưởng #{rewardId}</Text>
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

export default RedeemRewardScreen;


