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
  { id: 'schedule', label: 'Lịch Học', icon: require('../../assets/menu/calendar.png'), screen: 'ThoiKhoaBieu' as const },
  { id: 'assignment', label: 'Bài Tập', icon: require('../../assets/menu/assigment.png'), screen: 'Assignment' as const },
  { id: 'assignmentScore', label: 'Điểm Bài Tập', icon: require('../../assets/menu/diem_bai_tap_ve_nha.png'), screen: 'DiemBaiTap' as const },
  { id: 'submit', label: 'Nộp Bài Tập', icon: require('../../assets/menu/nop_bai_tap_ve_nha.png'), screen: 'NopBaiTapVeNha' as const },
  { id: 'transcript', label: 'Bảng Điểm Toàn Khoa', icon: require('../../assets/menu/bang_diem_toan_khoa.png'), screen: 'BangDiemToanKhoa' as const },
  { id: 'sessionReview', label: 'Đánh Giá Buổi Học', icon: require('../../assets/menu/danh_gia_buoi_hoc.png'), screen: 'DanhGiaBuoiHoc' as const },
  { id: 'commitment', label: 'Cam Kết Đầu Ra', icon: require('../../assets/menu/cam_ket_dau_ra.png'), screen: 'CamKetDauRa' as const },
  { id: 'materials', label: 'Tài Liệu Học Tập', icon: require('../../assets/menu/tai_lieu.png'), screen: 'TaiLieuHocTap' as const },
  { id: 'teacherReview', label: 'Nhận Xét Giáo Viên', icon: require('../../assets/menu/nhan_xet_giao_vien.png'), screen: 'NhanXetGiaoVien' as const },
  { id: 'rewards', label: 'Điểm Danh Điểm Thưởng', icon: require('../../assets/menu/diem_danh.png'), screen: 'DiemDanhDiemThuong' as const },
];

const MenuHocTap = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleMenuPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageHeader 
          title="Học Tập"
          subtitle="Theo dõi toàn bộ hành trình học"
          variant="gradient"
          showNotification={true}
          notificationCount={3}
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.lg,
  },
});

export default MenuHocTap;
