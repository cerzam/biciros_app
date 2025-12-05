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

export interface Sale {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
  metodoPago: string;
  userId?: string; // ID del usuario que creó la venta
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NewSale {
  cliente: string;
  producto: string;
  cantidad: number;
  total: number;
  fecha: string;
  estado: 'pendiente' | 'completada' | 'cancelada';
  metodoPago: string;
}

interface UseSalesReturn {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  addSale: (sale: NewSale) => Promise<void>;
  updateSale: (id: string, sale: Partial<NewSale>) => Promise<void>;
  deleteSale: (id: string) => Promise<void>;
  refreshSales: () => void;
}

export const useSales = (userId?: string): UseSalesReturn => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listener en tiempo real de Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      // Crear query ordenada por fecha descendente
      const salesQuery = query(
        collection(db, 'sales'),
        orderBy('createdAt', 'desc')
      );

      // Suscribirse a cambios en tiempo real
      const unsubscribe = onSnapshot(
        salesQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const salesData: Sale[] = [];
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Convertir Timestamp de Firebase a string
            const fecha = data.fecha instanceof Timestamp 
              ? data.fecha.toDate().toISOString().split('T')[0]
              : data.fecha;

            const createdAt = data.createdAt instanceof Timestamp
              ? data.createdAt.toDate()
              : new Date();

            const updatedAt = data.updatedAt instanceof Timestamp
              ? data.updatedAt.toDate()
              : new Date();

            salesData.push({
              id: doc.id,
              cliente: data.cliente || '',
              producto: data.producto || '',
              cantidad: data.cantidad || 0,
              total: data.total || 0,
              fecha,
              estado: data.estado || 'pendiente',
              metodoPago: data.metodoPago || '',
              userId: data.userId,
              createdAt,
              updatedAt,
            });
          });

          // Filtrar por userId si se proporciona
          const filteredSales = userId 
            ? salesData.filter(sale => sale.userId === userId)
            : salesData;

          setSales(filteredSales);
          setLoading(false);
        },
        (err) => {
          console.error('Error al obtener ventas:', err);
          setError('Error al cargar las ventas');
          setLoading(false);
        }
      );

      // Cleanup: desuscribirse cuando el componente se desmonte
      return () => unsubscribe();
    } catch (err) {
      console.error('Error al configurar listener:', err);
      setError('Error al configurar la conexión con Firebase');
      setLoading(false);
    }
  }, [userId]);

  // Agregar nueva venta
  const addSale = async (sale: NewSale): Promise<void> => {
    try {
      setError(null);

      const newSale = {
        ...sale,
        userId: userId || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'sales'), newSale);
      
      console.log('✅ Venta agregada exitosamente');
    } catch (err: any) {
      console.error('Error al agregar venta:', err);
      setError(err.message || 'Error al agregar la venta');
      throw err;
    }
  };

  // Actualizar venta existente
  const updateSale = async (id: string, saleUpdate: Partial<NewSale>): Promise<void> => {
    try {
      setError(null);

      const saleRef = doc(db, 'sales', id);
      
      await updateDoc(saleRef, {
        ...saleUpdate,
        updatedAt: Timestamp.now(),
      });

      console.log('✅ Venta actualizada exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar venta:', err);
      setError(err.message || 'Error al actualizar la venta');
      throw err;
    }
  };

  // Eliminar venta
  const deleteSale = async (id: string): Promise<void> => {
    try {
      setError(null);

      const saleRef = doc(db, 'sales', id);
      await deleteDoc(saleRef);

      console.log('✅ Venta eliminada exitosamente');
    } catch (err: any) {
      console.error('Error al eliminar venta:', err);
      setError(err.message || 'Error al eliminar la venta');
      throw err;
    }
  };

  // Refrescar ventas manualmente (aunque el listener ya lo hace automáticamente)
  const refreshSales = () => {
    setLoading(true);
    // El listener se encargará de actualizar automáticamente
  };

  return {
    sales,
    loading,
    error,
    addSale,
    updateSale,
    deleteSale,
    refreshSales,
  };
};