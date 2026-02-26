import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList  } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useSales } from '../hooks/useSales';
import { useTheme } from '../contexts/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';

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
  const { userData, logout } = useAuth();
  const { sales } = useSales();
  const { theme, isDarkMode } = useTheme();

  // Calcular estadísticas reales de ventas
  const totalVentas = sales.length;
  const ventasPendientes = sales.filter(s => s.estado === 'pendiente').length;
  const ingresos = sales
    .filter(s => s.estado === 'completada')
    .reduce((sum, s) => sum + s.total, 0);
  const formatIngresos = ingresos >= 1000
    ? `$${(ingresos / 1000).toFixed(1)}k`
    : `$${ingresos}`;

  const stats: StatCard[] = [
    {
      id: '1',
      title: 'Ventas',
      value: totalVentas,
      icon: 'cart',
      colors: ['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.7)'],
    },
    {
      id: '2',
      title: 'Pendientes',
      value: ventasPendientes,
      icon: 'time',
      colors: ['rgba(251, 191, 36, 0.8)', 'rgba(245, 158, 11, 0.7)'],
    },
    {
      id: '3',
      title: 'Completadas',
      value: totalVentas - ventasPendientes,
      icon: 'checkmark-circle',
      colors: ['rgba(34, 211, 238, 0.8)', 'rgba(6, 182, 212, 0.7)'],
    },
    {
      id: '4',
      title: 'Ingresos',
      value: formatIngresos,
      icon: 'cash',
      colors: ['rgba(52, 211, 153, 0.8)', 'rgba(16, 185, 129, 0.7)'],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        },
      ]
    );
  };

  const userName = userData?.nombre || 'Usuario';

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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Background Gradient */}
      <LinearGradient
        colors={theme.backgroundGradient}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color={theme.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.logo, { color: theme.primary }]}>BICIROS</Text>

        <View style={styles.profileButton}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
            style={styles.profileGradient}
          >
            <Ionicons name="person" size={20} color={theme.textPrimary} />
            <Text style={[styles.profileText, { color: theme.textPrimary }]}>{userName}</Text>
          </LinearGradient>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>Hola, {userName}</Text>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>{getCurrentDate()}</Text>
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
              colors={[theme.cardBackground, theme.cardBackgroundAlt]}
              style={[styles.activityCardInner, { borderColor: theme.border }]}
            >
              <View style={styles.activityHeader}>
                <Text style={[styles.activityTitle, { color: theme.textPrimary }]}>Actividad Reciente</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
                  <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              {sales.slice(0, 3).map((sale) => (
                <View key={sale.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={sale.estado === 'completada' ? 'checkmark-circle' : 'time'}
                      size={24}
                      color={sale.estado === 'completada' ? theme.success : theme.warning}
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={[styles.activityText, { color: theme.textPrimary }]}>
                      {sale.cliente} - ${sale.total.toLocaleString('es-MX')}
                    </Text>
                    <Text style={[styles.activityTime, { color: theme.textSecondary }]}>{sale.producto}</Text>
                  </View>
                </View>
              ))}

              {sales.length === 0 && (
                <View style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons name="information-circle" size={24} color={theme.textMuted} />
                  </View>
                  <View style={styles.activityDetails}>
                    <Text style={[styles.activityText, { color: theme.textPrimary }]}>Sin actividad reciente</Text>
                    <Text style={[styles.activityTime, { color: theme.textSecondary }]}>Registra tu primera venta</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <BottomNavBar active="Dashboard" />
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
});

export default DashboardScreen;