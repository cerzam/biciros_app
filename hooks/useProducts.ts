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

// Interfaz para especificaciones del producto (objeto anidado en Firebase)
export interface ProductSpecifications {
  color?: string;
  cuadro?: string;
  peso?: string;
  tamañoRueda?: string;
  velocidades?: number;
  talla?: string;
  material?: string;
}

export interface Product {
  id: string;
  // Identificación del producto
  id_producto: string;
  nombre_producto: string;
  descripcion_producto: string;
  categoria_producto: string;

  // Precio
  precio_producto: number;

  // Inventario
  stock_producto: number;

  // Detalles
  marca_producto: string;
  modelo_producto: string;

  // Especificaciones (objeto anidado)
  especificaciones_producto: ProductSpecifications;

  // Imágenes
  imagenes_producto: string[];

  // Estado
  disponible_producto: boolean;
  destacado_producto: boolean;

  // Fechas
  creado_producto: Date;
  actualizado_producto: Date;
}

export interface NewProduct {
  nombre_producto: string;
  descripcion_producto: string;
  categoria_producto: string;
  precio_producto: number;
  stock_producto: number;
  marca_producto: string;
  modelo_producto: string;
  especificaciones_producto: ProductSpecifications;
  imagenes_producto: string[];
  disponible_producto: boolean;
  destacado_producto: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: NewProduct) => Promise<void>;
  updateProduct: (id: string, product: Partial<NewProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  refreshProducts: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listener en tiempo real de Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    try {
      const productsQuery = query(
        collection(db, 'productos'),
        orderBy('creado_producto', 'desc')
      );

      const unsubscribe = onSnapshot(
        productsQuery,
        (snapshot: QuerySnapshot<DocumentData>) => {
          const productsData: Product[] = [];

          snapshot.forEach((doc) => {
            const data = doc.data();

            // Convertir Timestamps a Date
            const creado_producto = data.creado_producto instanceof Timestamp
              ? data.creado_producto.toDate()
              : new Date();

            const actualizado_producto = data.actualizado_producto instanceof Timestamp
              ? data.actualizado_producto.toDate()
              : new Date();

            // Obtener especificaciones
            const especificaciones: ProductSpecifications = data.especificaciones_producto || {};

            productsData.push({
              id: doc.id,
              id_producto: data.id_producto || doc.id,
              nombre_producto: data.nombre_producto || '',
              descripcion_producto: data.descripcion_producto || '',
              categoria_producto: data.categoria_producto || 'otro',
              precio_producto: data.precio_producto || 0,
              stock_producto: data.stock_producto || 0,
              marca_producto: data.marca_producto || '',
              modelo_producto: data.modelo_producto || '',
              especificaciones_producto: especificaciones,
              imagenes_producto: data.imagenes_producto || [],
              disponible_producto: data.disponible_producto ?? true,
              destacado_producto: data.destacado_producto ?? false,
              creado_producto,
              actualizado_producto,
            });
          });

          setProducts(productsData);
          setLoading(false);
        },
        (err) => {
          console.error('Error al obtener productos:', err);
          setError('Error al cargar los productos');
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

  // Agregar nuevo producto
  const addProduct = async (product: NewProduct): Promise<void> => {
    try {
      setError(null);

      // Determinar disponibilidad basada en stock
      let disponible = product.disponible_producto;
      if (product.stock_producto <= 0) {
        disponible = false;
      }

      const newProduct = {
        ...product,
        id_producto: '',
        disponible_producto: disponible,
        creado_producto: Timestamp.now(),
        actualizado_producto: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'productos'), newProduct);

      // Actualizar con el ID del documento
      await updateDoc(docRef, { id_producto: docRef.id });

      console.log('Producto agregado exitosamente');
    } catch (err: any) {
      console.error('Error al agregar producto:', err);
      setError(err.message || 'Error al agregar el producto');
      throw err;
    }
  };

  // Actualizar producto existente
  const updateProduct = async (id: string, productUpdate: Partial<NewProduct>): Promise<void> => {
    try {
      setError(null);

      const productRef = doc(db, 'productos', id);

      const updateData: any = {
        ...productUpdate,
        actualizado_producto: Timestamp.now(),
      };

      // Actualizar disponibilidad si el stock cambia
      if (productUpdate.stock_producto !== undefined) {
        if (productUpdate.stock_producto <= 0) {
          updateData.disponible_producto = false;
        }
      }

      await updateDoc(productRef, updateData);

      console.log('Producto actualizado exitosamente');
    } catch (err: any) {
      console.error('Error al actualizar producto:', err);
      setError(err.message || 'Error al actualizar el producto');
      throw err;
    }
  };

  // Eliminar producto
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      setError(null);

      const productRef = doc(db, 'productos', id);
      await deleteDoc(productRef);

      console.log('Producto eliminado exitosamente');
    } catch (err: any) {
      console.error('Error al eliminar producto:', err);
      setError(err.message || 'Error al eliminar el producto');
      throw err;
    }
  };

  const refreshProducts = () => {
    setLoading(true);
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  };
};
