import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { AlertService } from '../../services/AlertService';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  theme,
  wp,
  hp,
  SPACING,
  FONT_SIZE,
  BORDER_RADIUS,
  ICON_SIZE,
  BUTTON_HEIGHT,
  AVATAR_SIZE,
} from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import InputCustom from '../../component/InputCustom';
import ButtonCustom from '../../component/ButtonCustom';
import LoadingOverlay from '../../component/LoadingOverlay';
import LanguageSelector from '../../component/LanguageSelector';
import { useTranslation } from '../../hooks/useTranslation';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { validateLogin, signIn } = useAuth();
  const { t, getCurrentLanguage } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string, password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const validateForm = () => {
    const newErrors: { username?: string; password?: string } = {};

    // Validate username
    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // const result = await signIn({
      //   identifier,
      //   password,
      //   type: isPhoneNumber ? 'phone' : 'email',
      // });
      navigation.navigate('StudentTabs');

      // if (result.success) {
      //   // Login successful - navigate to main tabs
      //   navigation.navigate('StudentTabs');
      // } else if (result.needsEmailVerification) {
      //   // Email not verified - show alert and navigate to OTP verification
      //   AlertService.warning(
      //     t('auth.verifyEmailRequired') || 'Email chưa được xác thực',
      //     result.error || t('auth.verifyEmailToContinue') || 'Email của bạn chưa được xác thực. Vui lòng xác thực để tiếp tục.',
      //     [
      //       {
      //         text: t('common.confirm'),
      //         onPress: () => navigation.navigate('OTPVerification', {
      //           identifier: result.identifier || identifier,
      //           type: 'email',
      //           flow: 'register',
      //         }),
      //       },
      //       {
      //         text: t('common.cancel'),
      //         style: 'cancel',
      //       },
      //     ]
      //   );
      // } else {
      //   if (result.errors) {
      //     setErrors(result.errors);
      //   } else if (result.error) {
      //     AlertService.error(t('auth.loginFailed'), result.error);
      //   }
      // }
    } catch (error: any) {
      console.log('Login error:', error);
      AlertService.error(t('auth.loginFailed'), error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    AlertService.info('Coming Soon', `${provider} login will be available soon`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundContainer}>

        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setShowLanguageSelector(true)}
          >
            <Image
              source={getCurrentLanguage() === 'vi'
                ? require('../../assets/images/logo_vietnam.jpg')
                : require('../../assets/images/logo_eng.png')
              }
              style={styles.languageFlag}
            />
          </TouchableOpacity>
        </View>

        <LanguageSelector
          visible={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
          onSelect={(code: string) => {
            // Handle language change
            console.log('Selected language:', code);
          }}
          currentLanguage={getCurrentLanguage()}
        />

      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View
            style={styles.headerContainer}
            entering={FadeInDown.duration(600).springify()}
          >
            <Animated.Text
              style={styles.welcomeText}
              entering={FadeInDown.duration(800).delay(200).springify()}
            >
              {t('auth.welcomeBack')}
            </Animated.Text>

            <Animated.Image
              source={require('../../assets/images/logo_wise.png')}
              style={styles.logoImage}
              resizeMode="contain"
              entering={FadeInDown.duration(800).delay(400).springify()}
            />
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={styles.formContainer}
            entering={SlideInDown.duration(800).delay(800).springify()}
          >
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{t('auth.signIn')}</Text>
              <Text style={styles.formSubtitle}>
                {t('auth.signInToAccount') || 'Sign in to start your environmental journey'}
              </Text>
            </View>

            <View style={styles.form}>
              <InputCustom
                label="Tên đăng nhập"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                error={errors.username}
                required
                leftIcon="account-outline"
                containerStyle={styles.input}
              />
              <InputCustom
                label="Mật khẩu"
                placeholder="Nhập mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={errors.password}
                required
                leftIcon="lock-outline"
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                containerStyle={styles.input}
              />

              <ButtonCustom
                title={t('auth.signIn')}
                onPress={handleLogin}
                style={styles.loginButton}
                icon="login"
              />

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>

              {/* Social Login */}
              {/* <View style={styles.socialContainer}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.googleButton]}
                  onPress={() => handleSocialLogin('Google')}
                  activeOpacity={0.7}
                >
                  <Icon name="google" size={24} color="#DB4437" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.socialButton, styles.facebookButton]}
                  onPress={() => handleSocialLogin('Facebook')}
                  activeOpacity={0.7}
                >
                  <Icon name="whatsapp" size={24} color="#4267B2" />
                </TouchableOpacity>

                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={[styles.socialButton, styles.appleButton]}
                    onPress={() => handleSocialLogin('Apple')}
                    activeOpacity={0.7}
                  >
                    <Icon name="apple" size={24} color="#000000" />
                  </TouchableOpacity>
                )}
              </View> */}
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={styles.footerContainer}
            entering={FadeInUp.duration(600).delay(1200).springify()}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('LoginParent')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>
                Bạn là phụ huynh?{' '}
                <Text style={styles.registerLinkText}>Đăng nhập tại đây</Text>
              </Text>
            </TouchableOpacity>



            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Icon name="shield-check" size={ICON_SIZE.xs} color={theme.colors.primary} />
              <Text style={styles.securityText}>
                {t('auth.dataProtected')}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} message={t('auth.signingIn')} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  headerIcons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? hp('9%') : hp('4%'),
    right: SPACING.lg,
    flexDirection: 'column',
    gap: SPACING.md,
    zIndex: 1,
  },
  headerIconButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  languageFlag: {
    width: ICON_SIZE.md,
    height: ICON_SIZE.md,
    borderRadius: ICON_SIZE.md / 2,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: hp('-6%'),
    right: wp('-12%'),
    width: wp('37.5%'),
    height: wp('37.5%'),
    borderRadius: wp('18.75%'),
    backgroundColor: theme.colors.primary + '15',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: hp('-4%'),
    left: wp('-7.5%'),
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('12.5%'),
    backgroundColor: theme.colors.secondary + '15',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },

  // Header Styles
  headerContainer: {
    alignItems: 'center',
    paddingTop: hp('8%'),
    paddingBottom: SPACING.xl,
  },
  logoContainer: {
    marginBottom: SPACING.lg,
  },
  logoBackground: {
    width: AVATAR_SIZE.lg,
    height: AVATAR_SIZE.lg,
    borderRadius: AVATAR_SIZE.lg / 2,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  welcomeText: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    marginBottom: SPACING.xs,
  },
  logoImage: {
    width: wp('50%'),
    height: hp('8%'),
    marginBottom: SPACING.md,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: FONT_SIZE['4xl'],
    color: theme.colors.primary,
    marginBottom: SPACING.sm,
    fontWeight: theme.typography.fontWeight.bold,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: FONT_SIZE.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZE.md * 1.5,
    paddingHorizontal: SPACING.lg,
  },

  // Form Styles
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
    ...theme.shadows.xl,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  formTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: FONT_SIZE['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: SPACING.xs,
  },
  formSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },

  // Input Type Indicator
  inputTypeIndicator: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: wp('1%'),
    marginBottom: SPACING.lg,
  },
  inputTypeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  inputTypeTabActive: {
    backgroundColor: theme.colors.white,
    ...theme.shadows.sm,
  },
  inputTypeText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
  },
  inputTypeTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  input: {
    marginBottom: SPACING.lg,
  },
  phoneInputContainer: {
    marginBottom: SPACING.lg,
  },
  countryPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  countryFlag: {
    fontSize: ICON_SIZE.md,
    marginRight: SPACING.sm,
  },
  countryCode: {
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    marginRight: SPACING.sm,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    flex: 1,
  },
  loginButton: {
    marginBottom: SPACING.md,
    height: BUTTON_HEIGHT.lg,
  },

  // Forgot Password Styles
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },

  // Divider Styles
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    marginHorizontal: SPACING.lg,
  },

  // Social Login Styles
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  socialButton: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  googleButton: {},
  facebookButton: {},
  appleButton: {},

  // Footer Styles
  footerContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  registerLink: {
    paddingVertical: SPACING.sm,
  },
  registerText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    textAlign: 'center',
  },
  registerLinkText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  helpSection: {
    alignItems: 'center',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  helpText: {
    fontSize: FONT_SIZE.sm,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20',
  },
  securityText: {
    fontSize: FONT_SIZE.xs,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
    flex: 1,
  },
});

export default LoginScreen;
