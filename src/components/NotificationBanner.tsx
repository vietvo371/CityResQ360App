import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useNotifications } from '../hooks/useNotifications';

export const NotificationBanner = () => {
  const { notifications, markAsRead } = useNotifications();
  const [visible, setVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-100))[0];
  
  const latestNotification = notifications.find(n => !n.read);

  useEffect(() => {
    if (latestNotification) {
      setVisible(true);
      // Slide down animation
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();

      // Auto hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [latestNotification?.id]);

  const handleClose = () => {
    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      if (latestNotification) {
        markAsRead(latestNotification.id);
      }
    });
  };

  if (!visible || !latestNotification) return null;

  const getBackgroundColor = () => {
    switch (latestNotification.type) {
      case 'report_status':
        return '#3B82F6'; // Blue
      case 'points_updated':
        return '#10B981'; // Green
      case 'wallet_updated':
        return '#F59E0B'; // Amber
      case 'new_nearby_report':
        return '#8B5CF6'; // Purple
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.banner}
        onPress={handleClose}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{latestNotification.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            {latestNotification.message}
          </Text>
        </View>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.close}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
  },
  banner: {
    padding: 16,
    paddingTop: 50, // Account for status bar
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.95,
  },
  closeButton: {
    padding: 8,
  },
  close: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
