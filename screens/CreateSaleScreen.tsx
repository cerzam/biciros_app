import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSales, NewSale } from '../hooks/useSales';
import { useProducts, Product } from '../hooks/useProducts';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EstadoType = 'pendiente' | 'completada' | 'cancelada';
type MetodoPagoType = 'Efectivo' | 'Tarjeta' | 'Transferencia';
type ModoVenta = 'catalogo' | 'manual';

const CreateSaleScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addSale } = useSales();
  const { products, updateProduct } = useProducts();
  const [loading, setLoading] = useState(false);
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const [modoVenta, setModoVenta] = useState<ModoVenta>('catalogo');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Product | null>(null);
  const [modalProductosVisible, setModalProductosVisible] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const [cliente, setCliente] = useState('');
  const [productoManual, setProductoManual] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [total, setTotal] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPagoType>('Efectivo');
  const [estado, setEstado] = useState<EstadoType>('pendiente');

  const metodosPago: MetodoPagoType[] = ['Efectivo', 'Tarjeta', 'Transferencia'];
  const estados = [
    { id: 'pendiente' as EstadoType, label: 'Pendiente', color: '#fbbf24' },
    { id: 'completada' as EstadoType, label: 'Completada', color: '#34d399' },
    { id: 'cancelada' as EstadoType, label: 'Cancelada', color: '#ef4444' },
  ];

  const productosFiltrados = useMemo(() => {
    return products
      .filter(p => p.disponible_producto && p.stock_producto > 0)
      .filter(p => {
        if (!busqueda) return true;
        const q = busqueda.toLowerCase();
        return (
          p.nombre_producto.toLowerCase().includes(q) ||
          p.marca_producto.toLowerCase().includes(q) ||
          p.modelo_producto.toLowerCase().includes(q)
        );
      });
  }, [products, busqueda]);

  const handleSeleccionarProducto = (producto: Product) => {
    setProductoSeleccionado(producto);
    setModalProductosVisible(false);
    setBusqueda('');
    const cant = Number(cantidad) || 1;
    setCantidad(cant.toString());
    setTotal((producto.precio_producto * cant).toString());
  };

  const handleCantidadChange = (text: string) => {
    setCantidad(text);
    if (modoVenta === 'catalogo' && productoSeleccionado) {
      const cant = Number(text) || 0;
      setTotal((productoSeleccionado.precio_producto * cant).toString());
    }
  };

  const handleModoChange = (modo: ModoVenta) => {
    setModoVenta(modo);
    setProductoSeleccionado(null);
    setProductoManual('');
    setCantidad('');
    setTotal('');
  };

  const validateForm = (): boolean => {
    if (!cliente.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return false;
    }
    if (modoVenta === 'catalogo' && !productoSeleccionado) {
      Alert.alert('Error', 'Selecciona un producto del catálogo');
      return false;
    }
    if (modoVenta === 'manual' && !productoManual.trim()) {
      Alert.alert('Error', 'El nombre del producto es requerido');
      return false;
    }
    if (!cantidad.trim() || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor a 0');
      return false;
    }
    if (modoVenta === 'catalogo' && productoSeleccionado && Number(cantidad) > productoSeleccionado.stock_producto) {
      Alert.alert('Sin stock suficiente', `Solo hay ${productoSeleccionado.stock_producto} unidades disponibles`);
      return false;
    }
    if (!total.trim() || isNaN(Number(total)) || Number(total) <= 0) {
      Alert.alert('Error', 'El total debe ser un número mayor a 0');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const nombreProducto =
        modoVenta === 'catalogo' && productoSeleccionado
          ? `${productoSeleccionado.marca_producto} ${productoSeleccionado.nombre_producto}`.trim()
          : productoManual.trim();

      const newSale: NewSale = {
        cliente: cliente.trim(),
        producto: nombreProducto,
        cantidad: Number(cantidad),
        total: Number(total),
        fecha: new Date().toISOString().split('T')[0],
        metodoPago,
        estado,
        productoId: modoVenta === 'catalogo' ? productoSeleccionado!.id : undefined,
      };

      await addSale(newSale);

      if (modoVenta === 'catalogo' && productoSeleccionado) {
        const nuevoStock = productoSeleccionado.stock_producto - Number(cantidad);
        await updateProduct(productoSeleccionado.id, {
          stock_producto: nuevoStock,
          ...(nuevoStock <= 0 ? { disponible_producto: false } : {}),
        });
      }

      Alert.alert('✅ Éxito', 'Venta creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo crear la venta');
    } finally {
      setLoading(false);
    }
  };

  const renderModalProductos = () => (
    <Modal
      animationType="slide"
      transparent
      visible={modalProductosVisible}
      onRequestClose={() => setModalProductosVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.modalBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Seleccionar Producto</Text>
            <TouchableOpacity onPress={() => { setModalProductosVisible(false); setBusqueda(''); }}>
              <Ionicons name="close" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBar, { backgroundColor: theme.cardBackgroundAlt, borderColor: theme.border }]}>
            <Ionicons name="search" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Buscar por nombre, marca o modelo..."
              placeholderTextColor={theme.textMuted}
              value={busqueda}
              onChangeText={setBusqueda}
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={productosFiltrados}
            keyExtractor={(item) => item.id}
            style={styles.productList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Ionicons name="cube-outline" size={40} color={theme.textMuted} />
                <Text style={[styles.emptyListText, { color: theme.textMuted }]}>
                  {busqueda ? 'Sin resultados' : 'No hay productos con stock disponible'}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.productItem, { borderColor: theme.border }]}
                onPress={() => handleSeleccionarProducto(item)}
                activeOpacity={0.7}
              >
                <View style={styles.productItemIcon}>
                  <LinearGradient colors={theme.primaryGradient} style={styles.iconBg}>
                    <Ionicons name="cube-outline" size={20} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.productItemInfo}>
                  <Text style={[styles.productItemBrand, { color: theme.primary }]}>
                    {item.marca_producto}
                  </Text>
                  <Text style={[styles.productItemName, { color: theme.textPrimary }]}>
                    {item.nombre_producto}
                  </Text>
                  <Text style={[styles.productItemStock, { color: theme.textMuted }]}>
                    Stock: {item.stock_producto} uds
                  </Text>
                </View>
                <Text style={[styles.productItemPrice, { color: theme.success }]}>
                  ${item.precio_producto.toLocaleString('es-MX')}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <LinearGradient
        colors={theme.backgroundGradient}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Nueva Venta</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Toggle modo venta */}
          <View style={[styles.modoToggle, { borderColor: theme.border, backgroundColor: theme.cardBackground }]}>
            <TouchableOpacity style={styles.modoBtn} onPress={() => handleModoChange('catalogo')} activeOpacity={0.8}>
              <LinearGradient
                colors={modoVenta === 'catalogo' ? theme.primaryGradient : ['transparent', 'transparent']}
                style={styles.modoBtnGradient}
              >
                <Ionicons name="list" size={16} color={modoVenta === 'catalogo' ? '#fff' : theme.textMuted} />
                <Text style={[styles.modoBtnText, { color: modoVenta === 'catalogo' ? '#fff' : theme.textMuted }]}>
                  Del catálogo
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modoBtn} onPress={() => handleModoChange('manual')} activeOpacity={0.8}>
              <LinearGradient
                colors={modoVenta === 'manual' ? theme.primaryGradient : ['transparent', 'transparent']}
                style={styles.modoBtnGradient}
              >
                <Ionicons name="create-outline" size={16} color={modoVenta === 'manual' ? '#fff' : theme.textMuted} />
                <Text style={[styles.modoBtnText, { color: modoVenta === 'manual' ? '#fff' : theme.textMuted }]}>
                  Manual
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Form Card */}
          <View style={styles.card3D}>
            <LinearGradient
              colors={[theme.cardBackground, theme.cardBackgroundAlt]}
              style={[styles.formCard, { borderColor: theme.border }]}
            >
              {/* Cliente */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  <Ionicons name="person-outline" size={16} color={theme.textSecondary} /> Cliente
                </Text>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.cardBackgroundAlt }]}
                  placeholder="Nombre del cliente"
                  placeholderTextColor={theme.textMuted}
                  value={cliente}
                  onChangeText={setCliente}
                />
              </View>

              {/* Producto del catálogo */}
              {modoVenta === 'catalogo' ? (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    <Ionicons name="cube-outline" size={16} color={theme.textSecondary} /> Producto del catálogo
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.selectorBtn,
                      { borderColor: productoSeleccionado ? theme.primary : theme.border, backgroundColor: theme.cardBackgroundAlt },
                    ]}
                    onPress={() => setModalProductosVisible(true)}
                    activeOpacity={0.7}
                  >
                    {productoSeleccionado ? (
                      <View style={styles.selectorSelected}>
                        <View style={styles.selectorInfo}>
                          <Text style={[styles.selectorBrand, { color: theme.primary }]}>
                            {productoSeleccionado.marca_producto}
                          </Text>
                          <Text style={[styles.selectorName, { color: theme.textPrimary }]}>
                            {productoSeleccionado.nombre_producto}
                          </Text>
                          <Text style={[styles.selectorMeta, { color: theme.textMuted }]}>
                            Stock: {productoSeleccionado.stock_producto} uds · ${productoSeleccionado.precio_producto.toLocaleString('es-MX')} c/u
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                      </View>
                    ) : (
                      <View style={styles.selectorPlaceholder}>
                        <Ionicons name="search" size={20} color={theme.textMuted} />
                        <Text style={[styles.selectorPlaceholderText, { color: theme.textMuted }]}>
                          Toca para buscar un producto
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    <Ionicons name="cube-outline" size={16} color={theme.textSecondary} /> Producto / Servicio
                  </Text>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.cardBackgroundAlt }]}
                    placeholder="Nombre del producto o servicio"
                    placeholderTextColor={theme.textMuted}
                    value={productoManual}
                    onChangeText={setProductoManual}
                  />
                </View>
              )}

              {/* Cantidad y Total */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    <Ionicons name="layers-outline" size={16} color={theme.textSecondary} /> Cantidad
                  </Text>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.cardBackgroundAlt }]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    value={cantidad}
                    onChangeText={handleCantidadChange}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    <Ionicons name="cash-outline" size={16} color={theme.textSecondary} /> Total ($)
                    {modoVenta === 'catalogo' && productoSeleccionado && (
                      <Text style={[styles.labelHint, { color: theme.textMuted }]}> · editable</Text>
                    )}
                  </Text>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.cardBackgroundAlt }]}
                    placeholder="0.00"
                    placeholderTextColor={theme.textMuted}
                    value={total}
                    onChangeText={setTotal}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Método de Pago */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  <Ionicons name="card-outline" size={16} color={theme.textSecondary} /> Método de Pago
                </Text>
                <View style={styles.optionsRow}>
                  {metodosPago.map((metodo) => (
                    <TouchableOpacity key={metodo} style={styles.optionButton} onPress={() => setMetodoPago(metodo)}>
                      <LinearGradient
                        colors={
                          metodoPago === metodo
                            ? ['rgba(99, 102, 241, 0.4)', 'rgba(79, 70, 229, 0.4)']
                            : [theme.cardBackgroundAlt, theme.cardBackground]
                        }
                        style={[styles.optionGradient, metodoPago === metodo && styles.optionSelected]}
                      >
                        <Text style={[styles.optionText, metodoPago === metodo && styles.optionTextSelected]}>
                          {metodo}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Estado */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  <Ionicons name="flag-outline" size={16} color={theme.textSecondary} /> Estado
                </Text>
                <View style={styles.optionsRow}>
                  {estados.map((est) => (
                    <TouchableOpacity key={est.id} style={styles.optionButton} onPress={() => setEstado(est.id)}>
                      <LinearGradient
                        colors={
                          estado === est.id
                            ? [`${est.color}40`, `${est.color}30`]
                            : [theme.cardBackgroundAlt, theme.cardBackground]
                        }
                        style={[styles.optionGradient, estado === est.id && { borderColor: est.color }]}
                      >
                        <Text style={[styles.optionText, estado === est.id && { color: est.color }]}>
                          {est.label}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Submit */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.submitGradient}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.submitText}>Guardar Venta</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderModalProductos()}
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
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  placeholder: { width: 40 },
  keyboardView: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  // Toggle
  modoToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  modoBtn: { flex: 1 },
  modoBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  modoBtnText: { fontSize: 14, fontWeight: '600' },
  // Form
  card3D: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  formCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: '#94a3b8', marginBottom: 8, fontWeight: '600' },
  labelHint: { fontSize: 12, fontWeight: '400' },
  input: {
    backgroundColor: 'rgba(51, 65, 85, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#fff',
  },
  // Selector de producto
  selectorBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  selectorSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorInfo: { flex: 1 },
  selectorBrand: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  selectorName: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
  selectorMeta: { fontSize: 12 },
  selectorPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectorPlaceholderText: { flex: 1, fontSize: 15 },
  // Grid
  row: { flexDirection: 'row', gap: 12 },
  halfWidth: { flex: 1 },
  optionsRow: { flexDirection: 'row', gap: 8 },
  optionButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  optionGradient: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  optionSelected: { borderColor: '#6366f1' },
  optionText: { fontSize: 13, color: '#94a3b8', fontWeight: '600' },
  optionTextSelected: { color: '#6366f1' },
  // Submit
  submitButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14 },
  productList: { maxHeight: 400 },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  productItemIcon: {},
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productItemInfo: { flex: 1 },
  productItemBrand: { fontSize: 11, fontWeight: '600' },
  productItemName: { fontSize: 14, fontWeight: 'bold' },
  productItemStock: { fontSize: 12 },
  productItemPrice: { fontSize: 16, fontWeight: 'bold' },
  emptyList: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyListText: { fontSize: 14, textAlign: 'center' },
});

export default CreateSaleScreen;
