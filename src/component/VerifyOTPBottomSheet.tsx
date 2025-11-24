import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  Alert,
  Keyboard,
  AppState,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import LoadingOverlay from './LoadingOverlay';
import api from '../utils/Api';
import { useTranslation } from '../hooks/useTranslation';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const OTP_LENGTH = 6;

export type OtpMode = 'action' | 'register' | 'forgot';

type EndpointBuilder = {
  url: string;
  buildBody: (p: { identifier: string; type: 'email' | 'phone'; otp?: string }) => any;
};

export interface VerifyOTPBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  identifier: string;
  type: 'email' | 'phone';
  typeEnpoints?: 'bank' | 'wallet';
  mode?: OtpMode;
  onVerified: (payload: { otp: string; token?: string; response?: any }) => void;
  title?: string;
  message?: string;
  resendDisabledSeconds?: number;
  endpoints?: {
    verify?: EndpointBuilder;
    resend?: EndpointBuilder;
  };
}

const VerifyOTPBottomSheet: React.FC<VerifyOTPBottomSheetProps> = ({
  visible,
  onClose,
  identifier,
  type,
  typeEnpoints,
  mode = 'action',
  onVerified,
  title,
  message,
  resendDisabledSeconds = 60,
  endpoints,
}) => {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [otpString, setOtpString] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(resendDisabledSeconds);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [hasVerified, setHasVerified] = useState<boolean>(false);
  const hiddenInputRef = useRef<TextInput>(null);
  const [openId, setOpenId] = useState<number>(0);
  const openOtpTimeoutRef = useRef<any>(null);
  const clipboardTimeoutRef = useRef<any>(null);

  // Compute default endpoints if not provided
  const verifyEndpoint: EndpointBuilder = useMemo(() => {
    if (endpoints?.verify) return endpoints.verify;
    
    if (typeEnpoints) {
      return {
        url: '/client/verify-otp-bank-wallet',
        buildBody: ({ identifier, type, otp }) => (
          type === 'email'
            ? { email: identifier, type: typeEnpoints, otp }
            : { phone: identifier, type: typeEnpoints, otp }
        ),
      };
    }
    
    return {
      url: '/client/verify-otp-bank-wallet',
      buildBody: ({ identifier, type, otp }) => (
        type === 'email'
          ? { email: identifier, type: typeEnpoints, otp }
          : { phone: identifier, type: typeEnpoints, otp }
      ),
    };
  }, [endpoints?.verify, mode, typeEnpoints]);

  const resendEndpoint: EndpointBuilder = useMemo(() => {
    if (endpoints?.resend) return endpoints.resend;
    
    if (typeEnpoints) {
      return {
        url: '/client/send-otp-bank-wallet',
        buildBody: ({ identifier, type }) => (
          type === 'email'
            ? { email: identifier, type: typeEnpoints }
            : { phone: identifier, type: typeEnpoints }
        ),
      };
    }
    
    return {
      url: '/auth/resend-otp',
      buildBody: ({ identifier, type }) => ({ username: identifier, type }),
    };
  }, [endpoints?.resend, typeEnpoints]);

  // Reset state when modal opens
  const resetState = () => {
    setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
    setCurrentIndex(0);
    setOtpString('');
    setTimer(resendDisabledSeconds);
    setCanResend(false);
    setHasVerified(false);
  };

  useEffect(() => {
    if (visible) {
      setOpenId(prev => prev + 1);
      setModalVisible(true);
      resetState();
      
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
        velocity: 2,
      }).start(() => {
        // Send OTP after animation completes to avoid blocking UI
        setTimeout(() => {
          sendOtp(true).catch(() => undefined);
        }, 100);
      });

      // Try auto-fill from clipboard shortly after opening
      clipboardTimeoutRef.current = setTimeout(() => {
        if (modalVisible) tryAutofillFromClipboard();
      }, 800);

      return () => {
        if (openOtpTimeoutRef.current) clearTimeout(openOtpTimeoutRef.current);
        if (clipboardTimeoutRef.current) clearTimeout(clipboardTimeoutRef.current);
      };
    } else if (modalVisible) {
      closeModal();
    }
  }, [visible]);

  useEffect(() => {
    let interval: any;
    
    if (modalVisible && timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [modalVisible, timer, canResend]);

  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === OTP_LENGTH && !loading && !hasVerified) {
      const timeoutId = setTimeout(() => {
        handleVerify();
      }, 400);
      return () => clearTimeout(timeoutId);
    }
  }, [otp, loading, hasVerified]);

  const closeModal = () => {
    // ensure timers cleared and loading reset to avoid blocking touches
    if (openOtpTimeoutRef.current) clearTimeout(openOtpTimeoutRef.current);
    if (clipboardTimeoutRef.current) clearTimeout(clipboardTimeoutRef.current);
    setLoading(false);
    setHasVerified(false);
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      resetState();
    });
  };

  const handleClose = () => {
    if (loading) return;
    
    Keyboard.dismiss();
    hiddenInputRef.current?.blur();
    closeModal();
    onClose();
  };

  const handleKeyPress = (digit: string) => {
    if (currentIndex >= OTP_LENGTH || loading) return;
    
    if (hasVerified) setHasVerified(false);
    
    const newOtp = [...otp];
    newOtp[currentIndex] = digit;
    setOtp(newOtp);
    
    if (currentIndex < OTP_LENGTH - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDelete = () => {
    if (loading) return;
    
    if (hasVerified) setHasVerified(false);
    
    if (currentIndex > 0) {
      const newOtp = [...otp];
      newOtp[currentIndex - 1] = '';
      setOtp(newOtp);
      setCurrentIndex(currentIndex - 1);
    } else if (otp[currentIndex]) {
      const newOtp = [...otp];
      newOtp[currentIndex] = '';
      setOtp(newOtp);
    }
  };

  const handlePasteText = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (!numeric || loading) return;
    
    if (hasVerified) setHasVerified(false);
    
    const newOtp = [...otp];
    const start = currentIndex;
    
    for (let i = 0; i < Math.min(numeric.length, OTP_LENGTH - start); i++) {
      newOtp[start + i] = numeric[i];
    }
    
    setOtp(newOtp);
    const nextIndex = Math.min(start + numeric.length, OTP_LENGTH - 1);
    setCurrentIndex(nextIndex);
  };

  const handleHiddenTextChange = (text: string) => {
    setOtpString(text);
    if (text.length > otp.filter(Boolean).length) {
      handlePasteText(text);
    }
  };

  // Attempt to auto-fill OTP from clipboard when app returns to foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && modalVisible && !loading && !hasVerified) {
        tryAutofillFromClipboard();
      }
    });
    return () => {
      // @ts-ignore - RN older versions use remove()
      sub?.remove?.();
    };
  }, [modalVisible, loading, hasVerified]);

  const tryAutofillFromClipboard = async () => {
    try {
      const clip = await Clipboard.getString();
      if (!clip) return;
      const numeric = clip.replace(/[^0-9]/g, '');
      if (numeric.length < OTP_LENGTH) return;
      const code = numeric.slice(0, OTP_LENGTH);
      const arr = code.split('');
      setOtp(arr);
      setCurrentIndex(OTP_LENGTH - 1);
      setOtpString(code);
      // Trigger verify shortly after filling
      setTimeout(() => {
        if (!loading && !hasVerified) {
          handleVerify();
        }
      }, 150);
    } catch (_) {
      // ignore clipboard errors
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH || hasVerified || loading) return;
    
    setHasVerified(true);
    setLoading(true);
    Keyboard.dismiss();
    
    try {
      const body = verifyEndpoint.buildBody({ identifier, type, otp: code });
      const response = await api.post(verifyEndpoint.url, body);
      
      if (response?.data?.status === false) {
        const errorMessage = response?.data?.message || t('verifyOtpBottomSheet.verificationFailed');
        Alert.alert('OTP', errorMessage, [
          {
            text: t('verifyOtpBottomSheet.ok'),
            onPress: () => {
              resetOtpInput();
            },
          },
        ]);
        setHasVerified(false);
        setLoading(false);
        return;
      }
      
      const token = response?.data?.data?.token;
      onVerified({ otp: code, token, response: response?.data });
      handleClose();
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('verifyOtpBottomSheet.verificationError');
      // Show alert but also ensure we clear loading/verified flags to unblock UI
      Alert.alert('OTP', errorMessage);
      resetOtpInput();
      setHasVerified(false);
      setLoading(false);
    } finally {
      // no-op: loading is cleared in success/error branches to avoid double setState races
    }
  };

  const resetOtpInput = () => {
    setHasVerified(false);
    setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
    setCurrentIndex(0);
    setOtpString('');
  };

  const sendOtp = async (isInitial?: boolean) => {
    if (loading || (!isInitial && !canResend)) return;
    
    // Don't show loading for initial send to avoid blocking UI
    if (!isInitial) {
      setLoading(true);
    }
    Keyboard.dismiss();
    
    try {
      const body = resendEndpoint.buildBody({ identifier, type });
      const response = await api.post(resendEndpoint.url, body);
      
      if (response?.data?.status === false) {
        const errorMessage = response?.data?.message || t('verifyOtpBottomSheet.failedToSendOtp');
        Alert.alert('OTP', errorMessage);
      } else {
        if (!isInitial) {
          Alert.alert('OTP', t('verifyOtpBottomSheet.otpResent'));
        }
        setTimer(resendDisabledSeconds);
        setCanResend(false);
        resetOtpInput();
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || t('verifyOtpBottomSheet.failedToSendOtp');
      Alert.alert('OTP', errorMessage);
    } finally {
      if (!isInitial) {
        setLoading(false);
      }
    }
  };

  const handleResend = () => {
    if (!canResend || loading) return;
    sendOtp(false);
  };

  const focusHiddenInput = () => {
    if (!loading) {
      hiddenInputRef.current?.focus();
    }
  };

  const headerTitle = title || (
    mode === 'register' 
      ? t('verifyOtpBottomSheet.verifyAccount') 
      : mode === 'forgot' 
        ? t('verifyOtpBottomSheet.verifyResetPassword') 
        : t('verifyOtpBottomSheet.verifyOtp')
  );

  const headerMessage = message || (
    mode === 'register' 
      ? t('verifyOtpBottomSheet.enterCodeRegister', { identifier }) 
      : mode === 'forgot' 
        ? t('verifyOtpBottomSheet.enterCodeReset', { identifier }) 
        : t('verifyOtpBottomSheet.enterCodeGeneric')
  );

  const isOtpComplete = otp.join('').length === OTP_LENGTH;

  if (!modalVisible) return null;

  return (
    <Modal
      key={`otp-modal-${openId}`}
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalContainer}>
        {/* Backdrop - chỉ chiếm phần trống phía trên modal */}
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
          disabled={loading}
        />

        {/* Modal Content */}
        <Animated.View 
          style={[
            styles.modalContent, 
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.grabber} />
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}></Text>
              <TouchableOpacity 
                onPress={handleClose} 
                style={styles.closeButton}
                disabled={loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.subtitle}>{headerMessage}</Text>
          </View>

          {/* Hidden Input for Paste Functionality */}
          <TextInput
            ref={hiddenInputRef}
            style={styles.hiddenInput}
            value={otpString}
            onChangeText={handleHiddenTextChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus={false}
            caretHidden={true}
            contextMenuHidden={false}
            selectTextOnFocus={true}
            editable={!loading}
          />

          {/* OTP Input Boxes */}
          <TouchableOpacity 
            style={styles.otpContainer} 
            onPress={focusHiddenInput}
            activeOpacity={1}
            disabled={loading}
          >
            {otp.map((digit, index) => {
              const isActive = index === currentIndex;
              const isFilled = Boolean(digit);
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.otpBox,
                    isActive && styles.otpBoxActive,
                    isFilled && styles.otpBoxFilled
                  ]}
                >
                  <Text style={[styles.otpText, isFilled && styles.otpTextFilled]}>
                    {digit || (isActive ? '|' : '')}
                  </Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {/* Timer and Resend Button */}
          <View style={styles.resendContainer}>
            {!canResend ? (
              <Text style={styles.timerText}>
                {t('verifyOtpBottomSheet.resendAfter')} <Text style={styles.timerValue}>{timer}s</Text>
              </Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity 
                  onPress={handleResend} 
                  style={styles.resendButton}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendButtonText}>{t('verifyOtpBottomSheet.resendCode')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => sendOtp(true)} 
                  style={styles.resendButton}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendButtonText}>{t('verifyOtpBottomSheet.sendVerificationCode')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Number Pad */}
          <View style={styles.numberPad}>
            {/* Numbers 1-9 */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <TouchableOpacity 
                key={number} 
                style={styles.padButton} 
                onPress={() => handleKeyPress(String(number))}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={styles.padButtonText}>{number}</Text>
              </TouchableOpacity>
            ))}

            {/* Delete Button */}
            <TouchableOpacity 
              style={styles.padButton} 
              onPress={handleDelete}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Icon name="backspace-outline" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>

            {/* Zero Button */}
            <TouchableOpacity 
              style={styles.padButton} 
              onPress={() => handleKeyPress('0')}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.padButtonText}>0</Text>
            </TouchableOpacity>

            {/* Verify Button */}
            <TouchableOpacity 
              style={[
                styles.padButton, 
                styles.verifyButton,
                (!isOtpComplete || loading) && styles.verifyButtonDisabled
              ]} 
              onPress={handleVerify}
              disabled={!isOtpComplete || loading}
              activeOpacity={0.7}
            >
              <Icon 
                name="check" 
                size={22} 
                color={(!isOtpComplete || loading) ? theme.colors.textLight : theme.colors.white} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      {/* Loading Overlay */}
      <LoadingOverlay visible={loading} message={t('verifyOtpBottomSheet.verifying')} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    height: SCREEN_HEIGHT * 0.65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: 16,
  },
  header: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  closeButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    paddingHorizontal: theme.spacing.lg,
    marginTop: 6,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 0,
    height: 0,
    left: -1000,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  otpBox: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  otpText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  otpTextFilled: {
    color: theme.colors.primary,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    minHeight: 32,
    justifyContent: 'center',
  },
  timerText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
  },
  timerValue: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.sm,
  },
  resendButtonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    flex: 1,
  },
  padButton: {
    width: '30%',
    aspectRatio: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  verifyButton: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  verifyButtonDisabled: {
    backgroundColor: theme.colors.border,
  },
  padButtonText: {
    fontSize: 20,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },
});

export default VerifyOTPBottomSheet;
