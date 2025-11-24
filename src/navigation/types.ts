import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigatorScreenParams } from '@react-navigation/native';

export type StudentTabParamList = {
  HomePage: undefined;
  MenuHocTap: undefined;
  MenuHopDong: undefined;
  MenuTrungTam: undefined;
  Profile: undefined;
};

export type ParentTabParamList = {
  ParentHomePage: undefined;
  MenuCon: undefined;
  MenuHopDong: undefined;
  MenuTrungTam: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Loading: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  OTPVerification: { 
    identifier: string; 
    type: 'phone' | 'email';
    flow?: 'register' | 'login' | 'forgot';
  };
  StudentTabs: NavigatorScreenParams<StudentTabParamList>;
  ParentTabs: NavigatorScreenParams<ParentTabParamList>;
  ChangePassword: undefined;
  UpdatePassword: {
    token: string;
  };
  EmailVerification: undefined;
  PhoneVerification: undefined;
  ThoiKhoaBieu: undefined;
  Assignment: undefined;
  NopBaiTapVeNha: undefined;
  NopBaiTapVeNhaDetail: undefined;
  DiemBaiTap: undefined;
  BangDiemToanKhoa: undefined;
  BangDiemChiTiet: undefined;
  TaiLieuHocTap: undefined;
  ChiTietTaiLieu: undefined;
  DanhGiaBuoiHoc: undefined;
  WriteDanhGiaBuoiHoc: undefined;
  NhanXetGiaoVien: undefined;
  ChiTietNhanXetGiaoVien: undefined;
  CamKetDauRa: undefined;
  DiemDanhDiemThuong: undefined;
  ChiTietDiemDanhDiemThuong: undefined;
  HopDong: undefined;
  HopDongDetails: undefined;
  HoaDonHocPhi: undefined;
  HoaDonHocPhiDetails: undefined;
  DonXinVang: undefined;
  WriteDonXinVang: undefined;
  GuiYeuCauHoTro: undefined;
  WriteGuiYeuCauHoTro: undefined;
  ThongBao: undefined;
  Base: undefined;
  Test: undefined;
};

export type StackScreen<T extends keyof RootStackParamList> = React.FC<NativeStackScreenProps<RootStackParamList, T>>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
