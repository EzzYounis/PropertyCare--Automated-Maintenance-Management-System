import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'tenant' | 'agent' | 'landlord';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded user accounts as per requirements
const USERS: Record<string, { password: string; user: User }> = {
  'furkan': {
    password: '123456789',
    user: {
      id: '1',
      username: 'furkan',
      role: 'tenant',
      name: 'Furkan'
    }
  },
  'Murat': {
    password: '123456789',
    user: {
      id: '2',
      username: 'Murat',
      role: 'agent',
      name: 'Murat'
    }
  },
  'Ezzaldeen': {
    password: '123456789',
    user: {
      id: '3',
      username: 'Ezzaldeen',
      role: 'landlord',
      name: 'Ezzaldeen'
    }
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored auth on mount
    const storedUser = localStorage.getItem('propertycare_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const userAccount = USERS[username];
    
    if (userAccount && userAccount.password === password) {
      setUser(userAccount.user);
      localStorage.setItem('propertycare_user', JSON.stringify(userAccount.user));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('propertycare_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};