import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { theme, SPACING, FONT_SIZE, BORDER_RADIUS, TAB_BAR, wp, hp } from '../../theme';

const CustomTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label = options.tabBarLabel !== undefined
                        ? options.tabBarLabel
                        : options.title !== undefined
                            ? options.title
                            : route.name;

                    const isFocused = state.index === index;

                    // Skip the middle tab (Reports/CreateReport) - we'll render it as floating button
                    if (index === 2) {
                        return <View key={route.key} style={styles.tabItemPlaceholder} />;
                    }

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    const onLongPress = () => {
                        navigation.emit({
                            type: 'tabLongPress',
                            target: route.key,
                        });
                    };

                    return (
                        <TouchableOpacity
                            key={route.key}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={onPress}
                            onLongPress={onLongPress}
                            style={styles.tabItem}
                        >
                            {options.tabBarIcon && options.tabBarIcon({
                                focused: isFocused,
                                color: isFocused ? theme.colors.primary : theme.colors.textSecondary,
                                size: TAB_BAR.iconSize
                            })}
                            <Text style={[
                                styles.tabLabel,
                                { color: isFocused ? theme.colors.primary : theme.colors.textSecondary }
                            ]}>
                                {typeof label === 'string' ? label : ''}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Floating Center Button */}
            <View style={styles.floatingButtonContainer}>
                <TouchableOpacity
                    style={styles.floatingButton}
                    onPress={() => navigation.navigate('CreateReport')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.info]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.floatingButtonGradient}
                    >
                        <Icon name="plus" size={32} color={theme.colors.white} />
                    </LinearGradient>
                </TouchableOpacity>
                {/* <Text style={styles.floatingButtonLabel}>Tạo</Text> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: BORDER_RADIUS.xl,
        borderTopRightRadius: BORDER_RADIUS.xl,
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 8,
        paddingHorizontal: SPACING.sm,
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.black,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xs,
    },
    tabItemPlaceholder: {
        flex: 1,
    },
    tabLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        marginTop: 4,
    },
    floatingButtonContainer: {
        position: 'absolute',
        top: -28,
        left: '50%',
        marginLeft: -32,
        alignItems: 'center',
    },
    floatingButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            ios: {
                shadowColor: theme.colors.black,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    floatingButtonGradient: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingButtonLabel: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 4,
    },
});

export default CustomTabBar;
