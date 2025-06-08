
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Role, SidebarNavItemConfig, SidebarRoleConfig } from '../types';
import { MASTER_NAV_ITEMS, PATHS } from '../constants';
import { usePercursos } from './PercursosContext'; // To check if Percursos page is published

interface SidebarConfigContextType {
  sidebarConfigs: SidebarRoleConfig | null; // Allow null during initialization
  getSidebarConfigForRole: (role: Role) => SidebarNavItemConfig[];
  updateSidebarConfigForRole: (role: Role, newConfig: SidebarNavItemConfig[]) => void;
  resetSidebarConfigForRole: (role: Role) => void;
  isLoadingConfig: boolean;
}

const SidebarConfigContext = createContext<SidebarConfigContextType | undefined>(undefined);

const initializeRoleConfig = (role: Role, isPercursosPagePublished: boolean): SidebarNavItemConfig[] => {
  return MASTER_NAV_ITEMS
    .filter(item => {
      // Filter out Percursos (Em Breve) if Percursos page is published
      if (item.path === PATHS.SESSÕES_ACTOR_PLACEHOLDER && isPercursosPagePublished) return false;
      // Filter out Percursos if Percursos page is NOT published
      if (item.path === PATHS.PERCURSOS_ACTOR && !isPercursosPagePublished) return false;
      
      return item.originalRoles.includes(role);
    })
    .map((item, index) => ({
      ...item,
      currentOrder: item.defaultOrder !== undefined ? item.defaultOrder : index,
      isVisible: true,
      // Disable "Percursos (Em Breve)" if Percursos actual page is published.
      // "Percursos" actual page is disabled if its page is not published.
      // "Gerenciar Menus Laterais" should be enabled for Admins by default.
      isDisabled: (item.path === PATHS.SESSÕES_ACTOR_PLACEHOLDER && isPercursosPagePublished) || (item.path === PATHS.PERCURSOS_ACTOR && !isPercursosPagePublished),
    }))
    .sort((a, b) => a.currentOrder - b.currentOrder);
};


export const SidebarConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarConfigs, setSidebarConfigs] = useState<SidebarRoleConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const { isPercursosPagePublished } = usePercursos();

  useEffect(() => {
    setIsLoadingConfig(true);
    const storedConfigs = localStorage.getItem('cena-sidebar-configs');
    let loadedConfigs: SidebarRoleConfig | null = null;
    if (storedConfigs) {
      try {
        loadedConfigs = JSON.parse(storedConfigs);
      } catch (e) {
        console.error("Error parsing sidebar configs, re-initializing.", e);
        loadedConfigs = null; // Ensure it falls through to initialization
      }
    }

    if (loadedConfigs) {
      // Ensure all roles exist in loadedConfigs, and update items based on MASTER_NAV_ITEMS and isPercursosPagePublished
      const updatedConfigs: Partial<SidebarRoleConfig> = {};
      (Object.values(Role) as Role[]).forEach(role => {
        if (role !== Role.VISITOR) {
          const masterItemsForRole = MASTER_NAV_ITEMS.filter(masterItem => masterItem.originalRoles.includes(role));
          const existingRoleConfig = loadedConfigs![role] || [];
          
          const newRoleConfig = masterItemsForRole.map((masterItem, masterIndex) => {
            const existingItem = existingRoleConfig.find(i => i.id === masterItem.id);
            if (existingItem) {
              // Preserve user's order, visibility, disabled status but update name, icon, path from master
              return {
                ...existingItem,
                name: masterItem.name,
                iconName: masterItem.iconName,
                path: masterItem.path,
                originalRoles: masterItem.originalRoles,
                defaultOrder: masterItem.defaultOrder,
                isDynamic: masterItem.isDynamic,
                exact: masterItem.exact,
                notificationPath: masterItem.notificationPath,
                // Special handling for Percursos visibility based on system state
                isVisible: (masterItem.path === PATHS.PERCURSOS_ACTOR && !isPercursosPagePublished) ? false : existingItem.isVisible,
                isDisabled: (masterItem.path === PATHS.PERCURSOS_ACTOR && !isPercursosPagePublished) ? true : existingItem.isDisabled,
              };
            }
            // New item from master, initialize it
            return {
              ...masterItem,
              currentOrder: masterItem.defaultOrder !== undefined ? masterItem.defaultOrder : masterIndex,
              isVisible: !(masterItem.path === PATHS.PERCURSOS_ACTOR && !isPercursosPagePublished),
              isDisabled: (masterItem.path === PATHS.PERCURSOS_ACTOR && !isPercursosPagePublished),
            };
          });
          // Add items that might be in stored config but not in master (less likely, but for safety)
          existingRoleConfig.forEach(storedItem => {
            if (!newRoleConfig.find(i => i.id === storedItem.id)) {
              // Check if this orphan item is a Percursos link to handle its visibility
              if (storedItem.path === PATHS.PERCURSOS_ACTOR && !isPercursosPagePublished) {
                newRoleConfig.push({...storedItem, isVisible: false, isDisabled: true });
              } else {
                newRoleConfig.push(storedItem);
              }
            }
          });
          
          updatedConfigs[role] = newRoleConfig.sort((a,b) => a.currentOrder - b.currentOrder);
        }
      });
      setSidebarConfigs(updatedConfigs as SidebarRoleConfig);

    } else {
      const initialConfigs: Partial<SidebarRoleConfig> = {};
      (Object.values(Role) as Role[]).forEach(role => {
        if (role !== Role.VISITOR) { // Visitors don't have sidebars
          initialConfigs[role] = initializeRoleConfig(role, isPercursosPagePublished);
        }
      });
      setSidebarConfigs(initialConfigs as SidebarRoleConfig);
    }
    setIsLoadingConfig(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPercursosPagePublished]); // Removed sidebarConfigs from dependencies to avoid loop

  useEffect(() => {
    if (!isLoadingConfig && sidebarConfigs && Object.keys(sidebarConfigs).length > 0) {
        let needsPersist = false;
        const updatedConfigs: SidebarRoleConfig = { ...sidebarConfigs }; 
        (Object.values(Role) as Role[]).forEach(role => {
            if (role !== Role.VISITOR && !updatedConfigs[role]) {
                updatedConfigs[role] = initializeRoleConfig(role, isPercursosPagePublished);
                needsPersist = true;
            }
        });
        if (needsPersist) {
            setSidebarConfigs(updatedConfigs);
        }
        // Always persist to ensure any updates from initial load or dynamic changes are saved
        localStorage.setItem('cena-sidebar-configs', JSON.stringify(updatedConfigs));
    }
  }, [sidebarConfigs, isLoadingConfig, isPercursosPagePublished]);


  const getSidebarConfigForRole = useCallback((role: Role): SidebarNavItemConfig[] => {
    if (isLoadingConfig || !sidebarConfigs || !sidebarConfigs[role]) {
      return initializeRoleConfig(role, isPercursosPagePublished);
    }
    
    return sidebarConfigs[role].map(item => {
        if (item.path === PATHS.PERCURSOS_ACTOR) {
            return { ...item, iconName: isPercursosPagePublished ? 'BookOpenIcon' : 'LockClosedIcon', isDisabled: !isPercursosPagePublished, isVisible: isPercursosPagePublished, name: isPercursosPagePublished ? 'Percursos' : 'Percursos (Em Breve)', title: isPercursosPagePublished ? 'Nossos cursos e workshops' : 'Percursos (Em Breve)' };
        }
        if (item.path === PATHS.SESSÕES_ACTOR_PLACEHOLDER) { // Renamed to Percursos (Em Breve)
             return { ...item, iconName: 'LockClosedIcon', isDisabled: isPercursosPagePublished, isVisible: !isPercursosPagePublished, name: 'Percursos (Em Breve)', title: 'Percursos (Em Breve)' };
        }
        return item;
    }).sort((a, b) => a.currentOrder - b.currentOrder);
  }, [sidebarConfigs, isLoadingConfig, isPercursosPagePublished]);

  const updateSidebarConfigForRole = useCallback((role: Role, newConfig: SidebarNavItemConfig[]) => {
    setSidebarConfigs(prev => ({
      ...(prev || {} as SidebarRoleConfig), 
      [role]: newConfig.sort((a, b) => a.currentOrder - b.currentOrder),
    }));
  }, []);

  const resetSidebarConfigForRole = useCallback((role: Role) => {
    setSidebarConfigs(prev => ({
      ...(prev || {} as SidebarRoleConfig), 
      [role]: initializeRoleConfig(role, isPercursosPagePublished),
    }));
  }, [isPercursosPagePublished]);

  return (
    <SidebarConfigContext.Provider
      value={{
        sidebarConfigs,
        getSidebarConfigForRole,
        updateSidebarConfigForRole,
        resetSidebarConfigForRole,
        isLoadingConfig,
      }}
    >
      {children}
    </SidebarConfigContext.Provider>
  );
};

export const useSidebarConfig = (): SidebarConfigContextType => {
  const context = useContext(SidebarConfigContext);
  if (context === undefined) {
    throw new Error('useSidebarConfig must be used within a SidebarConfigProvider');
  }
  return context;
};
