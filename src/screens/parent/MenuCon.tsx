import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme, SPACING } from '../../theme';
import PageHeader from '../../component/PageHeader';
import ItemMenuTab from '../../component/ItemMenuTab';

const MENU_ITEMS = [
  { id: 'schedule', label: 'Lịch Học', icon: require('../../assets/menu/calendar.png') },
  { id: 'assignment', label: 'Bài Tập', icon: require('../../assets/menu/assigment.png') },
  { id: 'assignmentScore', label: 'Điểm Bài Tập', icon: require('../../assets/menu/diem_bai_tap_ve_nha.png') },
  { id: 'transcript', label: 'Bảng Điểm', icon: require('../../assets/menu/bang_diem_toan_khoa.png') },
  { id: 'sessionReview', label: 'Đánh Giá Buổi Học', icon: require('../../assets/menu/danh_gia_buoi_hoc.png') },
  { id: 'teacherReview', label: 'Nhận Xét Giáo Viên', icon: require('../../assets/menu/nhan_xet_giao_vien.png') },
  { id: 'attendance', label: 'Điểm Danh', icon: require('../../assets/menu/diem_danh.png') },
  { id: 'materials', label: 'Tài Liệu Học Tập', icon: require('../../assets/menu/tai_lieu.png') },
];

const MenuCon = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <PageHeader 
          title="Thông Tin Con"
          subtitle="Theo dõi quá trình học tập của con"
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
              onPress={() => console.log('Menu item pressed:', item.id)}
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

export default MenuCon;

