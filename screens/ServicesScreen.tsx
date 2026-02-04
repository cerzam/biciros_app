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
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useServices, Service, NewService, generateServiceNumber } from '../hooks/useServices';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'todos' | 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';

const initialFormData: NewService = {
  numero_servicio: '',
  nombre_servicio: '',
  descripcion_servicio: '',
  tipo_servicio: 'mantenimiento',
  precio_servicio: 0,
  estado_servicio: 'pendiente',
  notas_servicio: '',
  id_cliente_servicio: '',
  nombre_cliente_servicio: '',
  marca_bicicleta_servicio: '',
  modelo_bicicleta_servicio: '',
  numero_serie_servicio: '',
  id_asignado_servicio: '',
  nombre_asignado_servicio: '',
  fecha_programada_servicio: null,
};

const ServicesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<NewService>(initialFormData);

  const { services, loading, error, addService, updateService, deleteService } = useServices();

  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: 'todos', label: 'Todos', icon: 'apps' },
    { id: 'pendiente', label: 'Pendiente', icon: 'time' },
    { id: 'en_progreso', label: 'En Progreso', icon: 'play-circle' },
    { id: 'completado', label: 'Completado', icon: 'checkmark-circle' },
    { id: 'cancelado', label: 'Cancelado', icon: 'close-circle' },
  ];

  const getStatusColor = (estado: Service['estado_servicio']): [string, string] => {
    switch (estado) {
      case 'completado':
        return ['rgba(52, 211, 153, 0.8)', 'rgba(16, 185, 129, 0.7)'];
      case 'en_progreso':
        return ['rgba(59, 130, 246, 0.8)', 'rgba(37, 99, 235, 0.7)'];
      case 'pendiente':
        return ['rgba(251, 191, 36, 0.8)', 'rgba(245, 158, 11, 0.7)'];
      case 'cancelado':
        return ['rgba(239, 68, 68, 0.8)', 'rgba(220, 38, 38, 0.7)'];
      default:
        return ['rgba(148, 163, 184, 0.8)', 'rgba(100, 116, 139, 0.7)'];
    }
  };

  const getStatusIcon = (estado: Service['estado_servicio']) => {
    switch (estado) {
      case 'completado':
        return 'checkmark-circle';
      case 'en_progreso':
        return 'play-circle';
      case 'pendiente':
        return 'time';
      case 'cancelado':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusLabel = (estado: Service['estado_servicio']) => {
    switch (estado) {
      case 'completado':
        return 'Completado';
      case 'en_progreso':
        return 'En Progreso';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  const getTipoLabel = (tipo: Service['tipo_servicio']) => {
    switch (tipo) {
      case 'mantenimiento':
        return 'Mantenimiento';
      case 'reparacion':
        return 'Reparación';
      case 'personalizacion':
        return 'Personalización';
      case 'otro':
        return 'Otro';
      default:
        return tipo;
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.nombre_servicio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.nombre_cliente_servicio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.numero_servicio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.marca_bicicleta_servicio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'todos' || service.estado_servicio === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getServicesStats = () => {
    const total = services.length;
    const pendientes = services.filter(s => s.estado_servicio === 'pendiente').length;
    const enProgreso = services.filter(s => s.estado_servicio === 'en_progreso').length;
    const completados = services.filter(s => s.estado_servicio === 'completado').length;

    return { total, pendientes, enProgreso, completados };
  };

  const stats = getServicesStats();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteService = (id: string) => {
    Alert.alert(
      'Eliminar Servicio',
      '¿Estás seguro de que deseas eliminar este servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(id);
              Alert.alert('Éxito', 'Servicio eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el servicio');
            }
          },
        },
      ]
    );
  };

  const handleChangeStatus = (service: Service, newStatus: Service['estado_servicio']) => {
    Alert.alert(
      'Cambiar Estado',
      `¿Cambiar estado a "${getStatusLabel(newStatus)}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateService(service.id, { estado_servicio: newStatus });
              Alert.alert('Éxito', 'Estado actualizado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar el estado');
            }
          },
        },
      ]
    );
  };

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      ...initialFormData,
      numero_servicio: generateServiceNumber(services.length),
    });
    setModalVisible(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setFormData({
      numero_servicio: service.numero_servicio,
      nombre_servicio: service.nombre_servicio,
      descripcion_servicio: service.descripcion_servicio,
      tipo_servicio: service.tipo_servicio,
      precio_servicio: service.precio_servicio,
      estado_servicio: service.estado_servicio,
      notas_servicio: service.notas_servicio,
      id_cliente_servicio: service.id_cliente_servicio,
      nombre_cliente_servicio: service.nombre_cliente_servicio,
      marca_bicicleta_servicio: service.marca_bicicleta_servicio,
      modelo_bicicleta_servicio: service.modelo_bicicleta_servicio,
      numero_serie_servicio: service.numero_serie_servicio,
      id_asignado_servicio: service.id_asignado_servicio,
      nombre_asignado_servicio: service.nombre_asignado_servicio,
      fecha_programada_servicio: service.fecha_programada_servicio,
    });
    setModalVisible(true);
  };

  const handleSaveService = async () => {
    if (!formData.nombre_servicio.trim()) {
      Alert.alert('Error', 'El nombre del servicio es requerido');
      return;
    }
    if (!formData.nombre_cliente_servicio.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return;
    }
    if (formData.precio_servicio <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }

    try {
      if (editingService) {
        await updateService(editingService.id, formData);
        Alert.alert('Éxito', 'Servicio actualizado correctamente');
      } else {
        await addService(formData);
        Alert.alert('Éxito', 'Servicio creado correctamente');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el servicio');
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No programada';
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderServiceCard = ({ item }: { item: Service }) => {
    const isExpanded = expandedId === item.id;
    const statusColors = getStatusColor(item.estado_servicio);

    return (
      <TouchableOpacity
        style={styles.serviceCardWrapper}
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={[styles.card3D, styles.serviceCard]}>
          <LinearGradient
            colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.5)']}
            style={styles.serviceCardInner}
          >
            {/* Header */}
            <View style={styles.serviceCardHeader}>
              <View style={styles.serviceInfo}>
                <View style={styles.iconContainer}>
                  <LinearGradient colors={statusColors} style={styles.iconBg}>
                    <Ionicons name={getStatusIcon(item.estado_servicio) as any} size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceNumber}>{item.numero_servicio}</Text>
                  <Text style={styles.serviceName}>{item.nombre_servicio}</Text>
                  <Text style={styles.clientName}>{item.nombre_cliente_servicio}</Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Precio</Text>
                <Text style={styles.priceValue}>${item.precio_servicio.toLocaleString('es-MX')}</Text>
              </View>
            </View>

            {/* Bicicleta Info */}
            <View style={styles.bikeInfoRow}>
              <View style={styles.bikeInfoItem}>
                <Ionicons name="bicycle-outline" size={16} color="#94a3b8" />
                <Text style={styles.bikeInfoText}>
                  {item.marca_bicicleta_servicio} {item.modelo_bicicleta_servicio}
                </Text>
              </View>
              <View style={styles.statusBadge}>
                <LinearGradient colors={statusColors} style={styles.statusBadgeGradient}>
                  <Text style={styles.statusBadgeText}>{getStatusLabel(item.estado_servicio)}</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Main Info */}
            <View style={styles.serviceCardBody}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="construct-outline" size={16} color="#94a3b8" />
                  <Text style={styles.infoLabel}>Tipo</Text>
                  <Text style={styles.infoValue}>{getTipoLabel(item.tipo_servicio)}</Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
                  <Text style={styles.infoLabel}>Programado</Text>
                  <Text style={styles.infoValue}>{formatDate(item.fecha_programada_servicio)}</Text>
                </View>
              </View>
            </View>

            {/* Expanded Details */}
            {isExpanded && (
              <View style={styles.expandedSection}>
                <View style={styles.divider} />

                {/* Descripción */}
                <View style={styles.detailGroup}>
                  <Text style={styles.detailLabel}>Descripción:</Text>
                  <Text style={styles.detailValue}>{item.descripcion_servicio || 'Sin descripción'}</Text>
                </View>

                {/* Número de Serie */}
                {item.numero_serie_servicio && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>No. Serie:</Text>
                    <Text style={styles.detailValue}>{item.numero_serie_servicio}</Text>
                  </View>
                )}

                {/* Asignado a */}
                {item.nombre_asignado_servicio && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Asignado a:</Text>
                    <Text style={styles.detailValue}>{item.nombre_asignado_servicio}</Text>
                  </View>
                )}

                {/* Notas */}
                {item.notas_servicio && (
                  <View style={styles.detailGroup}>
                    <Text style={styles.detailLabel}>Notas:</Text>
                    <Text style={styles.detailValue}>{item.notas_servicio}</Text>
                  </View>
                )}

                {/* Fecha completado */}
                {item.fecha_completado_servicio && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Completado:</Text>
                    <Text style={[styles.detailValue, { color: '#34d399' }]}>
                      {formatDate(item.fecha_completado_servicio)}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                    <LinearGradient
                      colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.2)']}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="create-outline" size={18} color="#3b82f6" />
                      <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>Editar</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {item.estado_servicio === 'pendiente' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleChangeStatus(item, 'en_progreso')}
                    >
                      <LinearGradient
                        colors={['rgba(59, 130, 246, 0.2)', 'rgba(37, 99, 235, 0.2)']}
                        style={styles.actionButtonGradient}
                      >
                        <Ionicons name="play-circle-outline" size={18} color="#3b82f6" />
                        <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>Iniciar</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  {item.estado_servicio === 'en_progreso' && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleChangeStatus(item, 'completado')}
                    >
                      <LinearGradient
                        colors={['rgba(52, 211, 153, 0.2)', 'rgba(16, 185, 129, 0.2)']}
                        style={styles.actionButtonGradient}
                      >
                        <Ionicons name="checkmark-circle-outline" size={18} color="#34d399" />
                        <Text style={[styles.actionButtonText, { color: '#34d399' }]}>Completar</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteService(item.id)}>
                    <LinearGradient
                      colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.2)']}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ef4444" />
                      <Text style={[styles.actionButtonText, { color: '#ef4444' }]}>Eliminar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Expand Indicator */}
            <View style={styles.expandIndicator}>
              <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#64748b" />
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  const renderModal = () => (
    <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.modalGradient}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Número de Servicio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de Servicio</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={formData.numero_servicio}
                  editable={false}
                />
              </View>

              {/* Nombre del Servicio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del Servicio *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Mantenimiento General"
                  placeholderTextColor="#64748b"
                  value={formData.nombre_servicio}
                  onChangeText={(text) => setFormData({ ...formData, nombre_servicio: text })}
                />
              </View>

              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción del servicio..."
                  placeholderTextColor="#64748b"
                  value={formData.descripcion_servicio}
                  onChangeText={(text) => setFormData({ ...formData, descripcion_servicio: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Tipo de Servicio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo de Servicio</Text>
                <View style={styles.categoryButtons}>
                  {(['mantenimiento', 'reparacion', 'personalizacion', 'otro'] as const).map((tipo) => (
                    <TouchableOpacity
                      key={tipo}
                      style={[styles.categoryButton, formData.tipo_servicio === tipo && styles.categoryButtonActive]}
                      onPress={() => setFormData({ ...formData, tipo_servicio: tipo })}
                    >
                      <Text style={[styles.categoryButtonText, formData.tipo_servicio === tipo && styles.categoryButtonTextActive]}>
                        {getTipoLabel(tipo)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Precio */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Precio *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor="#64748b"
                  value={formData.precio_servicio > 0 ? formData.precio_servicio.toString() : ''}
                  onChangeText={(text) => setFormData({ ...formData, precio_servicio: parseFloat(text) || 0 })}
                  keyboardType="numeric"
                />
              </View>

              {/* Sección Cliente */}
              <Text style={styles.sectionTitle}>Datos del Cliente</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del Cliente *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre completo"
                  placeholderTextColor="#64748b"
                  value={formData.nombre_cliente_servicio}
                  onChangeText={(text) => setFormData({ ...formData, nombre_cliente_servicio: text })}
                />
              </View>

              {/* Sección Bicicleta */}
              <Text style={styles.sectionTitle}>Datos de la Bicicleta</Text>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Marca</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: TREK"
                    placeholderTextColor="#64748b"
                    value={formData.marca_bicicleta_servicio}
                    onChangeText={(text) => setFormData({ ...formData, marca_bicicleta_servicio: text })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Modelo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Marlin 5"
                    placeholderTextColor="#64748b"
                    value={formData.modelo_bicicleta_servicio}
                    onChangeText={(text) => setFormData({ ...formData, modelo_bicicleta_servicio: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Número de Serie</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Número de serie (opcional)"
                  placeholderTextColor="#64748b"
                  value={formData.numero_serie_servicio}
                  onChangeText={(text) => setFormData({ ...formData, numero_serie_servicio: text })}
                />
              </View>

              {/* Estado (solo en edición) */}
              {editingService && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Estado</Text>
                  <View style={styles.categoryButtons}>
                    {(['pendiente', 'en_progreso', 'completado', 'cancelado'] as const).map((estado) => (
                      <TouchableOpacity
                        key={estado}
                        style={[styles.categoryButton, formData.estado_servicio === estado && styles.categoryButtonActive]}
                        onPress={() => setFormData({ ...formData, estado_servicio: estado })}
                      >
                        <Text style={[styles.categoryButtonText, formData.estado_servicio === estado && styles.categoryButtonTextActive]}>
                          {getStatusLabel(estado)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Notas */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notas</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Notas adicionales..."
                  placeholderTextColor="#64748b"
                  value={formData.notas_servicio}
                  onChangeText={(text) => setFormData({ ...formData, notas_servicio: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveService}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.saveButtonGradient}>
                  <Text style={styles.saveButtonText}>{editingService ? 'Actualizar' : 'Crear'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={['#2a4a6a', '#1a2332', '#0d1117']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Servicios</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.card3D, styles.statsCard]}>
          <LinearGradient
            colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.5)']}
            style={styles.statsCardInner}
          >
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total</Text>
              <Text style={styles.statValue}>{stats.total}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pendientes</Text>
              <Text style={[styles.statValue, { color: '#fbbf24' }]}>{stats.pendientes}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>En Progreso</Text>
              <Text style={[styles.statValue, { color: '#3b82f6' }]}>{stats.enProgreso}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Completados</Text>
              <Text style={[styles.statValue, { color: '#34d399' }]}>{stats.completados}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente, servicio, bici..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
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
                    ? ['rgba(99, 102, 241, 0.3)', 'rgba(79, 70, 229, 0.3)']
                    : ['rgba(51, 65, 85, 0.4)', 'rgba(30, 41, 59, 0.4)']
                }
                style={styles.filterChipGradient}
              >
                <Ionicons
                  name={filter.icon as any}
                  size={16}
                  color={selectedFilter === filter.id ? '#6366f1' : '#94a3b8'}
                />
                <Text style={[styles.filterChipText, selectedFilter === filter.id && styles.filterChipTextActive]}>
                  {filter.label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Cargando servicios...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          renderItem={renderServiceCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.servicesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="build-outline" size={80} color="#334155" />
              <Text style={styles.emptyText}>No hay servicios</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Intenta con otra búsqueda' : 'Comienza agregando un nuevo servicio'}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={openCreateModal}>
        <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.fabGradient}>
          <Ionicons name="add" size={28} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <LinearGradient colors={['rgba(17, 24, 39, 0.95)', 'rgba(0, 0, 0, 0.95)']} style={styles.bottomNavGradient}>
          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Dashboard')}>
            <Ionicons name="home-outline" size={24} color="#64748b" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Sales')}>
            <Ionicons name="cart-outline" size={24} color="#64748b" />
            <Text style={styles.navText}>Ventas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="build" size={24} color="#3b82f6" />
            <Text style={[styles.navText, styles.navTextActive]}>Servicios</Text>
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

      {renderModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  moreButton: { padding: 8 },
  statsContainer: { paddingHorizontal: 24, marginBottom: 16 },
  card3D: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  statsCard: { borderRadius: 16, overflow: 'hidden' },
  statsCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  statDivider: { width: 1, height: 40, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  searchContainer: { paddingHorizontal: 24, marginBottom: 16 },
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
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: '#fff' },
  filtersWrapper: { height: 56, marginBottom: 8 },
  filtersContainer: { paddingHorizontal: 24, alignItems: 'center', height: 56 },
  filterChip: { marginRight: 8, borderRadius: 20, overflow: 'hidden' },
  filterChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  filterChipTextActive: { color: '#6366f1' },
  servicesList: { paddingHorizontal: 24, paddingBottom: 100 },
  serviceCardWrapper: { marginBottom: 16 },
  serviceCard: { borderRadius: 20, overflow: 'hidden' },
  serviceCardInner: { padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { marginRight: 12 },
  iconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  serviceDetails: { flex: 1 },
  serviceNumber: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  clientName: { fontSize: 13, color: '#94a3b8' },
  priceContainer: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  priceValue: { fontSize: 18, color: '#34d399', fontWeight: 'bold' },
  bikeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bikeInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bikeInfoText: { fontSize: 13, color: '#94a3b8' },
  statusBadge: { borderRadius: 12, overflow: 'hidden' },
  statusBadgeGradient: { paddingVertical: 4, paddingHorizontal: 10 },
  statusBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  serviceCardBody: { marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { alignItems: 'center', gap: 4 },
  infoLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#fff', fontWeight: '600' },
  expandedSection: { marginTop: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 12 },
  detailGroup: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  detailLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '500', marginBottom: 4 },
  detailValue: { fontSize: 13, color: '#fff' },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  actionButton: { flex: 1, minWidth: 80, borderRadius: 12, overflow: 'hidden' },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: { fontSize: 11, fontWeight: '600' },
  expandIndicator: { alignItems: 'center', marginTop: 8 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#64748b', marginTop: 8, textAlign: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 16, color: '#94a3b8', marginTop: 16 },
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
  errorText: { flex: 1, fontSize: 13, color: '#ef4444', fontWeight: '500' },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 100,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 100,
  },
  fabGradient: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  bottomNavGradient: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  navItem: { alignItems: 'center', padding: 8 },
  navText: { fontSize: 10, color: '#64748b', marginTop: 4, fontWeight: '600' },
  navTextActive: { color: '#3b82f6' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', maxHeight: '90%' },
  modalGradient: { padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  modalBody: { maxHeight: 450 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '600', marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputDisabled: { backgroundColor: 'rgba(51, 65, 85, 0.2)', color: '#64748b' },
  textArea: { height: 80, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row' },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6366f1',
    marginTop: 8,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(99, 102, 241, 0.3)',
    paddingBottom: 8,
  },
  categoryButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: { backgroundColor: 'rgba(99, 102, 241, 0.3)', borderColor: '#6366f1' },
  categoryButtonText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  categoryButtonTextActive: { color: '#6366f1' },
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  saveButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  saveButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  saveButtonText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});

export default ServicesScreen;
