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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useSales, NewSale } from '../hooks/useSales';
import { useTheme } from '../contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EstadoType = 'pendiente' | 'completada' | 'cancelada';
type MetodoPagoType = 'Efectivo' | 'Tarjeta' | 'Transferencia';

const CreateSaleScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { addSale } = useSales();
  const [loading, setLoading] = useState(false);
  const { theme, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  // Form state
  const [cliente, setCliente] = useState('');
  const [producto, setProducto] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [total, setTotal] = useState('');
  const [metodoPago, setMetodoPago] = useState<MetodoPagoType>('Efectivo');
  const [estado, setEstado] = useState<EstadoType>('pendiente');

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
      const newSale: NewSale = {
        cliente: cliente.trim(),
        producto: producto.trim(),
        cantidad: Number(cantidad),
        total: Number(total),
        fecha: new Date().toISOString().split('T')[0],
        metodoPago,
        estado,
      };

      await addSale(newSale);
      Alert.alert('✅ Éxito', 'Venta creada correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudo crear la venta');
    } finally {
      setLoading(false);
    }
  };

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Nueva Venta</Text>

        <View style={styles.placeholder} />
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
                  style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="Nombre del cliente"
                  placeholderTextColor={theme.textMuted}
                  value={cliente}
                  onChangeText={setCliente}
                />
              </View>

              {/* Producto */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  <Ionicons name="cube-outline" size={16} color={theme.textSecondary} /> Producto
                </Text>
                <TextInput
                  style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="Nombre del producto"
                  placeholderTextColor={theme.textMuted}
                  value={producto}
                  onChangeText={setProducto}
                />
              </View>

              {/* Cantidad y Total */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    <Ionicons name="layers-outline" size={16} color={theme.textSecondary} /> Cantidad
                  </Text>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    value={cantidad}
                    onChangeText={setCantidad}
                    keyboardType="numeric"
                  />
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={[styles.label, { color: theme.textSecondary }]}>
                    <Ionicons name="cash-outline" size={16} color={theme.textSecondary} /> Total ($)
                  </Text>
                  <TextInput
                    style={[styles.input, { color: theme.textPrimary, borderColor: theme.border }]}
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
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                  <Ionicons name="flag-outline" size={16} color={theme.textSecondary} /> Estado
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
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.submitText}>Guardar Venta</Text>
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
  placeholder: {
    width: 40,
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

export default CreateSaleScreen;
