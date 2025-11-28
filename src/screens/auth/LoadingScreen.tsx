import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { theme } from '../../theme/colors';
import api from '../../utils/Api';

interface LoadingScreenProps {
  navigation: any;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        await new Promise((resolve: any) => setTimeout(resolve, 1500));
        const res = await api.get('/auth/check-login');
        console.log('Check login response:', res.data);

        // Check if login is successful based on API response structure
        if (res.data?.success && res.data?.data?.authenticated) {
          // User is authenticated, navigate to main app
          const userData = res.data?.data?.user;
          console.log('User authenticated:', userData);
          navigation.replace('MainTabs');
        } else {
          // User is not authenticated
          console.log('User not authenticated');
          navigation.replace('Login');
        }
      } catch (error: any) {
        // Handle unauthenticated error (401) or network errors
        console.error('Error checking login:', error.response?.data || error.message);
        navigation.replace('Login');
      }
    }
    checkLogin();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.spinner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.xl,
  },
  spinner: {
    marginTop: theme.spacing.lg,
  },
});

export default LoadingScreen; 