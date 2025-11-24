import * as React from 'react';
import { Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, TAB_BAR } from '../theme';
import { RootStackParamList, StudentTabParamList, ParentTabParamList } from './types';

// Auth flow screens
import LoadingScreen from '../screens/auth/LoadingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import LoginParent from '../screens/auth/LoginParent';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import UpdatePasswordScreen from '../screens/auth/UpdatePasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import PhoneVerificationScreen from '../screens/auth/PhoneVerificationScreen';

// Student tabs
import HomePage from '../screens/student/HomePage';
import MenuHocTap from '../screens/student/MenuHocTap';
import MenuHopDong from '../screens/student/MenuHopDong';
import MenuTrungTam from '../screens/student/MenuTrungTam';
import Profile from '../screens/student/Profile';

// Parent tabs
import ParentHomePage from '../screens/parent/ParentHomePage';
import MenuCon from '../screens/parent/MenuCon';
import ParentMenuHopDong from '../screens/parent/ParentMenuHopDong';
import ParentMenuTrungTam from '../screens/parent/ParentMenuTrungTam';
import ParentProfile from '../screens/parent/ParentProfile';

// Student stack screens
import ThoiKhoaBieu from '../screens/student/ThoiKhoaBieu';
import Assignment from '../screens/student/Assignment';
import NopBaiTapVeNha from '../screens/student/NopBaiTapVeNha';
import NopBaiTapVeNhaDetail from '../screens/student/NopBaiTapVeNhaDetail';
import DiemBaiTap from '../screens/student/DiemBaiTap';
import BangDiemToanKhoa from '../screens/student/BangDiemToanKhoa';
import BangDiemChiTiet from '../screens/student/BangDiemChiTiet';
import TaiLieuHocTap from '../screens/student/TaiLieuHocTap';
import ChiTietTaiLieu from '../screens/student/ChiTietTaiLieu';
import DanhGiaBuoiHoc from '../screens/student/DanhGiaBuoiHoc';
import WriteDanhGiaBuoiHoc from '../screens/student/WriteDanhGiaBuoiHoc';
import NhanXetGiaoVien from '../screens/student/NhanXetGiaoVien';
import ChiTietNhanXetGiaoVien from '../screens/student/ChiTietNhanXetGiaoVien';
import CamKetDauRa from '../screens/student/CamKetDauRa';
import DiemDanhDiemThuong from '../screens/student/DiemDanhDiemThuong';
import ChiTietDiemDanhDiemThuong from '../screens/student/ChiTietDiemDanhDiemThuong';
import HopDong from '../screens/student/HopDong';
import HopDongDetails from '../screens/student/HopDongDetails';
import HoaDonHocPhi from '../screens/student/HoaDonHocPhi';
import HoaDonHocPhiDetails from '../screens/student/HoaDonHocPhiDetails';
import DonXinVang from '../screens/student/DonXinVang';
import WriteDonXinVang from '../screens/student/WriteDonXinVang';
import GuiYeuCauHoTro from '../screens/student/GuiYeuCauHoTro';
import WriteGuiYeuCauHoTro from '../screens/student/WriteGuiYeuCauHoTro';
import ThongBao from '../screens/student/ThongBao';
import Base from '../screens/student/Base';
import Test from '../screens/student/Test';

const Stack = createNativeStackNavigator<RootStackParamList>();
const StudentTab = createBottomTabNavigator<StudentTabParamList>();
const ParentTab = createBottomTabNavigator<ParentTabParamList>();

const StudentTabs = () => {
  const tabScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textSecondary,
    tabBarStyle: {
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
      paddingBottom: TAB_BAR.paddingBottom,
      paddingTop: 8,
      height: TAB_BAR.height,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    tabBarLabelStyle: {
      fontSize: TAB_BAR.fontSize,
      fontWeight: theme.typography.fontWeight.semibold,
      marginTop: 4,
    },
    tabBarIconStyle: {
      marginTop: 4,
    },
  };

  return (
    <StudentTab.Navigator screenOptions={tabScreenOptions}>
      <StudentTab.Screen
        name="HomePage"
        component={HomePage}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Icon name="home-variant" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <StudentTab.Screen
        name="MenuHocTap"
        component={MenuHocTap}
        options={{
          title: 'Học tập',
          tabBarIcon: ({ color }) => <Icon name="book-open-page-variant" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <StudentTab.Screen
        name="MenuHopDong"
        component={MenuHopDong}
        options={{
          title: 'Hợp đồng',
          tabBarIcon: ({ color }) => <Icon name="file-document-outline" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <StudentTab.Screen
        name="MenuTrungTam"
        component={MenuTrungTam}
        options={{
          title: 'Trung tâm',
          tabBarIcon: ({ color }) => <Icon name="office-building-marker-outline" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <StudentTab.Screen
        name="Profile"
        component={Profile}
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <Icon name="account-circle" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
    </StudentTab.Navigator>
  );
};

const ParentTabs = () => {
  const tabScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textSecondary,
    tabBarStyle: {
      backgroundColor: theme.colors.white,
      borderTopWidth: 1,
      borderTopColor: theme.colors.borderLight,
      paddingBottom: TAB_BAR.paddingBottom,
      paddingTop: 8,
      height: TAB_BAR.height,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    tabBarLabelStyle: {
      fontSize: TAB_BAR.fontSize,
      fontWeight: theme.typography.fontWeight.semibold,
      marginTop: 4,
    },
    tabBarIconStyle: {
      marginTop: 4,
    },
  };

  return (
    <ParentTab.Navigator screenOptions={tabScreenOptions}>
      <ParentTab.Screen
        name="ParentHomePage"
        component={ParentHomePage}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Icon name="home-variant" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <ParentTab.Screen
        name="MenuCon"
        component={MenuCon}
        options={{
          title: 'Thông tin con',
          tabBarIcon: ({ color }) => <Icon name="account-child" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <ParentTab.Screen
        name="MenuHopDong"
        component={ParentMenuHopDong}
        options={{
          title: 'Hợp đồng',
          tabBarIcon: ({ color }) => <Icon name="file-document-outline" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <ParentTab.Screen
        name="MenuTrungTam"
        component={ParentMenuTrungTam}
        options={{
          title: 'Trung tâm',
          tabBarIcon: ({ color }) => <Icon name="office-building-marker-outline" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <ParentTab.Screen
        name="Profile"
        component={ParentProfile}
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <Icon name="account-circle" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
    </ParentTab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Loading"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
        animationTypeForReplace: 'push',
        presentation: 'card',
        contentStyle: {
          backgroundColor: theme.colors.white,
        },
      }}
    >
      <Stack.Screen name="Loading" component={LoadingScreen} />

      <Stack.Group>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="LoginParent" component={LoginParent} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      </Stack.Group>

      <Stack.Group>
        <Stack.Screen name="StudentTabs" component={StudentTabs} />
        <Stack.Screen name="ParentTabs" component={ParentTabs} />
      </Stack.Group>

      <Stack.Group>
        <Stack.Screen name="ThoiKhoaBieu" component={ThoiKhoaBieu} />
        <Stack.Screen name="Assignment" component={Assignment} />
        <Stack.Screen name="NopBaiTapVeNha" component={NopBaiTapVeNha} />
        <Stack.Screen name="NopBaiTapVeNhaDetail" component={NopBaiTapVeNhaDetail} />
        <Stack.Screen name="DiemBaiTap" component={DiemBaiTap} />
        <Stack.Screen name="BangDiemToanKhoa" component={BangDiemToanKhoa} />
        <Stack.Screen name="BangDiemChiTiet" component={BangDiemChiTiet} />
        <Stack.Screen name="TaiLieuHocTap" component={TaiLieuHocTap} />
        <Stack.Screen name="ChiTietTaiLieu" component={ChiTietTaiLieu} />
        <Stack.Screen name="DanhGiaBuoiHoc" component={DanhGiaBuoiHoc} />
        <Stack.Screen name="WriteDanhGiaBuoiHoc" component={WriteDanhGiaBuoiHoc} />
        <Stack.Screen name="NhanXetGiaoVien" component={NhanXetGiaoVien} />
        <Stack.Screen name="ChiTietNhanXetGiaoVien" component={ChiTietNhanXetGiaoVien} />
        <Stack.Screen name="CamKetDauRa" component={CamKetDauRa} />
        <Stack.Screen name="DiemDanhDiemThuong" component={DiemDanhDiemThuong} />
        <Stack.Screen name="ChiTietDiemDanhDiemThuong" component={ChiTietDiemDanhDiemThuong} />
        <Stack.Screen name="HopDong" component={HopDong} />
        <Stack.Screen name="HopDongDetails" component={HopDongDetails} />
        <Stack.Screen name="HoaDonHocPhi" component={HoaDonHocPhi} />
        <Stack.Screen name="HoaDonHocPhiDetails" component={HoaDonHocPhiDetails} />
        <Stack.Screen name="DonXinVang" component={DonXinVang} />
        <Stack.Screen name="WriteDonXinVang" component={WriteDonXinVang} />
        <Stack.Screen name="GuiYeuCauHoTro" component={GuiYeuCauHoTro} />
        <Stack.Screen name="WriteGuiYeuCauHoTro" component={WriteGuiYeuCauHoTro} />
        <Stack.Screen name="ThongBao" component={ThongBao} />
        <Stack.Screen name="Base" component={Base} />
        <Stack.Screen name="Test" component={Test} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
        <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

export default MainNavigator;
