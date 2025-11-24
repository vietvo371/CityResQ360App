import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Image,
} from 'react-native';
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
} from '../../theme';
import InputCustom from '../../component/InputCustom';
import ButtonCustom from '../../component/ButtonCustom';
import LoadingOverlay from '../../component/LoadingOverlay';
import LanguageSelector from '../../component/LanguageSelector';
import api from '../../utils/Api';
import { useTranslation } from '../../hooks/useTranslation';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { t, getCurrentLanguage } = useTranslation();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string }>({});
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const validateForm = () => {
    const newErrors: { username?: string } = {};

    if (!username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập hoặc email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSendOTPForgot = async () => {
    if (!validateForm()) {
      return;
    }
    console.log('Send OTP for forgot password with username:', username);
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        username,
        type: 'username',
      });

      console.log('Send OTP response:', response.data);

      if (response.data.status) {
        navigation.navigate('OTPVerification', {
          identifier: username,
          type: 'username',
          flow: 'forgot',
        })
      } else {
        setErrors({
          username: response.data.message
        });
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach(field => {
          newErrors[field] = error.response.data.errors[field][0];
        });
        setErrors(newErrors);
      } else if (error.response?.data?.message) {
        setErrors({
          username: error.response.data.message
        });
      } else if (error.message) {
        setErrors({
          username: error.message
        });
      } else {
        setErrors({
          username: 'Failed to send OTP. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
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
          onSelect={(code) => {
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
          {/* Back Button */}
          <Animated.View
            style={styles.backButtonContainer}
            entering={FadeInDown.duration(400).springify()}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={ICON_SIZE.sm} color={theme.colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Header Section */}
          <Animated.View
            style={styles.headerContainer}
            entering={FadeInDown.duration(600).delay(200).springify()}
          >
            <View style={styles.iconContainer}>
              <Icon name="lock-reset" size={ICON_SIZE.xl} color={theme.colors.primary} />
            </View>

            <Text style={styles.title}>
              {t('auth.forgotPasswordTitle')}
            </Text>
            <Text style={styles.subtitle}>
              {t('auth.forgotPasswordSubtitle')}
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={styles.formContainer}
            entering={SlideInDown.duration(800).delay(400).springify()}
          >
            <View style={styles.form}>
              <InputCustom
                label="Tên đăng nhập hoặc Email"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                error={errors.username}
                required
                leftIcon="account-outline"
                containerStyle={styles.input}
              />

              <ButtonCustom
                title={t('auth.sendVerificationCode')}
                onPress={handleSendOTPForgot}
                style={styles.resetButton}
                icon="send"
              />
              {/* Back to Login */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backToLoginContainer}
              >
                <Text style={styles.backToLoginText}>
                  {t('auth.rememberPassword')}{' '}
                  <Text style={styles.backToLoginLinkText}>{t('auth.signInLink')}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={styles.footerContainer}
            entering={FadeInUp.duration(600).delay(800).springify()}
          >
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

      <LoadingOverlay visible={loading} message={t('auth.sendingVerificationCode')} />
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
    right: wp('-10%'),
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    backgroundColor: theme.colors.success + '15',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: hp('-4%'),
    left: wp('-8%'),
    width: wp('24%'),
    height: wp('24%'),
    borderRadius: wp('12%'),
    backgroundColor: theme.colors.info + '15',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
  },

  // Back Button
  backButtonContainer: {
    paddingTop: hp('2%'),
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('5%'),
    backgroundColor: theme.colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header Styles
  headerContainer: {
    alignItems: 'center',
    paddingBottom: SPACING['2xl'],
  },
  iconContainer: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: FONT_SIZE['2xl'],
    color: theme.colors.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
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
  form: {
    width: '100%',
  },
  input: {
    marginBottom: SPACING.lg,
  },
  resetButton: {
    marginBottom: SPACING.lg,
    height: BUTTON_HEIGHT.lg,
  },

  // Back to Login
  backToLoginContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backToLoginText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: FONT_SIZE.md,
    color: theme.colors.text,
    textAlign: 'center',
  },
  backToLoginLinkText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Footer Styles
  footerContainer: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
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

export default ForgotPasswordScreen;
