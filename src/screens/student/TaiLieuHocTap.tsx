import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, containerStyles, textStyles, iconContainerStyles } from '../../theme';
import ScreenHeader from '../../component/ScreenHeader';

const TaiLieuHocTap = () => {
  return (
    <View style={containerStyles.screen}>
      <ScreenHeader title="Tài Liệu" subtitle="Tài liệu học tập" />
      <View style={styles.content}>
        <View style={[iconContainerStyles.large, iconContainerStyles.primary]}>
          <Icon name="file-document-multiple-outline" size={28} color={theme.colors.primary} />
        </View>
        <Text style={[textStyles.h4, styles.title]}>Tài liệu học tập</Text>
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

export default TaiLieuHocTap;
