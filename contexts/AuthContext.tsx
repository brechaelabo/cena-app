
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role, Plan, RolePivot, BillingCycle, TutorApplicationStatus } from '../types';
import { PATHS } from '../constants';
import { useNavigate } from 'react-router-dom'; 
import { usePlatformUsers } from './UserManagementContext'; 

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, role?: Role) => Promise<void>; 
  logout: () => void;
  register: (email: string, name: string, password: string, roleRequest?: Role) => Promise<void>; 
  switchRole: (newRole: Role) => void;
  updateUserPlan: (newPlan: Plan) => void; 
  refreshCurrentUser: (userIdToRefresh?: string) => void;
  setCurrentUserAndPersist: (updatedUser: User) => void; // Added
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sistema totalmente API-driven - sem mocks

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { platformUsers, addRegisteredUser, getUserById: getUserFromPlatform } = usePlatformUsers(); 

  useEffect(() => {
    const storedUser = localStorage.getItem('cena-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user from localStorage:", error);
        localStorage.removeItem('cena-user'); // Clear corrupted data
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    
    try {
      // Login apenas via API real
      if (!password || password.trim() === '') {
        throw new Error("Senha é obrigatória.");
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciais inválidas');
      }

      // Login real funcionou
      const { user, token } = data.data;
      localStorage.setItem('cena-auth-token', token);
      localStorage.setItem('cena-user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string, roleRequest: Role = Role.ACTOR) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password, role: roleRequest }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no registro');
      }

      const { user, token } = data.data;
      localStorage.setItem('cena-auth-token', token);
      localStorage.setItem('cena-user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cena-user');
    navigate(PATHS.HOME); 
  };

  const switchRole = (newRole: Role) => {
    if (user && user.roles.some(r => r.role === newRole)) {
      const updatedUser = { ...user, currentRole: newRole };
      setUser(updatedUser);
      localStorage.setItem('cena-user', JSON.stringify(updatedUser));
    }
  };
  
  const updateUserPlan = (newPlan: Plan) => {
    if (user && user.currentRole === Role.ACTOR) {
      const updatedUser = { ...user, activePlan: newPlan };
      updatedUser.roles = user.roles.map(r => 
        r.role === Role.ACTOR ? { ...r, plan: newPlan } : r
      );
      setUser(updatedUser);
      localStorage.setItem('cena-user', JSON.stringify(updatedUser));
    }
  };

  const refreshCurrentUser = (userIdToRefresh?: string) => {
    const idToUse = userIdToRefresh || user?.id;
    if (idToUse) {
        const refreshedUserFromPlatform = getUserFromPlatform(idToUse);
        if (refreshedUserFromPlatform) {
            const userWithCorrectCurrentRole = {
                ...refreshedUserFromPlatform,
                currentRole: user?.currentRole || refreshedUserFromPlatform.currentRole,
            };
            setUser(userWithCorrectCurrentRole);
            localStorage.setItem('cena-user', JSON.stringify(userWithCorrectCurrentRole));
        } else {
            // User might have been deleted, log out
            logout();
        }
    }
  };

  const setCurrentUserAndPersist = (updatedUser: User) => {
    if (!updatedUser) return;
    // Preserve currentRole if it exists on the current auth user,
    // as updatedUser might be a more generic User object from UserManagementContext.
    const finalUserToSet = {
        ...updatedUser,
        currentRole: user?.currentRole || updatedUser.currentRole || Role.VISITOR,
    };
    setUser(finalUserToSet);
    localStorage.setItem('cena-user', JSON.stringify(finalUserToSet));
  };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, switchRole, updateUserPlan, refreshCurrentUser, setCurrentUserAndPersist }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};