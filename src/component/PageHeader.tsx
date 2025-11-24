import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { 
  theme, 
  SPACING, 
  FONT_SIZE, 
  BORDER_RADIUS, 
  ICON_SIZE,
  wp 
} from '../theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showNotification?: boolean;
  notificationCount?: number;
  onNotificationPress?: () => void;
  variant?: 'gradient' | 'simple'; // gradient cho menu, simple cho home
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showNotification = true,
  notificationCount = 0,
  onNotificationPress,
  variant = 'simple',
}) => {
  if (variant === 'gradient') {
    // Header với background gradient/primary (cho MenuHocTap, MenuHopDong, etc.)
    return (
      <View style={styles.gradientWrapper}>
        <View style={styles.gradientContent}>
          <View style={styles.textWrapper}>
            <Text style={styles.gradientTitle}>{title}</Text>
            {subtitle && <Text style={styles.gradientSubtitle}>{subtitle}</Text>}
          </View>
          {showNotification && (
            <TouchableOpacity 
              style={styles.gradientIconButton}
              onPress={onNotificationPress}
            >
              <Icon name="bell-ring" size={ICON_SIZE.sm} color={theme.colors.primary} />
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Header simple (cho HomePage)
  return (
    <View style={styles.simpleHeader}>
      <View style={styles.simpleLeft}>
        <Text style={styles.simpleGreeting}>{subtitle || 'Xin chào'}</Text>
        <Text style={styles.simpleTitle}>{title}</Text>
      </View>
      {showNotification && (
        <TouchableOpacity 
          style={styles.simpleNotificationButton}
          onPress={onNotificationPress}
        >
          <Icon name="bell-outline" size={ICON_SIZE.md} color={theme.colors.text} />
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Gradient Header (cho menu tabs)
  gradientWrapper: {
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  gradientContent: {
    backgroundColor: theme.colors.primary,
    borderRadius: BORDER_RADIUS.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['2xl'],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  textWrapper: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  gradientTitle: {
    color: theme.colors.white,
    fontSize: FONT_SIZE.xl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  gradientSubtitle: {
    color: theme.colors.white,
    opacity: 0.9,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
  gradientIconButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Simple Header (cho HomePage)
  simpleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  simpleLeft: {
    flex: 1,
  },
  simpleGreeting: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginBottom: SPACING.xs,
  },
  simpleTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  simpleNotificationButton: {
    width: wp('11%'),
    height: wp('11%'),
    borderRadius: wp('5.5%'),
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },

  // Badge (chung)
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: FONT_SIZE['2xs'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
  },
});

export default PageHeader;

