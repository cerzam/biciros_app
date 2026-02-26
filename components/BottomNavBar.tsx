import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ActiveScreen = 'Dashboard' | 'Sales' | 'Services' | 'Products' | 'Config';

interface NavItem {
  screen: ActiveScreen;
  label: string;
  icon: string;
  iconActive: string;
}

const navItems: NavItem[] = [
  { screen: 'Dashboard', label: 'Home',      icon: 'home-outline',     iconActive: 'home' },
  { screen: 'Sales',     label: 'Ventas',    icon: 'cart-outline',     iconActive: 'cart' },
  { screen: 'Services',  label: 'Servicios', icon: 'build-outline',    iconActive: 'build' },
  { screen: 'Products',  label: 'Productos', icon: 'cube-outline',     iconActive: 'cube' },
  { screen: 'Config',    label: 'Config',    icon: 'settings-outline', iconActive: 'settings' },
];

interface Props {
  active: ActiveScreen;
}

const BottomNavBar = ({ active }: Props) => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.navBackground}
        style={[styles.gradient, { borderTopColor: theme.border }]}
      >
        {navItems.map((item) => {
          const isActive = item.screen === active;
          return (
            <TouchableOpacity
              key={item.screen}
              style={styles.navItem}
              onPress={() => !isActive && navigation.navigate(item.screen)}
              activeOpacity={isActive ? 1 : 0.7}
            >
              <Ionicons
                name={(isActive ? item.iconActive : item.icon) as any}
                size={24}
                color={isActive ? theme.navTextActive : theme.navText}
              />
              <Text style={[styles.navText, { color: isActive ? theme.navTextActive : theme.navText }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  gradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
});

export default BottomNavBar;
