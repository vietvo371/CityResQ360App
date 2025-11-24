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
  { id: 'contract', label: 'Hợp Đồng', icon: require('../../assets/menu/hop_dong.png'), screen: 'HopDong' as const },
  { id: 'invoice', label: 'Hóa Đơn Học Phí', icon: require('../../assets/menu/hoa_don_hoc_phi.png'), screen: 'HoaDonHocPhi' as const },
];

const ParentMenuHopDong = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleMenuPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageHeader 
          title="Hợp Đồng"
          subtitle="Quản lý hợp đồng và thanh toán"
          variant="gradient"
          showNotification={true}
          notificationCount={2}
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
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
});

export default ParentMenuHopDong;

