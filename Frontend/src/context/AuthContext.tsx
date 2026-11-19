import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';

const hasManagementAccess = (user: User | null | undefined): boolean =>
  user?.role === 'admin' || (Array.isArray(user?.adminPermissions) && user.adminPermissions.length > 0);

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: Exclude<User['role'], 'admin'>) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    localStorage.removeItem('pgg_auth_user');
    if (!localStorage.getItem('pgg_admin_token')) return;

    api.getAdminSession().then(session => {
      if (session?.user && hasManagementAccess(session.user)) {
        setCurrentUser(session.user);
      } else {
        localStorage.removeItem('pgg_admin_token');
      }
    }).catch(error => {
      console.error('Não foi possível validar a sessão administrativa:', error);
      localStorage.removeItem('pgg_admin_token');
    });
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    const { user } = await api.login(email, password);
    setCurrentUser(user);
  };

  const loginWithPassword = async (email: string, password: string) => {
    const result = await api.loginAdmin(email, password);
    if (!hasManagementAccess(result.user)) {
      throw new Error('Esta conta não tem acesso à área de gestão.');
    }

    localStorage.setItem('pgg_admin_token', result.token);
    setCurrentUser(result.user);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: Exclude<User['role'], 'admin'> = 'follower'
  ): Promise<void> => {
    const { user } = await api.register(name, email, password, role);
    setCurrentUser(user);
  };

  const logout = () => {
    if (localStorage.getItem('pgg_admin_token')) {
      void api.logoutAdmin().catch(error => console.error('Não foi possível terminar a sessão na API:', error));
    }
    setCurrentUser(null);
    localStorage.removeItem('pgg_admin_token');
    localStorage.removeItem('pgg_auth_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = hasManagementAccess(currentUser);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isAdmin, login, loginWithPassword, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
