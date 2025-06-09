
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ToastProvider } from './ToastContext';
import { NotificationProvider } from './NotificationContext';
import { UserManagementProvider } from './UserManagementContext';
import { SidebarConfigProvider } from './SidebarConfigContext';
import { LandingPageProvider } from './LandingPageContext';
import { PercursosProvider } from './PercursosContext';

interface AppContextType {
  initialized: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppContext.Provider value={{ initialized: true }}>
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <UserManagementProvider>
              <SidebarConfigProvider>
                <LandingPageProvider>
                  <PercursosProvider>
                    {children}
                  </PercursosProvider>
                </LandingPageProvider>
              </SidebarConfigProvider>
            </UserManagementProvider>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </AppContext.Provider>
  );
};
