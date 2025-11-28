import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
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
import ModalCustom from '../../component/ModalCustom';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const menuItems = [
    {
      title: 'Tài khoản',
      items: [
        { id: 'profile', icon: 'account-outline', label: 'Thông tin cá nhân' },
        { id: 'security', icon: 'shield-check-outline', label: 'Bảo mật & Đăng nhập' },
        { id: 'kyc', icon: 'card-account-details-outline', label: 'Xác thực danh tính (eKYC)' },
      ]
    },
    {
      title: 'Cài đặt & Hỗ trợ',
      items: [
        { id: 'notifications', icon: 'bell-outline', label: 'Thông báo' },
        { id: 'language', icon: 'translate', label: 'Ngôn ngữ' },
        { id: 'help', icon: 'help-circle-outline', label: 'Trung tâm trợ giúp' },
        { id: 'about', icon: 'information-outline', label: 'Về ứng dụng' },
      ]
    }
  ];

  const handleLogout = async () => {
    try {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      await signOut();
      setShowLogoutModal(false);

    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleMenuPress = (itemId: string) => {
    switch (itemId) {
      case 'profile':
        (navigation as any).navigate('UserProfile', { userId: user?.id });
        break;
      case 'security':
        (navigation as any).navigate('ChangePasswordLoggedIn');
        break;
      case 'kyc':
        // TODO: Navigate to eKYC verification screen when implemented
        console.log('Navigate to eKYC');
        break;
      case 'notifications':
        (navigation as any).navigate('NotificationSettings');
        break;
      case 'language':
        (navigation as any).navigate('LanguageSettings');
        break;
      case 'help':
        (navigation as any).navigate('HelpCenter');
        break;
      case 'about':
        (navigation as any).navigate('About');
        break;
      default:
        break;
    }
  };

  const formatPoints = (points: number) => {
    return points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              {user?.anh_dai_dien ? (
                <Image source={{ uri: user.anh_dai_dien }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {user?.ho_ten?.charAt(0) || 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.verifiedBadge}>
                <Icon name="check-decagram" size={16} color={theme.colors.primary} />
              </View>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.ho_ten || 'Người dùng'}</Text>
              <Text style={styles.userRole}>Cư dân TP.HCM</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user?.tong_so_phan_anh || 0}</Text>
              <Text style={styles.statLabel}>Báo cáo</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.diem_thanh_pho ? formatPoints(user.diem_thanh_pho) : '0'}
              </Text>
              <Text style={styles.statLabel}>Điểm thưởng</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user?.diem_uy_tin || 0}
              </Text>
              <Text style={styles.statLabel}>Uy tín</Text>
            </View>
          </View>
        </View>

        {/* Menu Sections */}
        <View style={styles.menuContainer}>
          {menuItems.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, idx) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      idx === section.items.length - 1 && styles.lastMenuItem
                    ]}
                    onPress={() => handleMenuPress(item.id)}
                  >
                    <View style={styles.menuIconBox}>
                      <Icon name={item.icon} size={ICON_SIZE.md} color={theme.colors.text} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Icon name="chevron-right" size={ICON_SIZE.md} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={() => setShowLogoutModal(true)}>
          <Icon name="logout" size={ICON_SIZE.md} color={theme.colors.error} />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ModalCustom
        isModalVisible={showLogoutModal}
        setIsModalVisible={setShowLogoutModal}
        title="Đăng xuất"
        onPressAction={handleLogout}

      >
        <Text style={styles.modalMessage}>
          Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?
        </Text>
      </ModalCustom>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  header: {
    backgroundColor: theme.colors.white,
    padding: SCREEN_PADDING.horizontal,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: SPACING.md,
  },
  avatar: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('9%'),
  },
  avatarPlaceholder: {
    width: wp('18%'),
    height: wp('18%'),
    borderRadius: wp('9%'),
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: '700',
    color: theme.colors.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    borderRadius: 10,
    padding: 2,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  userRole: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.borderLight,
  },
  menuContainer: {
    paddingHorizontal: SCREEN_PADDING.horizontal,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  sectionContent: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.white,
    marginHorizontal: SCREEN_PADDING.horizontal,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
    ...theme.shadows.sm,
  },
  logoutText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: theme.colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: theme.colors.textSecondary,
    marginBottom: SPACING.xl,
  },
  modalMessage: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    textAlign: 'center',
    paddingVertical: SPACING.lg,
    lineHeight: 22,
  },
});

export default ProfileScreen;


