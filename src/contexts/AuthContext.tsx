import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '../types/api/auth';
import { authService } from '../services/authService';
import { EkycVerifyRequest, EkycVerifyResponse } from '../types/ekyc';
import NotificationTokenService from '../services/NotificationTokenService';
import PushNotificationHelper from '../utils/PushNotificationHelper';

// ============================================================================
// TYPES - CityResQ360 User Roles & Data Structures
// ============================================================================

/**
 * CityResQ360 notification preferences
 */
interface NotificationPreferences {
  // Incident Alerts
  incidentAlerts: boolean;
  emergencyAlerts: boolean;
  maintenanceUpdates: boolean;

  // Location-based notifications
  nearbyIncidents: boolean;
  locationRadius: number; // km

  // Report status updates
  reportStatusUpdates: boolean;
  governmentResponses: boolean;

  // Community updates
  communityUpdates: boolean;
  systemAnnouncements: boolean;
}

/**
 * Incident Report tracking
 */
interface IncidentReport {
  id: string;
  type: 'infrastructure' | 'environment' | 'safety' | 'traffic' | 'utilities' | 'emergency';
  title: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  reportedAt: Date;
  updatedAt: Date;
  images?: string[];
  assignedTo?: string;
  resolvedAt?: Date;
}

/**
 * User's civic engagement data
 */
interface CivicEngagement {
  // Report Statistics
  totalReports: number;
  resolvedReports: number;
  pendingReports: number;

  // User Reports
  userReports: IncidentReport[];

  // Community Impact
  communityRank: number;
  civicPoints: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    earnedAt: Date;
    description: string;
  }>;

  // Engagement Metrics
  responseRate: number; // How often government responds to user's reports
  resolutionTime: number; // Average time to resolve user's reports (in hours)
  communityHelpful: number; // How many users found this user's reports helpful
}

/**
 * Government response tracking
 */
interface GovernmentActivity {
  // Assigned incidents
  assignedIncidents: IncidentReport[];

  // Response metrics
  totalAssigned: number;
  totalResolved: number;
  averageResponseTime: number; // in hours

  // Performance stats
  currentLevel: number;
  performanceScore: number;
  citizenSatisfactionRating: number;

  // Department info
  department: string;
  jurisdiction: string[];
}

/**
 * AI insights & city analytics
 */
interface AIInsights {
  // Incident predictions
  predictedIncidents: Array<{
    id: string;
    type: string;
    location: string;
    probability: number;
    timeframe: string;
    preventiveMeasures: string[];
  }>;

  // City trends
  cityTrends: {
    incidentTrend: 'improving' | 'stable' | 'worsening';
    mostCommonIssues: string[];
    responseEfficiency: 'excellent' | 'good' | 'needs_improvement';
    citizenSatisfaction: number;
  };

  // Smart recommendations
  recommendations: Array<{
    message: string;
    type: 'prevention' | 'optimization' | 'alert' | 'maintenance';
    priority: 'low' | 'medium' | 'high';
    targetAudience: string[];
  }>;
}

export interface LoginValidationResult {
  isValid: boolean;
  errors: {
    identifier?: string;
    password?: string;
  };
}

export interface LoginResult {
  success: boolean;
  needsEmailVerification?: boolean;
  identifier?: string;
  error?: string;
  errors?: {
    identifier?: string;
    password?: string;
  };
}

interface AuthContextData {
  // Authentication
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  userRole: UserRole | null;

  // Auth Methods
  validateLogin: (identifier: string, password: string, isPhoneNumber: boolean) => LoginValidationResult;
  signIn: (credentials: { identifier: string; password: string; type: 'email' | 'phone'; remember?: boolean }) => Promise<LoginResult>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  verifyEkyc: (data: EkycVerifyRequest) => Promise<EkycVerifyResponse>;

  // CityResQ360 Specific Features
  notificationPreferences: NotificationPreferences;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;

  civicEngagement: CivicEngagement | null;
  loadCivicEngagement: () => Promise<void>;
  submitIncidentReport: (report: Omit<IncidentReport, 'id' | 'reportedAt' | 'updatedAt' | 'status'>) => Promise<void>;

  governmentActivity: GovernmentActivity | null;
  loadGovernmentActivity: () => Promise<void>;

  aiInsights: AIInsights | null;
  refreshAIInsights: () => Promise<void>;

  // User settings
  updateUserSettings: (settings: any) => Promise<void>;
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  incidentAlerts: true,
  emergencyAlerts: true,
  maintenanceUpdates: true,
  nearbyIncidents: true,
  locationRadius: 5, // 5km radius
  reportStatusUpdates: true,
  governmentResponses: true,
  communityUpdates: true,
  systemAnnouncements: true,
};

// ============================================================================
// CONTEXT IMPLEMENTATION
// ============================================================================

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // CityResQ360 specific state
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [civicEngagement, setCivicEngagement] = useState<CivicEngagement | null>(null);
  const [governmentActivity, setGovernmentActivity] = useState<GovernmentActivity | null>(null);
  const [aiInsights, setAIInsights] = useState<AIInsights | null>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    initializeApp();
  }, []);

  // Thiết lập listener cho FCM token refresh
  useEffect(() => {
    if (!user) return;

    const unsubscribe = PushNotificationHelper.onTokenRefresh(async (newToken) => {
      console.log('FCM Token đã được làm mới:', newToken);
      
      try {
        await NotificationTokenService.updateTokenOnRefresh(newToken);
      } catch (error) {
        console.log('Lỗi khi cập nhật FCM token mới:', error);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const initializeApp = async () => {
    try {
      // Try to load stored token and validate it
      const token = await authService.getToken();
      if (token) {
        try {
          // Validate token by fetching profile
          const userProfile = await authService.getProfile();
          setUser(userProfile);

          // Load other data only if authenticated
          await Promise.all([
            loadNotificationPreferences(),
            loadCivicEngagement(),
            loadGovernmentActivity(),
            refreshAIInsights(),
          ]);
        } catch (error) {
          console.log('Token invalid or expired:', error);
          // Token is invalid, clear it
          await signOut();
        }
      } else {
        // No token, just load stored user (if any, though unlikely without token)
        // or just finish loading
        setUser(null);
      }
    } catch (error) {
      console.log('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  const validateLogin = (identifier: string, password: string, isPhoneNumber: boolean): LoginValidationResult => {
    const errors: { identifier?: string; password?: string } = {};

    if (!identifier) {
      errors.identifier = isPhoneNumber ? 'PHONE_REQUIRED' : 'EMAIL_REQUIRED';
    } else if (isPhoneNumber) {
      if (!/^\d{9,10}$/.test(identifier)) {
        errors.identifier = 'VALID_PHONE';
      }
    } else {
      if (!/\S+@\S+\.\S+/.test(identifier)) {
        errors.identifier = 'VALID_EMAIL';
      }
    }

    if (!password) {
      errors.password = 'PASSWORD_REQUIRED';
    } else if (password.length < 6) {
      errors.password = 'PASSWORD_MIN_LENGTH';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  const signIn = async (credentials: { identifier: string; password: string; type: 'email' | 'phone'; remember?: boolean }): Promise<LoginResult> => {
    try {
      console.log('Login attempt:', credentials.identifier);

      // Map identifier to email as per Postman collection
      const response = await authService.login({
        email: credentials.identifier,
        mat_khau: credentials.password,
        remember: credentials.remember
      });

      console.log('Login successful:', response);

      setUser(response.user);

      // Load user's CityResQ360 data after sign inc
      await Promise.all([
        loadNotificationPreferences(),
        loadCivicEngagement(),
        loadGovernmentActivity(),
        refreshAIInsights(),
      ]);

      // Đăng ký FCM token với server sau khi đăng nhập thành công
      try {
        await NotificationTokenService.registerTokenAfterLogin();
        console.log('FCM token đã được đăng ký thành công');
      } catch (fcmError) {
        // Log lỗi nhưng không làm thất bại đăng nhập
        console.log('Lỗi khi đăng ký FCM token (không ảnh hưởng đến đăng nhập):', fcmError);
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.log('Login error:', error.response?.data || error.message);

      let errorMessage = 'Login failed. Please try again.';
      const errors: { identifier?: string; password?: string } = {};

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        errors.identifier = errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
        errors.identifier = errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        errors,
      };
    }
  };

  const signUp = async (userData: any) => {
    try {
      await authService.register(userData);
      // Initialize default preferences for new users
      await saveNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    } catch (error: any) {
      console.log('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Hủy đăng ký FCM token trước khi đăng xuất
      try {
        await NotificationTokenService.unregisterTokenAfterLogout();
        console.log('FCM token đã được hủy đăng ký');
      } catch (fcmError) {
        // Log lỗi nhưng vẫn tiếp tục đăng xuất
        console.log('Lỗi khi hủy đăng ký FCM token (không ảnh hưởng đến đăng xuất):', fcmError);
      }

      await authService.logout();
      setUser(null);

      // Clear CityResQ360 data
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      setCivicEngagement(null);
      setGovernmentActivity(null);
      setAIInsights(null);

      // Clear AsyncStorage
      await AsyncStorage.multiRemove([
        '@notification_preferences',
        '@civic_engagement',
        '@government_activity',
        '@ai_insights',
      ]);
    } catch (error: any) {
      console.log('Sign out error:', error);
      throw error;
    }
  };

  const verifyEkyc = async (data: EkycVerifyRequest): Promise<EkycVerifyResponse> => {
    try {
      return await authService.verifyEkyc(data);
    } catch (error: any) {
      console.log('eKYC verification error:', error);
      throw error;
    }
  };

  // ============================================================================
  // NOTIFICATION PREFERENCES
  // ============================================================================

  const loadNotificationPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem('@notification_preferences');
      if (stored) {
        setNotificationPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading notification preferences:', error);
    }
  };

  const saveNotificationPreferences = async (prefs: NotificationPreferences) => {
    try {
      await AsyncStorage.setItem('@notification_preferences', JSON.stringify(prefs));
    } catch (error) {
      console.log('Error saving notification preferences:', error);
    }
  };

  const updateNotificationPreferences = async (preferences: Partial<NotificationPreferences>) => {
    try {
      const updated = { ...notificationPreferences, ...preferences };
      setNotificationPreferences(updated);
      await saveNotificationPreferences(updated);
    } catch (error) {
      console.log('Error updating notification preferences:', error);
      throw error;
    }
  };

  // ============================================================================
  // CIVIC ENGAGEMENT TRACKING
  // ============================================================================

  const loadCivicEngagement = async () => {
    try {
      const stored = await AsyncStorage.getItem('@civic_engagement');
      if (stored) {
        setCivicEngagement(JSON.parse(stored));
      } else {
        // Initialize default civic engagement data
        const defaultEngagement: CivicEngagement = {
          totalReports: 0,
          resolvedReports: 0,
          pendingReports: 0,
          userReports: [],
          communityRank: 0,
          civicPoints: 0,
          badges: [],
          responseRate: 0,
          resolutionTime: 0,
          communityHelpful: 0,
        };
        setCivicEngagement(defaultEngagement);
      }
    } catch (error) {
      console.log('Error loading civic engagement:', error);
    }
  };

  const submitIncidentReport = async (report: Omit<IncidentReport, 'id' | 'reportedAt' | 'updatedAt' | 'status'>) => {
    try {
      const newReport: IncidentReport = {
        ...report,
        id: Date.now().toString(),
        reportedAt: new Date(),
        updatedAt: new Date(),
        status: 'pending',
      };

      const updatedEngagement = {
        ...civicEngagement!,
        userReports: [...(civicEngagement?.userReports || []), newReport],
        totalReports: (civicEngagement?.totalReports || 0) + 1,
        pendingReports: (civicEngagement?.pendingReports || 0) + 1,
        civicPoints: (civicEngagement?.civicPoints || 0) + 10,
      };

      setCivicEngagement(updatedEngagement);
      await AsyncStorage.setItem('@civic_engagement', JSON.stringify(updatedEngagement));

      await refreshAIInsights();
    } catch (error) {
      console.log('Error submitting incident report:', error);
      throw error;
    }
  };

  // ============================================================================
  // GOVERNMENT ACTIVITY TRACKING
  // ============================================================================

  const loadGovernmentActivity = async () => {
    try {
      const stored = await AsyncStorage.getItem('@government_activity');
      if (stored) {
        setGovernmentActivity(JSON.parse(stored));
      } else {
        // Initialize default government activity data
        const defaultActivity: GovernmentActivity = {
          assignedIncidents: [],
          totalAssigned: 0,
          totalResolved: 0,
          averageResponseTime: 0,
          currentLevel: 1,
          performanceScore: 0,
          citizenSatisfactionRating: 0,
          department: '',
          jurisdiction: [],
        };
        setGovernmentActivity(defaultActivity);
      }
    } catch (error) {
      console.log('Error loading government activity:', error);
    }
  };

  // ============================================================================
  // AI INSIGHTS & RECOMMENDATIONS
  // ============================================================================

  const refreshAIInsights = async () => {
    try {
      // Mock insights for now
      const mockInsights: AIInsights = {
        predictedIncidents: [
          {
            id: '1',
            type: 'infrastructure',
            location: 'Quận 1',
            probability: 0.75,
            timeframe: 'Trong 7 ngày tới',
            preventiveMeasures: ['Kiểm tra đường ống nước', 'Bảo trì định kỳ'],
          },
        ],
        cityTrends: {
          incidentTrend: 'stable',
          mostCommonIssues: ['Đường xá hư hỏng', 'Cống rãnh tắc nghẽn', 'Đèn đường hỏng'],
          responseEfficiency: 'good',
          citizenSatisfaction: 4.2,
        },
        recommendations: [
          {
            message: 'Tăng cường bảo trì đường xá ở khu vực trung tâm',
            type: 'prevention',
            priority: 'high',
            targetAudience: ['government', 'maintenance_team'],
          },
        ],
      };

      setAIInsights(mockInsights);
      await AsyncStorage.setItem('@ai_insights', JSON.stringify(mockInsights));
    } catch (error) {
      console.log('Error refreshing AI insights:', error);
    }
  };

  // ============================================================================
  // USER SETTINGS
  // ============================================================================

  const updateUserSettings = async (settings: any) => {
    try {
      console.log('Updating user settings:', settings);
    } catch (error) {
      console.log('Error updating user settings:', error);
      throw error;
    }
  };

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const userRole = user?.role ?? null;

  // ============================================================================
  // CONTEXT PROVIDER
  // ============================================================================

  return (
    <AuthContext.Provider
      value={{
        // Authentication
        isAuthenticated: !!user,
        user,
        loading,
        userRole,
        validateLogin,
        signIn,
        signUp,
        signOut,
        verifyEkyc,

        // CityResQ360 Features
        notificationPreferences,
        updateNotificationPreferences,

        civicEngagement,
        loadCivicEngagement,
        submitIncidentReport,

        governmentActivity,
        loadGovernmentActivity,

        aiInsights,
        refreshAIInsights,

        updateUserSettings,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }

  return context;
}

export type {
  NotificationPreferences,
  IncidentReport,
  CivicEngagement,
  GovernmentActivity,
  AIInsights,
  AuthContextData,
};