import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSales, Sale } from '../hooks/useSales';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'todas' | 'pendiente' | 'completada' | 'cancelada';

const SalesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('todas');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { theme, isDarkMode } = useTheme();

  // Obtener ventas desde Firebase
  const { sales, loading, error, deleteSale, updateSale } = useSales();

  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: 'todas', label: 'Todas', icon: 'apps' },
    { id: 'pendiente', label: 'Pendientes', icon: 'time' },
    { id: 'completada', label: 'Completadas', icon: 'checkmark-circle' },
    { id: 'cancelada', label: 'Canceladas', icon: 'close-circle' },
  ];

  const getStatusColor = (estado: Sale['estado']): [string, string] => {
    switch (estado) {
      case 'completada':
        return ['rgba(52, 211, 153, 0.8)', 'rgba(16, 185, 129, 0.7)'];
      case 'pendiente':
        return ['rgba(251, 191, 36, 0.8)', 'rgba(245, 158, 11, 0.7)'];
      case 'cancelada':
        return ['rgba(239, 68, 68, 0.8)', 'rgba(220, 38, 38, 0.7)'];
      default:
        return ['rgba(148, 163, 184, 0.8)', 'rgba(100, 116, 139, 0.7)'];
    }
  };

  const getStatusIcon = (estado: Sale['estado']) => {
    switch (estado) {
      case 'completada':
        return 'checkmark-circle';
      case 'pendiente':
        return 'time';
      case 'cancelada':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.producto.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      selectedFilter === 'todas' || sale.estado === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getSalesStats = () => {
    const total = sales.reduce((sum, sale) => 
      sale.estado === 'completada' ? sum + sale.total : sum, 0
    );
    const pendientes = sales.filter(s => s.estado === 'pendiente').length;
    const completadas = sales.filter(s => s.estado === 'completada').length;
    
    return { total, pendientes, completadas };
  };

  const stats = getSalesStats();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteSale = (id: string) => {
    Alert.alert(
      'Eliminar Venta',
      '¿Estás seguro de que deseas eliminar esta venta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSale(id);
              Alert.alert('✅ Éxito', 'Venta eliminada correctamente');
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo eliminar la venta');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (id: string, newStatus: Sale['estado']) => {
    try {
      await updateSale(id, { estado: newStatus });
      Alert.alert('✅ Éxito', 'Estado actualizado correctamente');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo actualizar el estado');
    }
  };

  const renderSaleCard = ({ item }: { item: Sale }) => {
    const isExpanded = expandedId === item.id;
    const statusColors = getStatusColor(item.estado);

    return (
      <TouchableOpacity
        style={styles.saleCardWrapper}
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={[styles.card3D, styles.saleCard]}>
          <LinearGradient
            colors={[theme.cardBackground, theme.cardBackgroundAlt]}
            style={[styles.saleCardInner, { borderColor: theme.border }]}
          >
            {/* Header */}
            <View style={styles.saleCardHeader}>
              <View style={styles.clientInfo}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.7)']}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {item.cliente.charAt(0).toUpperCase()}
                    </Text>
                  </LinearGradient>
                </View>
                <View style={styles.clientDetails}>
                  <Text style={[styles.clientName, { color: theme.textPrimary }]}>{item.cliente}</Text>
                  <Text style={[styles.productName, { color: theme.textSecondary }]}>{item.producto}</Text>
                </View>
              </View>

              <View style={styles.statusBadge}>
                <LinearGradient
                  colors={statusColors}
                  style={styles.statusGradient}
                >
                  <Ionicons 
                    name={getStatusIcon(item.estado) as any} 
                    size={16} 
                    color="#fff" 
                  />
                </LinearGradient>
              </View>
            </View>

            {/* Main Info */}
            <View style={styles.saleCardBody}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Fecha</Text>
                  <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                    {new Date(item.fecha).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="cube-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Cantidad</Text>
                  <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{item.cantidad}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="cash-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Total</Text>
                  <Text style={[styles.infoValueHighlight, { color: theme.success }]}>
                    ${item.total.toLocaleString('es-MX')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Expanded Details */}
            {isExpanded && (
              <View style={styles.expandedSection}>
                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Método de Pago:</Text>
                  <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{item.metodoPago}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Estado:</Text>
                  <Text style={[styles.detailValue, { color: theme.textPrimary, textTransform: 'capitalize' }]}>
                    {item.estado}
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EditSale', { sale: item })}
                  >
                    <LinearGradient
                      colors={[`${theme.info}30`, `${theme.info}20`]}
                      style={[styles.actionButtonGradient, { borderColor: theme.border }]}
                    >
                      <Ionicons name="eye-outline" size={18} color={theme.info} />
                      <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Ver</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('EditSale', { sale: item })}
                  >
                    <LinearGradient
                      colors={['rgba(236, 72, 153, 0.2)', 'rgba(219, 39, 119, 0.2)']}
                      style={[styles.actionButtonGradient, { borderColor: theme.border }]}
                    >
                      <Ionicons name="create-outline" size={18} color="#ec4899" />
                      <Text style={[styles.actionButtonText, { color: theme.textPrimary }]}>Editar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Expand Indicator */}
            <View style={styles.expandIndicator}>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={theme.textMuted}
              />
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Ventas</Text>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Error Message */}
      {error && (
        <View style={[styles.errorContainer, { borderColor: `${theme.error}50` }]}>
          <Ionicons name="alert-circle" size={20} color={theme.error} />
          <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        </View>
      )}

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={[styles.card3D, styles.statsCard]}>
          <LinearGradient
            colors={[theme.cardBackground, theme.cardBackgroundAlt]}
            style={[styles.statsCardInner, { borderColor: theme.border }]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Ventas</Text>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>
                ${stats.total.toLocaleString('es-MX')}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completadas</Text>
              <Text style={[styles.statValue, { color: theme.success }]}>
                {stats.completadas}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pendientes</Text>
              <Text style={[styles.statValue, { color: theme.warning }]}>
                {stats.pendientes}
              </Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Buscar por cliente o producto..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={styles.filterChip}
            onPress={() => setSelectedFilter(filter.id)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={
                selectedFilter === filter.id
                  ? [`${theme.primary}30`, `${theme.primary}30`]
                  : [theme.cardBackground, theme.cardBackgroundAlt]
              }
              style={[styles.filterChipGradient, { borderColor: theme.border }]}
            >
              <Ionicons
                name={filter.icon as any}
                size={16}
                color={selectedFilter === filter.id ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  { color: selectedFilter === filter.id ? theme.primary : theme.textSecondary }
                ]}
              >
                {filter.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
        </ScrollView>
      </View>

      {/* Sales List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando ventas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredSales}
          renderItem={renderSaleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.salesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={80} color={theme.textMuted} />
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No hay ventas</Text>
              <Text style={[styles.emptySubtext, { color: theme.textMuted }]}>
                {searchQuery
                  ? 'Intenta con otra búsqueda'
                  : 'Comienza agregando una nueva venta'}
              </Text>
            </View>
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { shadowColor: theme.primary }]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreateSale')}
      >
        <LinearGradient
          colors={theme.primaryGradient}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <LinearGradient
          colors={theme.navBackground}
          style={[styles.bottomNavGradient, { borderTopColor: theme.border }]}
        >
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Ionicons name="home-outline" size={24} color={theme.navText} />
            <Text style={[styles.navText, { color: theme.navText }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="cart" size={24} color={theme.navTextActive} />
            <Text style={[styles.navText, { color: theme.navTextActive }]}>Ventas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigation.navigate('Services')}
          >
            <Ionicons name="build-outline" size={24} color={theme.navText} />
            <Text style={[styles.navText, { color: theme.navText }]}>Servicios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Products')}>
            <Ionicons name="cube-outline" size={24} color={theme.navText} />
            <Text style={[styles.navText, { color: theme.navText }]}>Productos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Config')}>
            <Ionicons name="settings-outline" size={24} color={theme.navText} />
            <Text style={[styles.navText, { color: theme.navText }]}>Config</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  moreButton: {
    padding: 8,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  card3D: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#fff',
  },
  filtersWrapper: {
    height: 56,
    marginBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    height: 56,
  },
  filterChip: {
    marginRight: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#6366f1',
  },
  salesList: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  saleCardWrapper: {
    marginBottom: 16,
  },
  saleCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  saleCardInner: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saleCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    color: '#94a3b8',
  },
  statusBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusGradient: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saleCardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  infoValueHighlight: {
    fontSize: 16,
    color: '#34d399',
    fontWeight: 'bold',
  },
  expandedSection: {
    marginTop: 8,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#94a3b8',
    marginTop: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 100,
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
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

export default SalesScreen;