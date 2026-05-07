export interface UserData {
  uid: string;
  // formato nuevo (colección 'users')
  nombre?: string;
  email?: string;
  rol?: string;
  createdAt?: Date;
  // formato original (colección 'usuarios')
  nombre_usuario?: string;
  email_usuario?: string;
  rol_usuario?: string;
  activo_usuario?: boolean;
  telefono_usuario?: string;
}

export interface AuthContextType {
  user: any | null;
  userData: UserData | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}