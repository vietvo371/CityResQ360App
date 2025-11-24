import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, containerStyles, textStyles, iconContainerStyles } from '../../theme';
import ScreenHeader from '../../component/ScreenHeader';

const DonXinVang = () => {
  return (
    <View style={containerStyles.screen}>
      <ScreenHeader title="Đơn Xin Phép" subtitle="Đơn xin vắng học" />
      <View style={styles.content}>
        <View style={[iconContainerStyles.large, iconContainerStyles.primary]}>
          <Icon name="file-document-edit-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={[textStyles.h4, styles.title]}>Đơn xin vắng</Text>
        <Text style={[textStyles.bodySmall, styles.subtitle]}>Tính năng đang được phát triển.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: theme.spacing['2xl'],
  },
  title: { 
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: { 
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
});

export default DonXinVang;
