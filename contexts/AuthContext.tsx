import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth, db } from '../config/firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthContextType, UserData } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Buscar primero en 'usuarios' (estructura original)
          const usuariosRef = doc(db, 'usuarios', user.uid);
          const usuariosDoc = await getDoc(usuariosRef);

          if (usuariosDoc.exists()) {
            setUserData({ uid: user.uid, ...usuariosDoc.data() } as UserData);
          } else {
            // Buscar en 'users' (estructura nueva)
            const usersRef = doc(db, 'users', user.uid);
            const usersDoc = await getDoc(usersRef);

            if (usersDoc.exists()) {
              setUserData(usersDoc.data() as UserData);
            } else {
              // Crear documento en 'users' si no existe en ninguna colección
              const newUserData: UserData = {
                uid: user.uid,
                nombre: user.displayName || user.email?.split('@')[0] || 'Usuario',
                email: user.email || '',
                rol: 'admin',
                createdAt: new Date(),
              };
              await setDoc(usersRef, newUserData);
              setUserData(newUserData);
            }
          }
          setUser(user);
        } catch (error) {
          console.error('Error obteniendo datos del usuario:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    login,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};