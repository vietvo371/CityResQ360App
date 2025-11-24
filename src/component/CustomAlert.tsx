import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  Image,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  type?: AlertType;
  title?: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss?: () => void;
  customAnimation?: any;
  showAnimation?: boolean;
}

const { width, height } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type = 'info',
  title,
  message,
  buttons = [{ text: 'OK', style: 'default' }],
  onDismiss,
  customAnimation,
  showAnimation = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          iconColor: theme.colors.success,
          iconName: 'check-circle',
          defaultTitle: 'Thành công',
          animationSource: null,
          imageSource: null, // Có thể thêm: require('../assets/animations/success.json')
        };
      case 'error':
        return {
          iconColor: theme.colors.error,
          iconName: 'close-circle',
          defaultTitle: 'Lỗi',
          animationSource: null,
          imageSource: null,
        };
      case 'warning':
        return {
          iconColor: theme.colors.warning,
          iconName: 'alert',
          defaultTitle: 'Cảnh báo',
          animationSource: null, // Có thể thêm: require('../assets/animations/warning.json')
          imageSource: null,
        };
      case 'confirm':
        return {
          iconColor: theme.colors.info,
          iconName: 'question-circle',
          defaultTitle: 'Xác nhận',
          animationSource: null, 
          imageSource: require('../assets/images/light-bulb.png'), // Có thể thêm ảnh: require('../assets/images/light-bulb.png')
        };
      default:
        return {
          iconColor: theme.colors.info,
          iconName: 'information',
          defaultTitle: 'Thông báo',
          animationSource: null, // Có thể thêm: require('../assets/animations/info.json')
          imageSource: null,
        };
    }
  };

  const config = getAlertConfig();
  const animationSource = customAnimation || config.animationSource;
  const imageSource = config.imageSource;

  const handleButtonPress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const getButtonStyle = (buttonStyle?: string, index?: number, total?: number) => {
    const isIOS = Platform.OS === 'ios';
    
    if (total === 1) {
      return [
        styles.singleButton,
        isIOS && styles.iosButton,
        { backgroundColor: config.iconColor },
      ];
    }

    if (total === 2) {
      const baseStyle = [
        styles.dualButton,
        isIOS && styles.iosButton,
      ];

      if (buttonStyle === 'cancel') {
        return [...baseStyle, styles.cancelButton];
      }
      if (buttonStyle === 'destructive') {
        return [...baseStyle, { backgroundColor: theme.colors.error }];
      }
      
      return [...baseStyle, index === total - 1 ? { backgroundColor: config.iconColor } : styles.cancelButton];
    }

    return [styles.multiButton, isIOS && styles.iosButton];
  };

  const getButtonTextStyle = (buttonStyle?: string, index?: number, total?: number) => {
    const isIOS = Platform.OS === 'ios';
    
    if (buttonStyle === 'cancel' || (total === 2 && index === 0 && buttonStyle !== 'destructive')) {
      return [styles.buttonText, isIOS && styles.iosButtonText, styles.cancelButtonText];
    }
    
    return [styles.buttonText, isIOS && styles.iosButtonText];
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.content}>
            {/* Animation or Icon */}
            {showAnimation && (
              <View style={styles.iconContainer}>
                {imageSource ? (
                  <Image source={imageSource} style={styles.animation} resizeMode="contain" />
                ) : animationSource ? (
                  <LottieView
                    source={animationSource}
                    autoPlay
                    loop={false}
                    style={styles.animation}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.iconCircle, { backgroundColor: `${config.iconColor}15` }]}>
                    <Icon 
                      name={config.iconName} 
                      size={52} 
                      color={config.iconColor}
                    />
                  </View>
                )}
              </View>
            )}

            {/* Title */}
            {title && (
              <Text style={[styles.title, { color: config.iconColor }]}>
                {title}
              </Text>
            )}

            {/* Message */}
            {message && (
              <Text style={styles.message}>{message}</Text>
            )}

            {/* Buttons */}
            <View style={[
              styles.buttonContainer,
              buttons.length === 2 && styles.buttonContainerRow,
              buttons.length > 2 && styles.buttonContainerColumn,
            ]}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={getButtonStyle(button.style, index, buttons.length)}
                  onPress={() => handleButtonPress(button)}
                  activeOpacity={0.7}
                >
                  <Text style={getButtonTextStyle(button.style, index, buttons.length)}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    maxWidth: 340,
    marginHorizontal: 20,
  },
  content: {
    backgroundColor: theme.colors.white,
    borderRadius: Platform.OS === 'ios' ? 14 : theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: 80,
    height: 80,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  title: {
    fontSize: Platform.OS === 'ios' ? 18 : theme.typography.fontSize.lg,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? undefined : theme.typography.fontFamily,
  },
  message: {
    fontSize: Platform.OS === 'ios' ? 14 : theme.typography.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? undefined : theme.typography.fontFamily,
  },
  buttonContainer: {
    width: '100%',
    gap: theme.spacing.sm,
  },
  buttonContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainerColumn: {
    flexDirection: 'column',
  },
  singleButton: {
    width: '100%',
    paddingVertical: Platform.OS === 'ios' ? 12 : theme.spacing.md,
    borderRadius: Platform.OS === 'ios' ? 10 : theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualButton: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 12 : theme.spacing.md,
    borderRadius: Platform.OS === 'ios' ? 10 : theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiButton: {
    width: '100%',
    paddingVertical: Platform.OS === 'ios' ? 12 : theme.spacing.md,
    borderRadius: Platform.OS === 'ios' ? 10 : theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: theme.colors.textLight, // #181A20 - Đen xám
  },
  iosButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: Platform.OS === 'ios' ? 17 : theme.typography.fontSize.md,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
    color: theme.colors.white,
    fontFamily: Platform.OS === 'ios' ? undefined : theme.typography.fontFamily,
  },
  iosButtonText: {
    fontWeight: '600',
  },
  cancelButtonText: {
    color: theme.colors.white, // Text trắng trên background đen xám
  },
});

export default CustomAlert;

