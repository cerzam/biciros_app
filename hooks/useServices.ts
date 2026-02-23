import { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

export interface Service {
  id: string;
  // Identificación del servicio
  id_servicio: string;
  numero_servicio: string; // SRV-2025-001
  nombre_servicio: string;
  descripcion_servicio: string;
  tipo_servicio: 'mantenimiento' | 'reparacion' | 'personalizacion' | 'otro';
  precio_servicio: number;
  estado_servicio: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  notas_servicio: string;

  // Datos del cliente
  id_cliente_servicio: string;
  nombre_cliente_servicio: string;

  // Datos de la bicicleta
  marca_bicicleta_servicio: string;
  modelo_bicicleta_servicio: string;
  numero_serie_servicio: string;

  // Asignación
  id_asignado_servicio: string;
  nombre_asignado_servicio: string;

  // Fechas
  fecha_programada_servicio: Date | null;
  fecha_completado_servicio: Date | null;
  creado_servicio: Date;
  actualizado_servicio: Date;
}

export interface NewService {
  numero_servicio: string;
  nombre_servicio: string;
  descripcion_servicio: string;
  tipo_servicio: 'mantenimiento' | 'reparacion' | 'personalizacion' | 'otro';
  precio_servicio: number;
  estado_servicio: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  notas_servicio: string;
  id_cliente_servicio: string;
  nombre_cliente_servicio: string;
  marca_bicicleta_servicio: string;
  modelo_bicicleta_servicio: string;
  numero_serie_servicio: string;
  id_asignado_servicio: string;
  nombre_asignado_servicio: string;
  fecha_programada_servicio: Date | null;
}

interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  addService: (service: NewService) => Promise<void>;
  updateService: (id: string, service: Partial<NewService>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  refreshServices: () => void;
}

// Generar número de servicio automático
export const generateServiceNumber = (count: number): string => {
  const year = new Date().getFullYear();
  const number = (count + 1).toString().padStart(3, '0');
  return `SRV-${year}-${number}`;
};

export const useServices = (): UseServicesReturn => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listener en tiempo real de Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const servicesQuery = query(
        collection(db, 'services'),
        orderBy('creado_servicio', 'desc')
      );

      const unsubscribe = onSnapshot(
        servicesQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const servicesData: Service[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();

            // Convertir Timestamps a Date
            const creado_servicio = data.creado_servicio instanceof Timestamp
              ? data.creado_servicio.toDate()
              : new Date();

            const actualizado_servicio = data.actualizado_servicio instanceof Timestamp
              ? data.actualizado_servicio.toDate()
              : new Date();

            const fecha_programada_servicio = data.fecha_programada_servicio instanceof Timestamp
              ? data.fecha_programada_servicio.toDate()
              : null;

            const fecha_completado_servicio = data.fecha_completado_servicio instanceof Timestamp
              ? data.fecha_completado_servicio.toDate()
              : null;

            servicesData.push({
              id: doc.id,
              id_servicio: data.id_servicio || doc.id,
              numero_servicio: data.numero_servicio || '',
              nombre_servicio: data.nombre_servicio || '',
              descripcion_servicio: data.descripcion_servicio || '',
              tipo_servicio: data.tipo_servicio || 'otro',
              precio_servicio: data.precio_servicio || 0,
              estado_servicio: data.estado_servicio || 'pendiente',
              notas_servicio: data.notas_servicio || '',
              id_cliente_servicio: data.id_cliente_servicio || '',
              nombre_cliente_servicio: data.nombre_cliente_servicio || '',
              marca_bicicleta_servicio: data.marca_bicicleta_servicio || '',
              modelo_bicicleta_servicio: data.modelo_bicicleta_servicio || '',
              numero_serie_servicio: data.numero_serie_servicio || '',
              id_asignado_servicio: data.id_asignado_servicio || '',
              nombre_asignado_servicio: data.nombre_asignado_servicio || '',
              fecha_programada_servicio,
              fecha_completado_servicio,
              creado_servicio,
              actualizado_servicio,
            });
          });

          setServices(servicesData);
          setLoading(false);
        },
        (err) => {
          console.error('Error al obtener servicios:', err);
          setError('Error al cargar los servicios');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error al configurar listener:', err);
      setError('Error al configurar la conexión con Firebase');
      setLoading(false);
    }
  }, []);

  // Agregar nuevo servicio
  const addService = async (service: NewService): Promise<void> => {
    try {
      setError(null);

      const newService = {
        ...service,
        id_servicio: '', // Se actualizará después de crear
        fecha_completado_servicio: null,
        creado_servicio: Timestamp.now(),
        actualizado_servicio: Timestamp.now(),
        fecha_programada_servicio: service.fecha_programada_servicio
          ? Timestamp.fromDate(service.fecha_programada_servicio)
          : Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'services'), newService);

      // Actualizar con el ID del documento
      await updateDoc(docRef, { id_servicio: docRef.id });

      console.log('✅ Servicio agregado exitosamente');
    } catch (err: any) {
      console.error('Error al agregar servicio:', err);
      setError(err.message || 'Error al agregar el servicio');
      throw err;
    }
  };

  // Actualizar servicio existente
  const updateService = async (id: string, serviceUpdate: Partial<NewService>): Promise<void> => {
    try {
      setError(null);

      const serviceRef = doc(db, 'services', id);

      const updateData: any = {
        ...serviceUpdate,
        actualizado_servicio: Timestamp.now(),
      };

      // Convertir fecha_programada si existe
      if (serviceUpdate.fecha_programada_servicio) {
        updateData.fecha_programada_servicio = Timestamp.fromDate(serviceUpdate.fecha_programada_servicio);
      }

      // Si el estado cambia a completado, agregar fecha de completado
      if (serviceUpdate.estado_servicio === 'completado') {
        updateData.fecha_completado_servicio = Timestamp.now();
      }

      await updateDoc(serviceRef, updateData);

      console.log('✅ Servicio actualizado exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar servicio:', err);
      setError(err.message || 'Error al actualizar el servicio');
      throw err;
    }
  };

  // Eliminar servicio
  const deleteService = async (id: string): Promise<void> => {
    try {
      setError(null);

      const serviceRef = doc(db, 'services', id);
      await deleteDoc(serviceRef);

      console.log('✅ Servicio eliminado exitosamente');
    } catch (err: any) {
      console.error('Error al eliminar servicio:', err);
      setError(err.message || 'Error al eliminar el servicio');
      throw err;
    }
  };

  const refreshServices = () => {
    setLoading(true);
  };

  return {
    services,
    loading,
    error,
    addService,
    updateService,
    deleteService,
    refreshServices,
  };
};
