import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  TextInput,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../hooks/useSettings';
import { useTheme } from '../contexts/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';

const { width } = Dimensions.get('window');
const APP_VERSION = '1.0.0';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  textColor?: string;
  subtitleColor?: string;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  rightElement,
  onPress,
  textColor = '#fff',
  subtitleColor = '#64748b',
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress && !rightElement}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.settingIconContainer, { backgroundColor: `${iconColor}20` }]}>
      <Ionicons name={icon as any} size={22} color={iconColor} />
    </View>
    <View style={styles.settingInfo}>
      <Text style={[styles.settingTitle, { color: textColor }]}>{title}</Text>
      {subtitle && <Text style={[styles.settingSubtitle, { color: subtitleColor }]}>{subtitle}</Text>}
    </View>
    {rightElement || (onPress && (
      <Ionicons name="chevron-forward" size={20} color={subtitleColor} />
    ))}
  </TouchableOpacity>
);

const ConfigScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { userData, user, logout } = useAuth();
  const { settings, updateSetting, updateSettings } = useSettings();
  const { isDarkMode, setDarkMode, theme } = useTheme();

  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    nombreNegocio: settings.nombreNegocio,
    direccionNegocio: settings.direccionNegocio,
    telefonoNegocio: settings.telefonoNegocio,
  });

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesion',
      'Estas seguro de que deseas cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesion',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesion');
            }
          },
        },
      ]
    );
  };

  const handleSaveBusiness = async () => {
    try {
      await updateSettings(businessForm);
      setShowBusinessModal(false);
      Alert.alert('Exito', 'Informacion del negocio actualizada');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la informacion');
    }
  };

  const openBusinessModal = () => {
    setBusinessForm({
      nombreNegocio: settings.nombreNegocio,
      direccionNegocio: settings.direccionNegocio,
      telefonoNegocio: settings.telefonoNegocio,
    });
    setShowBusinessModal(true);
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Configuracion</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Perfil de Usuario */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Perfil</Text>
          <View style={styles.sectionCard}>
            <LinearGradient
              colors={[theme.cardBackground, theme.cardBackgroundAlt]}
              style={[styles.sectionCardInner, { borderColor: theme.border }]}
            >
              <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                  <LinearGradient
                    colors={theme.primaryGradient}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>
                      {userData?.nombre?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                  </LinearGradient>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: theme.textPrimary }]}>{userData?.nombre || 'Usuario'}</Text>
                  <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>{user?.email || 'email@ejemplo.com'}</Text>
                  <View style={styles.rolBadge}>
                    <Text style={styles.rolText}>
                      {userData?.rol === 'admin' ? 'Administrador' : 'Trabajador'}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>

        {/* Informacion del Negocio */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Negocio</Text>
          <View style={styles.sectionCard}>
            <LinearGradient
              colors={[theme.cardBackground, theme.cardBackgroundAlt]}
              style={[styles.sectionCardInner, { borderColor: theme.border }]}
            >
              <SettingItem
                icon="business"
                iconColor={theme.primary}
                title="Informacion del Negocio"
                subtitle={settings.nombreNegocio || 'Configurar datos'}
                onPress={openBusinessModal}
                textColor={theme.textPrimary}
                subtitleColor={theme.textMuted}
              />
            </LinearGradient>
          </View>
        </View>

        {/* Notificaciones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Notificaciones</Text>
          <View style={styles.sectionCard}>
            <LinearGradient
              colors={[theme.cardBackground, theme.cardBackgroundAlt]}
              style={[styles.sectionCardInner, { borderColor: theme.border }]}
            >
              <SettingItem
                icon="cart"
                iconColor={theme.success}
                title="Ventas"
                subtitle="Notificar nuevas ventas"
                textColor={theme.textPrimary}
                subtitleColor={theme.textMuted}
                rightElement={
                  <Switch
                    value={settings.notificacionesVentas}
                    onValueChange={(v) => updateSetting('notificacionesVentas', v)}
                    trackColor={{ false: '#374151', true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingItem
                icon="alert-circle"
                iconColor={theme.warning}
                title="Stock Bajo"
                subtitle="Alertas de inventario"
                textColor={theme.textPrimary}
                subtitleColor={theme.textMuted}
                rightElement={
                  <Switch
                    value={settings.notificacionesStock}
                    onValueChange={(v) => updateSetting('notificacionesStock', v)}
                    trackColor={{ false: '#374151', true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingItem
                icon="build"
                iconColor={theme.info}
                title="Servicios"
                subtitle="Recordatorios de servicios"
                textColor={theme.textPrimary}
                subtitleColor={theme.textMuted}
                rightElement={
                  <Switch
                    value={settings.notificacionesServicios}
                    onValueChange={(v) => updateSetting('notificacionesServicios', v)}
                    trackColor={{ false: '#374151', true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />
            </LinearGradient>
          </View>
        </View>

        {/* Apariencia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Apariencia</Text>
          <View style={styles.sectionCard}>
            <LinearGradient
              colors={[theme.cardBackground, theme.cardBackgroundAlt]}
              style={[styles.sectionCardInner, { borderColor: theme.border }]}
            >
              <SettingItem
                icon={isDarkMode ? 'moon' : 'sunny'}
                iconColor="#8b5cf6"
                title="Modo Oscuro"
                subtitle="Tema de la aplicacion"
                textColor={theme.textPrimary}
                subtitleColor={theme.textMuted}
                rightElement={
                  <Switch
                    value={isDarkMode}
                    onValueChange={(v) => setDarkMode(v)}
                    trackColor={{ false: '#374151', true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />
            </LinearGradient>
          </View>
        </View>

        {/* Acerca de */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Acerca de</Text>
          <View style={styles.sectionCard}>
            <LinearGradient
              colors={[theme.cardBackground, theme.cardBackgroundAlt]}
              style={[styles.sectionCardInner, { borderColor: theme.border }]}
            >
              <SettingItem
                icon="information-circle"
                iconColor={theme.textMuted}
                title="Version"
                subtitle={`v${APP_VERSION}`}
                textColor={theme.textPrimary}
                subtitleColor={theme.textMuted}
              />
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <SettingItem
                icon="logo-github"
                iconColor={theme.textMuted}
                title="BICIROS App"
                subtitle="Sistema de gestion para bicicletas"
                textColor={theme.textPrimary}
                subtitleColor={theme.textMuted}
              />
            </LinearGradient>
          </View>
        </View>

        {/* Cerrar Sesion */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogout}>
            <View style={styles.sectionCard}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(185, 28, 28, 0.15)']}
                style={[styles.sectionCardInner, { borderColor: theme.border }]}
              >
                <SettingItem
                  icon="log-out"
                  iconColor={theme.error}
                  title="Cerrar Sesion"
                  subtitle="Salir de la cuenta"
                  textColor={theme.textPrimary}
                  subtitleColor={theme.textMuted}
                />
              </LinearGradient>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Informacion del Negocio */}
      <Modal
        visible={showBusinessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBusinessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1e293b', '#0f172a']}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Informacion del Negocio</Text>
                <TouchableOpacity onPress={() => setShowBusinessModal(false)}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre del Negocio</Text>
                  <TextInput
                    style={styles.input}
                    value={businessForm.nombreNegocio}
                    onChangeText={(t) => setBusinessForm({ ...businessForm, nombreNegocio: t })}
                    placeholder="Ej: BICIROS"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Direccion</Text>
                  <TextInput
                    style={styles.input}
                    value={businessForm.direccionNegocio}
                    onChangeText={(t) => setBusinessForm({ ...businessForm, direccionNegocio: t })}
                    placeholder="Ej: Calle Principal #123"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Telefono</Text>
                  <TextInput
                    style={styles.input}
                    value={businessForm.telefonoNegocio}
                    onChangeText={(t) => setBusinessForm({ ...businessForm, telefonoNegocio: t })}
                    placeholder="Ej: +52 123 456 7890"
                    placeholderTextColor="#64748b"
                    keyboardType="phone-pad"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowBusinessModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveBusiness}
                >
                  <LinearGradient
                    colors={['#6366f1', '#4f46e5']}
                    style={styles.saveButtonGradient}
                  >
                    <Text style={styles.saveButtonText}>Guardar</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      <BottomNavBar active="Config" />
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionCardInner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
  },
  rolBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rolText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '80%',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalBody: {
    padding: 24,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ConfigScreen;
