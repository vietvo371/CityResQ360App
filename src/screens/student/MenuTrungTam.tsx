import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme, SPACING } from '../../theme';
import PageHeader from '../../component/PageHeader';
import ItemMenuTab from '../../component/ItemMenuTab';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MENU_ITEMS = [
  { id: 'request', label: 'Gửi Yêu Cầu', icon: require('../../assets/menu/gui_yeu_cau.png'), screen: 'GuiYeuCauHoTro' as const },
  { id: 'leave', label: 'Đơn Xin Phép', icon: require('../../assets/menu/don_xin_phep.png'), screen: 'DonXinVang' as const },
];

const MenuTrungTam = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleMenuPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageHeader 
          title="Trung Tâm"
          subtitle="Liên hệ và hỗ trợ học viên"
          variant="gradient"
          showNotification={true}
          notificationCount={1}
          onNotificationPress={() => console.log('Notification pressed')}
        />

        <View style={styles.gridWrapper}>
          {MENU_ITEMS.map((item) => (
            <ItemMenuTab
              key={item.id}
              image={item.icon}
              text={item.label}
              onPress={() => handleMenuPress(item.screen)}
            />
          ))}
          </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
});

export default MenuTrungTam;
