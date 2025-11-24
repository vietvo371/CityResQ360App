import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, User, SignUpData } from '../utils/authApi';
import { EkycVerifyRequest, EkycVerifyResponse } from '../types/ekyc';
import api from '../utils/Api';
import { saveToken, saveUser } from '../utils/TokenManager';

// ============================================================================
// TYPES - CityResQ360 User Roles & Data Structures
// ============================================================================

/**
 * User roles in CityResQ360 ecosystem
 * - citizen: Người dân báo cáo sự cố đô thị
 * - government: Cán bộ chính quyền xử lý sự cố
 * - admin: Quản trị viên hệ thống
 * - ai_system: Hệ thống AI phân tích và phân loại sự cố
 * - emergency_responder: Đội ứng cứu khẩn cấp
 * - maintenance_team: Đội bảo trì cơ sở hạ tầng
 */
type UserRole = 
  | 'citizen' 
  | 'government' 
  | 'admin' 
  | 'ai_system' 
  | 'emergency_responder' 
  | 'maintenance_team';

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
    targetAudience: UserRole[];
  }>;
}

/**
 * Login validation result
 */
export interface LoginValidationResult {
  isValid: boolean;
  errors: {
    identifier?: string;
    password?: string;
  };
}

/**
 * Login result
 */
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

/**
 * Main Auth Context Data
 */
interface AuthContextData {
  // Authentication
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  userRole: UserRole | null;
  
  // Auth Methods
  validateLogin: (identifier: string, password: string, isPhoneNumber: boolean) => LoginValidationResult;
  signIn: (credentials: { identifier: string; password: string; type: 'email' | 'phone' }) => Promise<LoginResult>;
  signUp: (userData: SignUpData) => Promise<void>;
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

  const initializeApp = async () => {
    try {
      await loadStoredUser();
      await loadNotificationPreferences();
      await loadCivicEngagement();
      await loadGovernmentActivity();
      await refreshAIInsights();
    } catch (error) {
      console.log('Error initializing app:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  const loadStoredUser = async () => {
    try {
      const storedUser = await authApi.loadStoredUser();
      setUser(storedUser);
    } catch (error) {
      console.log('Error loading stored user:', error);
    }
  };

  /**
   * Validate login form
   * Returns error keys that can be translated in the UI
   */
  const validateLogin = (identifier: string, password: string, isPhoneNumber: boolean): LoginValidationResult => {
    const errors: { identifier?: string; password?: string } = {};

    // Validate identifier (email or phone)
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

    // Validate password
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

  /**
   * Sign in user with validation and error handling
   */
  const signIn = async (credentials: { identifier: string; password: string; type: 'email' | 'phone' }): Promise<LoginResult> => {
    try {
      console.log('Login attempt:', credentials.identifier);
      console.log('Login type:', credentials.type);

      // Call the API - CityResQ360 API format
      const response = await api.post('/auth/login', {
        email: credentials.identifier,
        mat_khau: credentials.password,
        remember: true,
      });

      console.log('Login response:', response.data);

      // Handle API response - CityResQ360 format
      if (!response.data.success) {
        return {
          success: false,
          error: response.data.message || 'Đăng nhập thất bại',
          errors: {
            identifier: response.data.message || 'Email hoặc mật khẩu không đúng',
          },
        };
      }

      // Login successful
      console.log('Login successful:', response.data.data);
      
      // Save user and token - CityResQ360 format
      await saveUser(response.data.data.user);
      await saveToken(response.data.data.token);
      
      // Update context state
      setUser(response.data.data.user);
      
      // Load user's CityResQ360 data after sign in
      await Promise.all([
        loadNotificationPreferences(),
        loadCivicEngagement(),
        loadGovernmentActivity(),
        refreshAIInsights(),
      ]);

      return {
        success: true,
      };
    } catch (error: any) {
      console.log('Login error:', error);

      // Handle different types of errors
      let errorMessage = 'Login failed. Please try again.';
      const errors: { identifier?: string; password?: string } = {};

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        errors.identifier = errorMessage;
      } else if (error.response?.data?.errors) {
        // Handle validation errors from API
        const apiErrors = error.response.data.errors;
        const firstError = Object.values(apiErrors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
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

  const signUp = async (userData: SignUpData) => {
    try {
      await authApi.signUp(userData);
      // Initialize default preferences for new users
      await saveNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    } catch (error: any) {
      console.log('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
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
      return await authApi.verifyEkyc(data);
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
      
      // TODO: Sync with backend API
      // await authApi.updateNotificationPreferences(updated);
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
      
      // TODO: Fetch from backend
      // const engagement = await authApi.getCivicEngagement();
      // setCivicEngagement(engagement);
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
      
      // TODO: Sync with backend
      // await authApi.submitIncidentReport(newReport);
      
      // Refresh AI insights after submitting report
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
      
      // TODO: Fetch from backend
      // const activity = await authApi.getGovernmentActivity();
      // setGovernmentActivity(activity);
    } catch (error) {
      console.log('Error loading government activity:', error);
    }
  };

  // ============================================================================
  // AI INSIGHTS & RECOMMENDATIONS
  // ============================================================================

  const refreshAIInsights = async () => {
    try {
      // TODO: Fetch real AI insights from backend
      // For now, generate mock insights based on user data
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
      
      // TODO: Real API call
      // const insights = await authApi.getAIInsights();
      // setAIInsights(insights);
    } catch (error) {
      console.log('Error refreshing AI insights:', error);
    }
  };

  // ============================================================================
  // USER SETTINGS
  // ============================================================================

  const updateUserSettings = async (settings: any) => {
    try {
      // TODO: Implement user settings update
      console.log('Updating user settings:', settings);
      // await authApi.updateUserSettings(settings);
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

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }

  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  UserRole,
  NotificationPreferences,
  IncidentReport,
  CivicEngagement,
  GovernmentActivity,
  AIInsights,
  AuthContextData,
};