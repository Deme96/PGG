import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';

const hasManagementAccess = (user: User | null | undefined): boolean =>
  user?.role === 'admin' || Array.isArray(user?.adminPermissions);

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, role?: Exclude<User['role'], 'admin'>) => boolean;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, role?: Exclude<User['role'], 'admin'>) => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pgg_auth_user');
    if (saved) {
      try {
        const user = JSON.parse(saved) as User;
        if (hasManagementAccess(user)) {
          localStorage.removeItem('pgg_auth_user');
          return null;
        }
        return user;
      } catch {
        localStorage.removeItem('pgg_auth_user');
      }
    }
    return null;
  });

  useEffect(() => {
    if (!localStorage.getItem('pgg_admin_token')) return;

    api.getAdminSession().then(session => {
      if (session?.user && hasManagementAccess(session.user)) {
        setCurrentUser(session.user);
        localStorage.setItem('pgg_auth_user', JSON.stringify(session.user));
      } else {
        localStorage.removeItem('pgg_admin_token');
        localStorage.removeItem('pgg_auth_user');
      }
    });
  }, []);

  const login = (email: string, role: Exclude<User['role'], 'admin'> = 'follower'): boolean => {
    let name = 'Utilizador PGG';
    let avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    if (role === 'artist' || email.includes('artista')) {
      name = 'Irmã Dulce Embaló';
      avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80';
    } else if (role === 'journalist' || email.includes('redacao')) {
      name = 'Moisés Gomes';
      avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80';
    } else {
      name = 'Helena Vieira';
      avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
    }

    const user: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      avatar,
      twoFactorEnabled: true,
      phone: '+245 966 882 110'
    };

    setCurrentUser(user);
    localStorage.setItem('pgg_auth_user', JSON.stringify(user));
    return true;
  };

  const loginWithPassword = async (email: string, password: string) => {
    const result = await api.loginAdmin(email, password);
    if (!hasManagementAccess(result.user)) {
      throw new Error('Esta conta não tem acesso à área de gestão.');
    }

    localStorage.setItem('pgg_admin_token', result.token);
    localStorage.setItem('pgg_auth_user', JSON.stringify(result.user));
    setCurrentUser(result.user);
  };

  const register = (name: string, email: string, role: Exclude<User['role'], 'admin'> = 'follower') => {
    const user: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      twoFactorEnabled: false
    };
    setCurrentUser(user);
    localStorage.setItem('pgg_auth_user', JSON.stringify(user));
  };

  const logout = () => {
    if (localStorage.getItem('pgg_admin_token')) {
      void api.logoutAdmin();
    }
    setCurrentUser(null);
    localStorage.removeItem('pgg_admin_token');
    localStorage.removeItem('pgg_auth_user');
  };

  const updateUser = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('pgg_auth_user', JSON.stringify(updated));
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
