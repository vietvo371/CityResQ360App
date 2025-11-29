import * as React from 'react';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme, TAB_BAR } from '../theme';
import { RootStackParamList, MainTabParamList } from './types';
import CustomTabBar from '../components/navigation/CustomTabBar';

// Auth flow screens
import LoadingScreen from '../screens/auth/LoadingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import ChangePasswordScreen from '../screens/auth/ChangePasswordScreen';
import UpdatePasswordScreen from '../screens/auth/UpdatePasswordScreen';
import EmailVerificationScreen from '../screens/auth/EmailVerificationScreen';
import PhoneVerificationScreen from '../screens/auth/PhoneVerificationScreen';

// Main tabs screens
import HomeScreen from '../screens/main/HomeScreen';
import MapScreen from '../screens/main/MapScreen';
import ReportsScreen from '../screens/main/ReportsScreen';
import WalletScreen from '../screens/main/WalletScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Reports Module
import ReportListScreen from '../screens/reports/ReportListScreen';
import ReportDetailScreen from '../screens/reports/ReportDetailScreen';
import CreateReportScreen from '../screens/reports/CreateReportScreen';
import EditReportScreen from '../screens/reports/EditReportScreen';
import MyReportsScreen from '../screens/reports/MyReportsScreen';
import NearbyReportsScreen from '../screens/reports/NearbyReportsScreen';
import TrendingReportsScreen from '../screens/reports/TrendingReportsScreen';
import ReportCommentsScreen from '../screens/reports/ReportCommentsScreen';

// Wallet Module
import WalletDetailScreen from '../screens/wallet/WalletDetailScreen';
import WalletTransactionsScreen from '../screens/wallet/WalletTransactionsScreen';
import WalletRewardsScreen from '../screens/wallet/WalletRewardsScreen';
import RedeemRewardScreen from '../screens/wallet/RedeemRewardScreen';

// Notifications Module
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationSettingsScreen from '../screens/notifications/NotificationSettingsScreen';

// Stats Module
import DashboardScreen from '../screens/stats/DashboardScreen';
import StatsOverviewScreen from '../screens/stats/StatsOverviewScreen';
import StatsCategoriesScreen from '../screens/stats/StatsCategoriesScreen';
import StatsTimelineScreen from '../screens/stats/StatsTimelineScreen';
import LeaderboardScreen from '../screens/stats/LeaderboardScreen';
import CityStatsScreen from '../screens/stats/CityStatsScreen';

// Map Module
import MapReportsScreen from '../screens/map/MapReportsScreen';
import MapHeatmapScreen from '../screens/map/MapHeatmapScreen';
import MapClustersScreen from '../screens/map/MapClustersScreen';
import MapRoutesScreen from '../screens/map/MapRoutesScreen';

// Agencies Module
import AgencyListScreen from '../screens/agencies/AgencyListScreen';
import AgencyDetailScreen from '../screens/agencies/AgencyDetailScreen';
import AgencyReportsScreen from '../screens/agencies/AgencyReportsScreen';
import AgencyStatsScreen from '../screens/agencies/AgencyStatsScreen';

// Profile Module
import UserProfileScreen from '../screens/profile/UserProfileScreen';
import UserReportsScreen from '../screens/profile/UserReportsScreen';
import UserStatsScreen from '../screens/profile/UserStatsScreen';
import ChangePasswordLoggedInScreen from '../screens/profile/ChangePasswordLoggedInScreen';

// Settings Module
import LanguageSettingsScreen from '../screens/settings/LanguageSettingsScreen';
import HelpCenterScreen from '../screens/settings/HelpCenterScreen';
import AboutScreen from '../screens/settings/AboutScreen';

// Placeholder component for screens that don't exist yet
const PlaceholderScreen = ({ route }: any) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>{route.name}</Text>
    <Text style={styles.placeholderSubtext}>Screen đang được phát triển</Text>
  </View>
);

const Stack = createNativeStackNavigator<RootStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const tabScreenOptions = {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.primary,
    tabBarInactiveTintColor: theme.colors.textSecondary,
  };

  return (
    <MainTab.Navigator
      screenOptions={tabScreenOptions}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <MainTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color }) => <Icon name="home-variant" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <MainTab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Bản đồ',
          tabBarIcon: ({ color }) => <Icon name="map-marker-outline" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      {/* Center button - placeholder tab (handled by CustomTabBar) */}
      <MainTab.Screen
        name="CreateReport"
        component={CreateReportScreen}
        options={{
          // title: 'Tạo',
          tabBarIcon: ({ color }) => <Icon name="plus" size={TAB_BAR.iconSize} color={color} />,
          tabBarButton: () => null, // Hide default tab button
        }}
      />
      <MainTab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          title: 'Ví điểm',
          tabBarIcon: ({ color }) => <Icon name="wallet-outline" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
      <MainTab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color }) => <Icon name="account-circle" size={TAB_BAR.iconSize} color={color} />,
        }}
      />
    </MainTab.Navigator>
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
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      </Stack.Group>

      <Stack.Group>
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Group>

      <Stack.Group>
        {/* Auth screens */}
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen as any} />
        <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
        <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />

        {/* Reports Module */}
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="ReportDetail" component={ReportDetailScreen} />
        <Stack.Screen name="CreateReport" component={CreateReportScreen} />
        <Stack.Screen name="EditReport" component={EditReportScreen} />
        <Stack.Screen name="MyReports" component={MyReportsScreen} />
        <Stack.Screen name="NearbyReports" component={NearbyReportsScreen} />
        <Stack.Screen name="TrendingReports" component={TrendingReportsScreen} />

        {/* Comments Module */}
        <Stack.Screen name="ReportComments" component={ReportCommentsScreen} />

        {/* Map Module */}
        <Stack.Screen name="MapReports" component={MapReportsScreen} />
        <Stack.Screen name="MapHeatmap" component={MapHeatmapScreen} />
        <Stack.Screen name="MapClusters" component={MapClustersScreen} />
        <Stack.Screen name="MapRoutes" component={MapRoutesScreen} />

        {/* Wallet Module */}
        <Stack.Screen name="WalletDetail" component={WalletDetailScreen} />
        <Stack.Screen name="WalletTransactions" component={WalletTransactionsScreen} />
        <Stack.Screen name="WalletRewards" component={WalletRewardsScreen} />
        <Stack.Screen name="RedeemReward" component={RedeemRewardScreen} />

        {/* Notifications Module */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />

        {/* Dashboard/Stats Module */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="StatsOverview" component={StatsOverviewScreen} />
        <Stack.Screen name="StatsCategories" component={StatsCategoriesScreen} />
        <Stack.Screen name="StatsTimeline" component={StatsTimelineScreen} />
        <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
        <Stack.Screen name="CityStats" component={CityStatsScreen} />

        {/* Agencies Module */}
        <Stack.Screen name="AgencyList" component={AgencyListScreen} />
        <Stack.Screen name="AgencyDetail" component={AgencyDetailScreen} />
        <Stack.Screen name="AgencyReports" component={AgencyReportsScreen} />
        <Stack.Screen name="AgencyStats" component={AgencyStatsScreen} />

        {/* User Profile Module */}
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="UserReports" component={UserReportsScreen} />
        <Stack.Screen name="UserStats" component={UserStatsScreen} />
        <Stack.Screen name="ChangePasswordLoggedIn" component={ChangePasswordLoggedInScreen} />

        {/* Settings Module */}
        <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 20,
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});

export default MainNavigator;
