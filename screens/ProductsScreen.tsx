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
import { useProducts, Product, NewProduct, ProductSpecifications } from '../hooks/useProducts';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type FilterType = 'todos' | 'disponible' | 'no_disponible' | 'destacado';

const categories = [
  { id: 'todos', label: 'Todos', icon: 'grid' },
  { id: 'bicicletas', label: 'Bicicletas', icon: 'bicycle' },
  { id: 'ruta', label: 'Ruta', icon: 'speedometer' },
  { id: 'montaña', label: 'Montaña', icon: 'trail-sign' },
  { id: 'accesorios', label: 'Accesorios', icon: 'headset' },
  { id: 'repuestos', label: 'Repuestos', icon: 'construct' },
  { id: 'ropa', label: 'Ropa', icon: 'shirt' },
  { id: 'herramientas', label: 'Herramientas', icon: 'hammer' },
  { id: 'otro', label: 'Otro', icon: 'ellipsis-horizontal' },
];

const initialFormData: NewProduct = {
  nombre_producto: '',
  descripcion_producto: '',
  categoria_producto: 'accesorios',
  precio_producto: 0,
  stock_producto: 0,
  marca_producto: '',
  modelo_producto: '',
  especificaciones_producto: {
    color: '',
    cuadro: '',
    peso: '',
    tamañoRueda: '',
    velocidades: undefined,
  },
  imagenes_producto: [],
  disponible_producto: true,
  destacado_producto: false,
};

const ProductsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<NewProduct>(initialFormData);

  const { products, loading, error, addProduct, updateProduct, deleteProduct } = useProducts();

  const filters: { id: FilterType; label: string; icon: string }[] = [
    { id: 'todos', label: 'Todos', icon: 'apps' },
    { id: 'disponible', label: 'Disponibles', icon: 'checkmark-circle' },
    { id: 'no_disponible', label: 'No Disp.', icon: 'close-circle' },
    { id: 'destacado', label: 'Destacados', icon: 'star' },
  ];

  const getStatusColor = (disponible: boolean, destacado: boolean): [string, string] => {
    if (destacado) {
      return ['rgba(251, 191, 36, 0.8)', 'rgba(245, 158, 11, 0.7)'];
    }
    if (disponible) {
      return ['rgba(52, 211, 153, 0.8)', 'rgba(16, 185, 129, 0.7)'];
    }
    return ['rgba(148, 163, 184, 0.8)', 'rgba(100, 116, 139, 0.7)'];
  };

  const getCategoryLabel = (categoria: string) => {
    const cat = categories.find(c => c.id === categoria);
    return cat ? cat.label : categoria;
  };

  const getCategoryIcon = (categoria: string) => {
    const cat = categories.find(c => c.id === categoria);
    return cat ? cat.icon : 'cube';
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nombre_producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.marca_producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.modelo_producto.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === 'disponible') {
      matchesFilter = product.disponible_producto === true;
    } else if (selectedFilter === 'no_disponible') {
      matchesFilter = product.disponible_producto === false;
    } else if (selectedFilter === 'destacado') {
      matchesFilter = product.destacado_producto === true;
    }

    const matchesCategory =
      selectedCategory === 'todos' || product.categoria_producto === selectedCategory;

    return matchesSearch && matchesFilter && matchesCategory;
  });

  const getProductsStats = () => {
    const total = products.length;
    const disponibles = products.filter(p => p.disponible_producto).length;
    const noDisponibles = products.filter(p => !p.disponible_producto).length;
    const destacados = products.filter(p => p.destacado_producto).length;
    const sinStock = products.filter(p => p.stock_producto <= 0).length;
    const valorInventario = products.reduce((acc, p) => acc + (p.precio_producto * p.stock_producto), 0);

    return { total, disponibles, noDisponibles, destacados, sinStock, valorInventario };
  };

  const stats = getProductsStats();

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteProduct = (id: string) => {
    Alert.alert(
      'Eliminar Producto',
      '¿Estás seguro de que deseas eliminar este producto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              Alert.alert('Éxito', 'Producto eliminado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
            }
          },
        },
      ]
    );
  };

  const handleToggleDisponible = (product: Product) => {
    const newStatus = !product.disponible_producto;
    Alert.alert(
      'Cambiar Disponibilidad',
      `¿Cambiar a "${newStatus ? 'Disponible' : 'No Disponible'}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await updateProduct(product.id, { disponible_producto: newStatus });
            } catch (error) {
              Alert.alert('Error', 'No se pudo actualizar');
            }
          },
        },
      ]
    );
  };

  const handleToggleDestacado = async (product: Product) => {
    try {
      await updateProduct(product.id, { destacado_producto: !product.destacado_producto });
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar');
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({ ...initialFormData });
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nombre_producto: product.nombre_producto,
      descripcion_producto: product.descripcion_producto,
      categoria_producto: product.categoria_producto,
      precio_producto: product.precio_producto,
      stock_producto: product.stock_producto,
      marca_producto: product.marca_producto,
      modelo_producto: product.modelo_producto,
      especificaciones_producto: product.especificaciones_producto || initialFormData.especificaciones_producto,
      imagenes_producto: product.imagenes_producto || [],
      disponible_producto: product.disponible_producto,
      destacado_producto: product.destacado_producto,
    });
    setModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.nombre_producto.trim()) {
      Alert.alert('Error', 'El nombre del producto es requerido');
      return;
    }
    if (formData.precio_producto <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, formData);
        Alert.alert('Éxito', 'Producto actualizado correctamente');
      } else {
        await addProduct(formData);
        Alert.alert('Éxito', 'Producto creado correctamente');
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el producto');
    }
  };

  const updateSpecification = (key: keyof ProductSpecifications, value: string | number) => {
    setFormData({
      ...formData,
      especificaciones_producto: {
        ...formData.especificaciones_producto,
        [key]: value,
      },
    });
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_producto <= 0) return { color: '#ef4444', label: 'Sin stock' };
    if (product.stock_producto <= 5) return { color: '#fbbf24', label: 'Stock bajo' };
    return { color: '#34d399', label: 'En stock' };
  };

  const renderProductCard = ({ item }: { item: Product }) => {
    const isExpanded = expandedId === item.id;
    const statusColors = getStatusColor(item.disponible_producto, item.destacado_producto);
    const stockStatus = getStockStatus(item);
    const specs = item.especificaciones_producto || {};

    return (
      <TouchableOpacity
        style={styles.productCardWrapper}
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={[styles.card3D, styles.productCard]}>
          <LinearGradient
            colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.5)']}
            style={styles.productCardInner}
          >
            {/* Destacado Badge */}
            {item.destacado_producto && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#fbbf24" />
                <Text style={styles.featuredBadgeText}>Destacado</Text>
              </View>
            )}

            {/* Header */}
            <View style={styles.productCardHeader}>
              <View style={styles.productInfo}>
                <View style={styles.iconContainer}>
                  <LinearGradient colors={['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.7)']} style={styles.iconBg}>
                    <Ionicons name={getCategoryIcon(item.categoria_producto) as any} size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productBrand}>{item.marca_producto}</Text>
                  <Text style={styles.productName}>{item.nombre_producto}</Text>
                  <Text style={styles.productModel}>{item.modelo_producto}</Text>
                </View>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Precio</Text>
                <Text style={styles.priceValue}>${item.precio_producto.toLocaleString('es-MX')}</Text>
              </View>
            </View>

            {/* Stock & Category Row */}
            <View style={styles.stockRow}>
              <View style={styles.stockInfoItem}>
                <View style={[styles.stockIndicator, { backgroundColor: stockStatus.color }]} />
                <Text style={styles.stockText}>
                  {item.stock_producto} unidades
                </Text>
                <Text style={[styles.stockStatusText, { color: stockStatus.color }]}>
                  ({stockStatus.label})
                </Text>
              </View>
              <View style={styles.categoryBadge}>
                <LinearGradient colors={statusColors} style={styles.categoryBadgeGradient}>
                  <Text style={styles.categoryBadgeText}>{getCategoryLabel(item.categoria_producto)}</Text>
                </LinearGradient>
              </View>
            </View>

            {/* Main Info */}
            <View style={styles.productCardBody}>
              <View style={styles.infoRow}>
                {specs.velocidades && (
                  <View style={styles.infoItem}>
                    <Ionicons name="speedometer-outline" size={16} color="#94a3b8" />
                    <Text style={styles.infoLabel}>Velocidades</Text>
                    <Text style={styles.infoValue}>{specs.velocidades}</Text>
                  </View>
                )}
                {specs.tamañoRueda && (
                  <View style={styles.infoItem}>
                    <Ionicons name="ellipse-outline" size={16} color="#94a3b8" />
                    <Text style={styles.infoLabel}>Rueda</Text>
                    <Text style={styles.infoValue}>{specs.tamañoRueda}</Text>
                  </View>
                )}
                <View style={styles.infoItem}>
                  <Ionicons name={item.disponible_producto ? 'checkmark-circle' : 'close-circle'} size={16} color={item.disponible_producto ? '#34d399' : '#ef4444'} />
                  <Text style={styles.infoLabel}>Estado</Text>
                  <Text style={[styles.infoValue, { color: item.disponible_producto ? '#34d399' : '#ef4444' }]}>
                    {item.disponible_producto ? 'Disp.' : 'No Disp.'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Expanded Details */}
            {isExpanded && (
              <View style={styles.expandedSection}>
                <View style={styles.divider} />

                {/* Descripción */}
                {item.descripcion_producto && (
                  <View style={styles.detailGroup}>
                    <Text style={styles.detailLabel}>Descripción:</Text>
                    <Text style={styles.detailValue}>{item.descripcion_producto}</Text>
                  </View>
                )}

                {/* Especificaciones */}
                {(specs.color || specs.cuadro || specs.peso || specs.tamañoRueda || specs.velocidades) && (
                  <View style={styles.detailGroup}>
                    <Text style={styles.detailLabel}>Especificaciones:</Text>
                    <View style={styles.specsGrid}>
                      {specs.color && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Color:</Text>
                          <Text style={styles.specValue}>{specs.color}</Text>
                        </View>
                      )}
                      {specs.cuadro && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Cuadro:</Text>
                          <Text style={styles.specValue}>{specs.cuadro}</Text>
                        </View>
                      )}
                      {specs.peso && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Peso:</Text>
                          <Text style={styles.specValue}>{specs.peso}</Text>
                        </View>
                      )}
                      {specs.tamañoRueda && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Rueda:</Text>
                          <Text style={styles.specValue}>{specs.tamañoRueda}</Text>
                        </View>
                      )}
                      {specs.velocidades && (
                        <View style={styles.specItem}>
                          <Text style={styles.specLabel}>Velocidades:</Text>
                          <Text style={styles.specValue}>{specs.velocidades}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Valor en inventario */}
                <View style={styles.inventoryValue}>
                  <Text style={styles.inventoryLabel}>Valor en inventario:</Text>
                  <Text style={styles.inventoryAmount}>
                    ${(item.precio_producto * item.stock_producto).toLocaleString('es-MX')}
                  </Text>
                </View>

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

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleDestacado(item)}
                  >
                    <LinearGradient
                      colors={item.destacado_producto
                        ? ['rgba(251, 191, 36, 0.2)', 'rgba(245, 158, 11, 0.2)']
                        : ['rgba(148, 163, 184, 0.2)', 'rgba(100, 116, 139, 0.2)']}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name={item.destacado_producto ? 'star' : 'star-outline'} size={18} color={item.destacado_producto ? '#fbbf24' : '#94a3b8'} />
                      <Text style={[styles.actionButtonText, { color: item.destacado_producto ? '#fbbf24' : '#94a3b8' }]}>
                        {item.destacado_producto ? 'Destacado' : 'Destacar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleToggleDisponible(item)}
                  >
                    <LinearGradient
                      colors={item.disponible_producto
                        ? ['rgba(148, 163, 184, 0.2)', 'rgba(100, 116, 139, 0.2)']
                        : ['rgba(52, 211, 153, 0.2)', 'rgba(16, 185, 129, 0.2)']}
                      style={styles.actionButtonGradient}
                    >
                      <Ionicons name={item.disponible_producto ? 'eye-off-outline' : 'eye-outline'} size={18} color={item.disponible_producto ? '#94a3b8' : '#34d399'} />
                      <Text style={[styles.actionButtonText, { color: item.disponible_producto ? '#94a3b8' : '#34d399' }]}>
                        {item.disponible_producto ? 'Ocultar' : 'Mostrar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteProduct(item.id)}>
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
              <Text style={styles.modalTitle}>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Nombre del Producto */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del Producto *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Bicicleta de Ruta Pro"
                  placeholderTextColor="#64748b"
                  value={formData.nombre_producto}
                  onChangeText={(text) => setFormData({ ...formData, nombre_producto: text })}
                />
              </View>

              {/* Descripción */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Descripción del producto..."
                  placeholderTextColor="#64748b"
                  value={formData.descripcion_producto}
                  onChangeText={(text) => setFormData({ ...formData, descripcion_producto: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* Categoría */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Categoría</Text>
                <View style={styles.categoryButtons}>
                  {categories.filter(c => c.id !== 'todos').map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.categoryButton, formData.categoria_producto === cat.id && styles.categoryButtonActive]}
                      onPress={() => setFormData({ ...formData, categoria_producto: cat.id })}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={14}
                        color={formData.categoria_producto === cat.id ? '#6366f1' : '#94a3b8'}
                      />
                      <Text style={[styles.categoryButtonText, formData.categoria_producto === cat.id && styles.categoryButtonTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Marca y Modelo */}
              <Text style={styles.sectionTitle}>Detalles del Producto</Text>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Marca</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: PEUGEOT"
                    placeholderTextColor="#64748b"
                    value={formData.marca_producto}
                    onChangeText={(text) => setFormData({ ...formData, marca_producto: text })}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Modelo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: LR01"
                    placeholderTextColor="#64748b"
                    value={formData.modelo_producto}
                    onChangeText={(text) => setFormData({ ...formData, modelo_producto: text })}
                  />
                </View>
              </View>

              {/* Especificaciones */}
              <Text style={styles.sectionTitle}>Especificaciones</Text>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Color</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Negro"
                    placeholderTextColor="#64748b"
                    value={formData.especificaciones_producto.color || ''}
                    onChangeText={(text) => updateSpecification('color', text)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Cuadro</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Aluminio"
                    placeholderTextColor="#64748b"
                    value={formData.especificaciones_producto.cuadro || ''}
                    onChangeText={(text) => updateSpecification('cuadro', text)}
                  />
                </View>
              </View>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Tamaño Rueda</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 700c"
                    placeholderTextColor="#64748b"
                    value={formData.especificaciones_producto.tamañoRueda || ''}
                    onChangeText={(text) => updateSpecification('tamañoRueda', text)}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Velocidades</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 21"
                    placeholderTextColor="#64748b"
                    value={formData.especificaciones_producto.velocidades?.toString() || ''}
                    onChangeText={(text) => updateSpecification('velocidades', parseInt(text) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: 8.5kg"
                  placeholderTextColor="#64748b"
                  value={formData.especificaciones_producto.peso || ''}
                  onChangeText={(text) => updateSpecification('peso', text)}
                />
              </View>

              {/* Precio y Stock */}
              <Text style={styles.sectionTitle}>Precio e Inventario</Text>

              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Precio *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#64748b"
                    value={formData.precio_producto > 0 ? formData.precio_producto.toString() : ''}
                    onChangeText={(text) => setFormData({ ...formData, precio_producto: parseFloat(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#64748b"
                    value={formData.stock_producto > 0 ? formData.stock_producto.toString() : ''}
                    onChangeText={(text) => setFormData({ ...formData, stock_producto: parseInt(text) || 0 })}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Opciones */}
              <Text style={styles.sectionTitle}>Opciones</Text>

              <View style={styles.switchRow}>
                <TouchableOpacity
                  style={[styles.switchButton, formData.disponible_producto && styles.switchButtonActive]}
                  onPress={() => setFormData({ ...formData, disponible_producto: !formData.disponible_producto })}
                >
                  <Ionicons
                    name={formData.disponible_producto ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={formData.disponible_producto ? '#34d399' : '#94a3b8'}
                  />
                  <Text style={[styles.switchText, formData.disponible_producto && styles.switchTextActive]}>
                    Disponible
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.switchButton, formData.destacado_producto && styles.switchButtonActive]}
                  onPress={() => setFormData({ ...formData, destacado_producto: !formData.destacado_producto })}
                >
                  <Ionicons
                    name={formData.destacado_producto ? 'star' : 'star-outline'}
                    size={20}
                    color={formData.destacado_producto ? '#fbbf24' : '#94a3b8'}
                  />
                  <Text style={[styles.switchText, formData.destacado_producto && styles.switchTextActive]}>
                    Destacado
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProduct}>
                <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.saveButtonGradient}>
                  <Text style={styles.saveButtonText}>{editingProduct ? 'Actualizar' : 'Crear'}</Text>
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
        <Text style={styles.headerTitle}>Productos</Text>
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
              <Text style={styles.statLabel}>Disponibles</Text>
              <Text style={[styles.statValue, { color: '#34d399' }]}>{stats.disponibles}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Sin Stock</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.sinStock}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Destacados</Text>
              <Text style={[styles.statValue, { color: '#fbbf24' }]}>{stats.destacados}</Text>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Valor del inventario */}
      <View style={styles.inventoryTotalContainer}>
        <Text style={styles.inventoryTotalLabel}>Valor total del inventario:</Text>
        <Text style={styles.inventoryTotalValue}>${stats.valorInventario.toLocaleString('es-MX')}</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, marca, modelo..."
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

      {/* Category Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.filterChip}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  selectedCategory === category.id
                    ? ['rgba(99, 102, 241, 0.3)', 'rgba(79, 70, 229, 0.3)']
                    : ['rgba(51, 65, 85, 0.4)', 'rgba(30, 41, 59, 0.4)']
                }
                style={styles.filterChipGradient}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? '#6366f1' : '#94a3b8'}
                />
                <Text style={[styles.filterChipText, selectedCategory === category.id && styles.filterChipTextActive]}>
                  {category.label}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Status Filters */}
      <View style={styles.statusFiltersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusFiltersContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={styles.statusFilterChip}
              onPress={() => setSelectedFilter(filter.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.statusFilterText, selectedFilter === filter.id && styles.statusFilterTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={80} color="#334155" />
              <Text style={styles.emptyText}>No hay productos</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Intenta con otra búsqueda' : 'Comienza agregando un nuevo producto'}
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

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Services')}>
            <Ionicons name="build-outline" size={24} color="#64748b" />
            <Text style={styles.navText}>Servicios</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="cube" size={24} color="#3b82f6" />
            <Text style={[styles.navText, styles.navTextActive]}>Productos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Config')}>
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
  statsContainer: { paddingHorizontal: 24, marginBottom: 8 },
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
  inventoryTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  inventoryTotalLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  inventoryTotalValue: { fontSize: 18, color: '#34d399', fontWeight: 'bold' },
  searchContainer: { paddingHorizontal: 24, marginBottom: 12 },
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
  filtersWrapper: { height: 48, marginBottom: 4 },
  filtersContainer: { paddingHorizontal: 24, alignItems: 'center', height: 48 },
  filterChip: { marginRight: 8, borderRadius: 20, overflow: 'hidden' },
  filterChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterChipText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  filterChipTextActive: { color: '#6366f1' },
  statusFiltersWrapper: { height: 36, marginBottom: 8 },
  statusFiltersContainer: { paddingHorizontal: 24, alignItems: 'center', height: 36 },
  statusFilterChip: { marginRight: 16 },
  statusFilterText: { fontSize: 12, color: '#64748b', fontWeight: '500' },
  statusFilterTextActive: { color: '#fff', fontWeight: '600' },
  productsList: { paddingHorizontal: 24, paddingBottom: 100 },
  productCardWrapper: { marginBottom: 16 },
  productCard: { borderRadius: 20, overflow: 'hidden' },
  productCardInner: { padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 10,
  },
  featuredBadgeText: { fontSize: 10, color: '#fbbf24', fontWeight: '600' },
  productCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { marginRight: 12 },
  iconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  productDetails: { flex: 1 },
  productBrand: { fontSize: 11, color: '#6366f1', fontWeight: '600' },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  productModel: { fontSize: 13, color: '#94a3b8' },
  priceContainer: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  priceValue: { fontSize: 18, color: '#34d399', fontWeight: 'bold' },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stockIndicator: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: 13, color: '#fff', fontWeight: '500' },
  stockStatusText: { fontSize: 12, fontWeight: '500' },
  categoryBadge: { borderRadius: 12, overflow: 'hidden' },
  categoryBadgeGradient: { paddingVertical: 4, paddingHorizontal: 10 },
  categoryBadgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  productCardBody: { marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-around' },
  infoItem: { alignItems: 'center', gap: 4 },
  infoLabel: { fontSize: 11, color: '#64748b', fontWeight: '500' },
  infoValue: { fontSize: 13, color: '#fff', fontWeight: '600' },
  expandedSection: { marginTop: 8 },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 12 },
  detailGroup: { marginBottom: 12 },
  detailLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '500', marginBottom: 4 },
  detailValue: { fontSize: 13, color: '#fff' },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  specItem: { flexDirection: 'row', gap: 4 },
  specLabel: { fontSize: 12, color: '#64748b' },
  specValue: { fontSize: 12, color: '#fff', fontWeight: '500' },
  inventoryValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  inventoryLabel: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  inventoryAmount: { fontSize: 16, color: '#34d399', fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  actionButton: { flex: 1, minWidth: 70, borderRadius: 12, overflow: 'hidden' },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButtonText: { fontSize: 10, fontWeight: '600' },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryButtonActive: { backgroundColor: 'rgba(99, 102, 241, 0.3)', borderColor: '#6366f1' },
  categoryButtonText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  categoryButtonTextActive: { color: '#6366f1' },
  switchRow: { flexDirection: 'row', gap: 12 },
  switchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchButtonActive: { borderColor: 'rgba(99, 102, 241, 0.5)' },
  switchText: { fontSize: 13, color: '#94a3b8', fontWeight: '500' },
  switchTextActive: { color: '#fff' },
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

export default ProductsScreen;
