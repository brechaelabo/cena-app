
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
  register: (email: string, name: string, roleRequest?: Role) => Promise<void>; 
  switchRole: (newRole: Role) => void;
  updateUserPlan: (newPlan: Plan) => void; 
  refreshCurrentUser: (userIdToRefresh?: string) => void;
  setCurrentUserAndPersist: (updatedUser: User) => void; // Added
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MOCK_USERS is now primarily managed by UserManagementContext's INITIAL_MOCK_USERS
// This MOCK_USERS here is only used for the login function to find users.
// The single source of truth for the list of users during runtime is platformUsers from UserManagementContext.
const MOCK_USERS_FOR_LOGIN_CHECK: User[] = [ // Renamed for clarity
  {
    id: 'user-admin-01',
    clerkId: 'clerk-admin-01',
    email: 'admin@cena.com',
    name: 'Helena Vasconcelos', 
    roles: [{ id: 'rp-admin', userId: 'user-admin-01', role: Role.ADMIN, createdAt: new Date().toISOString() }],
    currentRole: Role.ADMIN,
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-actor-01',
    clerkId: 'clerk-actor-01',
    email: 'actor@cena.com',
    name: 'Mariana Almeida', 
    roles: [{ id: 'rp-actor', userId: 'user-actor-01', role: Role.ACTOR, plan: Plan.BASIC, createdAt: new Date().toISOString() }],
    currentRole: Role.ACTOR,
    activePlan: Plan.BASIC,
    billingCycle: BillingCycle.MONTHLY, 
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-tutor-01',
    clerkId: 'clerk-tutor-01',
    email: 'tutor@cena.com',
    name: 'Prof. João Santos', 
    roles: [{ id: 'rp-tutor', userId: 'user-tutor-01', role: Role.TUTOR, createdAt: new Date().toISOString() }],
    currentRole: Role.TUTOR,
    isApproved: false, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tutorApplicationStatus: TutorApplicationStatus.PENDING_REVIEW,
  },
  {
    id: 'user-guest-01',
    clerkId: 'clerk-guest-01',
    email: 'guest@cena.com',
    name: 'Visitante Curioso', 
    roles: [{ id: 'rp-guest', userId: 'user-guest-01', role: Role.GUEST, createdAt: new Date().toISOString() }],
    currentRole: Role.GUEST,
    isApproved: false, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  { 
    id: 'user-tutor-02',
    clerkId: 'clerk-tutor-02',
    email: 'tutor2@cena.com',
    name: 'Profa. Ana Lima', 
    roles: [{ id: 'rp-tutor2', userId: 'user-tutor-02', role: Role.TUTOR, createdAt: new Date().toISOString() }],
    currentRole: Role.TUTOR,
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tutorApplicationStatus: TutorApplicationStatus.APPROVED,
  },
  {
    id: 'user-actor-02', 
    clerkId: 'clerk-actor-02',
    email: 'carlos@cena.com', 
    name: 'Carlos Pereira', 
    roles: [{ id: 'rp-actor2', userId: 'user-actor-02', role: Role.ACTOR, plan: Plan.PLUS, createdAt: '2021-06-20T10:00:00Z' }],
    currentRole: Role.ACTOR, activePlan: Plan.PLUS, billingCycle: BillingCycle.QUARTERLY, isApproved: true, createdAt: '2021-06-20T10:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'user-actor-03', 
    clerkId: 'clerk-actor-03',
    email: 'beatriz@cena.com', 
    name: 'Beatriz Costa', 
    roles: [{ id: 'rp-actor3', userId: 'user-actor-03', role: Role.ACTOR, plan: Plan.PRO, createdAt: '2023-11-05T10:00:00Z' }],
    currentRole: Role.ACTOR, activePlan: Plan.PRO, billingCycle: BillingCycle.ANNUAL, isApproved: true, createdAt: '2023-11-05T10:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'user-actor-04',
    clerkId: 'clerk-actor-04',
    email: 'pedro.silva@cena.com',
    name: 'Pedro Silva',
    roles: [{ id: 'rp-actor4', userId: 'user-actor-04', role: Role.ACTOR, plan: Plan.BASIC, createdAt: new Date().toISOString() }],
    currentRole: Role.ACTOR,
    activePlan: Plan.BASIC,
    billingCycle: BillingCycle.MONTHLY,
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
   {
    id: 'user-tutor-03',
    clerkId: 'clerk-tutor-03',
    email: 'ricardo.alves@cena.com',
    name: 'Prof. Ricardo Alves',
    roles: [{ id: 'rp-tutor3', userId: 'user-tutor-03', role: Role.TUTOR, createdAt: new Date().toISOString() }],
    currentRole: Role.TUTOR,
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tutorApplicationStatus: TutorApplicationStatus.APPROVED,
  },
  {
    id: 'user-tutor-04',
    clerkId: 'clerk-tutor-04',
    email: 'sofia.mendes@cena.com',
    name: 'Profa. Sofia Mendes',
    roles: [{ id: 'rp-tutor4', userId: 'user-tutor-04', role: Role.TUTOR, createdAt: new Date().toISOString() }],
    currentRole: Role.TUTOR,
    isApproved: false, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tutorApplicationStatus: TutorApplicationStatus.PENDING_REVIEW,
  }
];

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
      if (password && password.trim() !== '') {
        // Login real com backend (senha fornecida)
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

        const { user, token } = data.data;
        localStorage.setItem('cena-auth-token', token);
        localStorage.setItem('cena-user', JSON.stringify(user));
        setUser(user);
      } else {
        // Login mock (sem senha) - apenas para emails específicos de teste
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundUser = MOCK_USERS_FOR_LOGIN_CHECK.find(u => u.email === email);
        if (!foundUser) {
          throw new Error("Email não encontrado ou senha obrigatória.");
        }

        setUser(foundUser);
        localStorage.setItem('cena-user', JSON.stringify(foundUser));
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, name: string, roleRequest: Role = Role.ACTOR) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    if (platformUsers.find(u => u.email === email)) {
      setIsLoading(false);
      throw new Error("Email já cadastrado.");
    }

    const newUserId = `user-${Date.now()}`;
    const newUserRolePivot: RolePivot = {
      id: `rp-${Date.now()}`,
      userId: newUserId,
      role: roleRequest,
      createdAt: new Date().toISOString(),
    };
    let activePlanData: Plan | undefined = undefined;
    let billingCycleData: BillingCycle | undefined = undefined;
    let tutorAppStatus: TutorApplicationStatus | undefined = undefined;
    let initialApprovalStatus = roleRequest === Role.ADMIN; // Admins are approved by default

    if (roleRequest === Role.ACTOR) {
      newUserRolePivot.plan = Plan.BASIC; 
      activePlanData = Plan.BASIC;
      billingCycleData = BillingCycle.MONTHLY;
      initialApprovalStatus = false; 
    } else if (roleRequest === Role.TUTOR) {
      tutorAppStatus = TutorApplicationStatus.PENDING_REVIEW;
      initialApprovalStatus = false; 
    } else if (roleRequest === Role.GUEST) {
      initialApprovalStatus = false; 
    }

    const newUser: User = {
      id: newUserRolePivot.userId,
      clerkId: `clerk-${Date.now()}`,
      email,
      name,
      roles: [newUserRolePivot],
      currentRole: roleRequest,
      activePlan: activePlanData,
      billingCycle: billingCycleData,
      isApproved: initialApprovalStatus, 
      tutorApplicationStatus: tutorAppStatus, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addRegisteredUser(newUser); 

    setUser(newUser); 
    localStorage.setItem('cena-user', JSON.stringify(newUser));
    setIsLoading(false);
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