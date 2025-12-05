import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList  } from '../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  colors: [string, string];
}

const DashboardScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [stats] = useState<StatCard[]>([
    {
      id: '1',
      title: 'Ventas',
      value: 15,
      icon: 'cart',
      colors: ['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.7)'],
    },
    {
      id: '2',
      title: 'Productos',
      value: 45,
      icon: 'cube',
      colors: ['rgba(236, 72, 153, 0.8)', 'rgba(219, 39, 119, 0.7)'],
    },
    {
      id: '3',
      title: 'Servicios',
      value: 8,
      icon: 'build',
      colors: ['rgba(34, 211, 238, 0.8)', 'rgba(6, 182, 212, 0.7)'],
    },
    {
      id: '4',
      title: 'Ingresos',
      value: '$5.2k',
      icon: 'cash',
      colors: ['rgba(52, 211, 153, 0.8)', 'rgba(16, 185, 129, 0.7)'],
    },
  ]);

  const getCurrentDate = () => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const now = new Date();
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Función para navegar desde la barra inferior
  const handleBottomNavPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#2a4a6a', '#1a2332', '#0d1117']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.logo}>BICIROS</Text>
        
        <View style={styles.profileButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.profileGradient}
          >
            <Ionicons name="person" size={20} color="#fff" />
            <Text style={styles.profileText}>Admin</Text>
          </LinearGradient>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hola, Admin 👋</Text>
          <Text style={styles.dateText}>{getCurrentDate()}</Text>
        </View>

        {/* Stats Grid - SIN onPress, solo visual */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View 
              key={stat.id} 
              style={styles.statCardWrapper}
            >
              <View style={[styles.card3D, styles.statCard]}>
                <LinearGradient
                  colors={stat.colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCardInner}
                >
                  {/* Icon Container */}
                  <View style={styles.iconContainer}>
                    <View style={styles.iconBackground}>
                      <Ionicons 
                        name={stat.icon as any} 
                        size={32} 
                        color="#fff" 
                      />
                    </View>
                  </View>

                  {/* Stats Info */}
                  <View style={styles.statInfo}>
                    <Text style={styles.statTitle}>{stat.title}</Text>
                    <Text style={styles.statValue}>{stat.value}</Text>
                  </View>

                  {/* Decorative Elements */}
                  <View style={styles.decorativeCircle1} />
                  <View style={styles.decorativeCircle2} />
                </LinearGradient>
              </View>
            </View>
          ))}
        </View>

        {/* Additional Content Section */}
        <View style={styles.additionalSection}>
          <View style={[styles.card3D, styles.activityCard]}>
            <LinearGradient
              colors={['rgba(71, 85, 105, 0.5)', 'rgba(51, 65, 85, 0.4)']}
              style={styles.activityCardInner}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>Actividad Reciente</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="checkmark-circle" size={24} color="#52c41a" />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityText}>Nueva venta registrada</Text>
                  <Text style={styles.activityTime}>Hace 5 minutos</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Ionicons name="cube" size={24} color="#3b82f6" />
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityText}>Producto agregado</Text>
                  <Text style={styles.activityTime}>Hace 1 hora</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation - CON NAVEGACIÓN */}
      <View style={styles.bottomNav}>
        <LinearGradient
          colors={['rgba(17, 24, 39, 0.95)', 'rgba(0, 0, 0, 0.95)']}
          style={styles.bottomNavGradient}
        >
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handleBottomNavPress('Dashboard')}
          >
            <Ionicons name="home" size={24} color="#3b82f6" />
            <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => handleBottomNavPress('Sales')}
          >
            <Ionicons name="cart-outline" size={24} color="#64748b" />
            <Text style={styles.navText}>Ventas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="build-outline" size={24} color="#64748b" />
            <Text style={styles.navText}>Servicios</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="cube-outline" size={24} color="#64748b" />
            <Text style={styles.navText}>Productos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="settings-outline" size={24} color="#64748b" />
            <Text style={styles.navText}>Config</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  menuButton: {
    padding: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    letterSpacing: 1,
  },
  profileButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  profileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  welcomeSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statsGrid: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCardWrapper: {
    width: (width - 56) / 2,
    marginBottom: 16,
  },
  card3D: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 15,
    },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 15,
  },
  statCard: {
    height: 160,
  },
  statCardInner: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'flex-start',
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    alignItems: 'flex-start',
  },
  statTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  additionalSection: {
    paddingHorizontal: 24,
  },
  activityCard: {
    marginBottom: 16,
  },
  activityCardInner: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#3b82f6',
  },
});

export default DashboardScreen;