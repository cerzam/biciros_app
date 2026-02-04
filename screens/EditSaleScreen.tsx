import React, { useState } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSales } from '../hooks/useSales';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditSaleRouteProp = RouteProp<RootStackParamList, 'EditSale'>;
type EstadoType = 'pendiente' | 'completada' | 'cancelada';
type MetodoPagoType = 'Efectivo' | 'Tarjeta' | 'Transferencia';

const EditSaleScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditSaleRouteProp>();
  const { sale } = route.params;
  const { updateSale, deleteSale } = useSales();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form state - inicializado con datos de la venta
  const [cliente, setCliente] = useState(sale.cliente);
  const [producto, setProducto] = useState(sale.producto);
  const [cantidad, setCantidad] = useState(sale.cantidad.toString());
  const [total, setTotal] = useState(sale.total.toString());
  const [metodoPago, setMetodoPago] = useState<MetodoPagoType>(
    sale.metodoPago as MetodoPagoType
  );
  const [estado, setEstado] = useState<EstadoType>(sale.estado);

  const metodosPago: MetodoPagoType[] = ['Efectivo', 'Tarjeta', 'Transferencia'];
  const estados: { id: EstadoType; label: string; color: string }[] = [
    { id: 'pendiente', label: 'Pendiente', color: '#fbbf24' },
    { id: 'completada', label: 'Completada', color: '#34d399' },
    { id: 'cancelada', label: 'Cancelada', color: '#ef4444' },
  ];

  const validateForm = (): boolean => {
    if (!cliente.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return false;
    }
    if (!producto.trim()) {
      Alert.alert('Error', 'El nombre del producto es requerido');
      return false;
    }
    if (!cantidad.trim() || isNaN(Number(cantidad)) || Number(cantidad) <= 0) {
      Alert.alert('Error', 'La cantidad debe ser un número mayor a 0');
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
      await updateSale(sale.id, {
        cliente: cliente.trim(),
        producto: producto.trim(),
        cantidad: Number(cantidad),
        total: Number(total),
        metodoPago,
        estado,
      });
      Alert.alert('✅ Éxito', 'Venta actualizada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo actualizar la venta');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Venta',
      '¿Estás seguro de que deseas eliminar esta venta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteSale(sale.id);
              Alert.alert('✅ Éxito', 'Venta eliminada correctamente', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('❌ Error', 'No se pudo eliminar la venta');
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Editar Venta</Text>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#ef4444" />
          ) : (
            <Ionicons name="trash-outline" size={24} color="#ef4444" />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color="#6366f1" />
            <Text style={styles.infoText}>
              Editando venta del {new Date(sale.fecha).toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card3D}>
            <LinearGradient
              colors={['rgba(51, 65, 85, 0.6)', 'rgba(30, 41, 59, 0.5)']}
              style={styles.formCard}
            >
              {/* Cliente */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="person-outline" size={16} color="#94a3b8" /> Cliente
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del cliente"
                  placeholderTextColor="#64748b"
                  value={cliente}
                  onChangeText={setCliente}
                />
              </View>

              {/* Producto */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="cube-outline" size={16} color="#94a3b8" /> Producto
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del producto"
                  placeholderTextColor="#64748b"
                  value={producto}
                  onChangeText={setProducto}
                />
              </View>

              {/* Cantidad y Total */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>
                    <Ionicons name="layers-outline" size={16} color="#94a3b8" /> Cantidad
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor="#64748b"
                    value={cantidad}
                    onChangeText={setCantidad}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}>
                    <Ionicons name="cash-outline" size={16} color="#94a3b8" /> Total ($)
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor="#64748b"
                    value={total}
                    onChangeText={setTotal}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              {/* Método de Pago */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="card-outline" size={16} color="#94a3b8" /> Método de Pago
                </Text>
                <View style={styles.optionsRow}>
                  {metodosPago.map((metodo) => (
                    <TouchableOpacity
                      key={metodo}
                      style={styles.optionButton}
                      onPress={() => setMetodoPago(metodo)}
                    >
                      <LinearGradient
                        colors={
                          metodoPago === metodo
                            ? ['rgba(99, 102, 241, 0.4)', 'rgba(79, 70, 229, 0.4)']
                            : ['rgba(51, 65, 85, 0.4)', 'rgba(30, 41, 59, 0.4)']
                        }
                        style={[
                          styles.optionGradient,
                          metodoPago === metodo && styles.optionSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            metodoPago === metodo && styles.optionTextSelected,
                          ]}
                        >
                          {metodo}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Estado */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Ionicons name="flag-outline" size={16} color="#94a3b8" /> Estado
                </Text>
                <View style={styles.optionsRow}>
                  {estados.map((est) => (
                    <TouchableOpacity
                      key={est.id}
                      style={styles.optionButton}
                      onPress={() => setEstado(est.id)}
                    >
                      <LinearGradient
                        colors={
                          estado === est.id
                            ? [`${est.color}40`, `${est.color}30`]
                            : ['rgba(51, 65, 85, 0.4)', 'rgba(30, 41, 59, 0.4)']
                        }
                        style={[
                          styles.optionGradient,
                          estado === est.id && { borderColor: est.color },
                        ]}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            estado === est.id && { color: est.color },
                          ]}
                        >
                          {est.label}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#6366f1', '#4f46e5']}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save" size={24} color="#fff" />
                  <Text style={styles.submitText}>Guardar Cambios</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  deleteButton: {
    padding: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#a5b4fc',
    fontWeight: '500',
  },
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    fontWeight: '600',
  },
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  optionGradient: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  optionSelected: {
    borderColor: '#6366f1',
  },
  optionText: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#6366f1',
  },
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
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default EditSaleScreen;
