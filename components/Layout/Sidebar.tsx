
import React, { useContext, useRef, useState } from 'react'; // Added useRef, useState
import { NavLink, Link } from 'react-router-dom';
import { PATHS, SIDEBAR_WIDTH_OPEN, SIDEBAR_WIDTH_CLOSED, ROLE_NAMES } from '../../constants';
import { Role, User, SidebarNavItemConfig } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useSidebarConfig } from '../../contexts/SidebarConfigContext'; 
import * as Icons from '../Common/Icons'; 

interface SidebarProps {
  isOpen: boolean;
}

const getIconComponent = (iconName: string): React.ReactNode => {
  const IconComponent = (Icons as any)[iconName];
  return IconComponent ? <IconComponent className="w-5 h-5" /> : <Icons.PuzzlePieceIcon className="w-5 h-5" />; 
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();
  const { getUnreadNotificationCount } = useNotifications();
  const { getSidebarConfigForRole, isLoadingConfig, updateSidebarConfigForRole } = useSidebarConfig(); 

  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  
  const isAdmin = user?.currentRole === Role.ADMIN;

  if (!user || isLoadingConfig) {
    if (isOpen && isLoadingConfig) {
        return (
            <aside className={`
                fixed inset-y-0 left-0 z-30 pt-16 bg-brand-primary text-white transition-all duration-300 ease-in-out transform
                ${isOpen ? SIDEBAR_WIDTH_OPEN : 'lg:' + SIDEBAR_WIDTH_CLOSED + ' w-64'} 
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-4 text-center text-text-secondary text-sm">Carregando menu...</div>
            </aside>
        );
    }
    return null;
  }

  const userRole = user.currentRole;
  let navItemsConfig = getSidebarConfigForRole(userRole);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!isAdmin || !isOpen) return; // Only allow drag for admin when sidebar is open
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
     // Optional: style the dragged item itself using dataTransfer.setDragImage
    // e.dataTransfer.setDragImage(e.currentTarget, 20, 20);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!isAdmin || !isOpen) return;
    e.preventDefault(); // Necessary to allow drop
    if (index !== draggedItemIndex) {
      setDropTargetIndex(index);
    }
  };

  const handleDragLeave = () => {
    if (!isAdmin || !isOpen) return;
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    if (!isAdmin || !isOpen || draggedItemIndex === null || draggedItemIndex === targetIndex) {
      setDraggedItemIndex(null);
      setDropTargetIndex(null);
      return;
    }
    e.preventDefault();

    const newConfig = [...navItemsConfig];
    const draggedItem = newConfig.splice(draggedItemIndex, 1)[0];
    newConfig.splice(targetIndex, 0, draggedItem);

    const reorderedConfig = newConfig.map((item, idx) => ({
      ...item,
      currentOrder: idx,
    }));
    
    updateSidebarConfigForRole(Role.ADMIN, reorderedConfig);
    // The context update will trigger a re-render with the new order.
    // For more immediate feedback if context propagation is slow, one could:
    // setCurrentRoleConfigState(reorderedConfig); // If navItemsConfig were local state for this component

    setDraggedItemIndex(null);
    setDropTargetIndex(null);
  };

  const NavLinkClasses = (isActive: boolean, isDisabled?: boolean) =>
    `flex items-center px-3 py-2.5 text-sm font-medium rounded-md group transition-colors duration-150 ease-in-out relative
     ${isOpen ? 'justify-start' : 'lg:justify-center'}
     ${isDisabled ? 'text-text-secondary opacity-60 cursor-not-allowed pointer-events-none' : 
       isActive ? 'bg-brand-accent text-white' : 'text-text-secondary hover:bg-brand-accent hover:text-white'
     }`;
  
  const sidebarBaseClasses = "fixed inset-y-0 left-0 z-30 pt-16 bg-brand-primary text-white transition-all duration-300 ease-in-out transform overflow-y-auto scrollbar-thin scrollbar-thumb-brand-accent scrollbar-track-brand-primary";
  
  return (
    <aside className={`
      ${sidebarBaseClasses}
      ${isOpen ? SIDEBAR_WIDTH_OPEN : 'lg:' + SIDEBAR_WIDTH_CLOSED + ' w-64'} 
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <nav className="flex flex-col p-2 space-y-1">
        {navItemsConfig.filter(item => item.isVisible).map((item, index) => {
          const effectiveTitle = (!isOpen && window.innerWidth >= 1024) || item.isDisabled ? (item.title || item.name) + (item.isDisabled && (item.title?.includes('(Em Breve)') || item.name?.includes('(Em Breve)')) ? ' (Em Breve)' : '') : "";
          
          let itemCount = 0;
          if (item.notificationPath && item.notificationPath === PATHS.MESSAGES) {
            itemCount = getUnreadNotificationCount(user.id);
          }
          
          let currentPath = item.path;
          if (item.isDynamic) {
            if (item.path.includes(':themeId')) {
              currentPath = item.path.replace(':themeId', 'current'); 
            }
            if (item.path.includes(':submissionId')) {
              currentPath = item.path.replace(':submissionId', 'all'); 
            }
            if (item.path.includes(':categoryId')) {
              currentPath = item.path.replace(':categoryId', 'default'); 
            }
          }

          const navLinkContent = (
            <>
              {/* Ícone de arrastar removido daqui */}
              <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center">{getIconComponent(item.iconName)}</span>
              <span className={`ml-3 whitespace-nowrap overflow-hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:hidden'}`}>{item.name}</span>
              {itemCount > 0 && (
                 <span className={`absolute inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform transition-all 
                    ${isOpen ? 'top-1/2 -translate-y-1/2 right-3' 
                            : 'lg:top-0.5 lg:left-1/2 lg:-translate-x-1/2 lg:text-[0.6rem] lg:px-1'}`}>
                    {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </>
          );
          
          const itemWrapperClasses = `
            ${isAdmin && isOpen ? 'cursor-grab' : ''}
            ${draggedItemIndex === index ? 'opacity-30 border-2 border-dashed border-link-active' : ''}
            ${dropTargetIndex === index && draggedItemIndex !== null && draggedItemIndex !== index ? 'border-2 border-solid border-link-active' : 'border-2 border-transparent'}
             rounded-md transition-all duration-150 ease-in-out
          `;

          if (item.isDisabled) {
            return (
              <div 
                key={item.id} 
                className={itemWrapperClasses} 
                title={effectiveTitle || item.title || item.name}
              >
                <span className={NavLinkClasses(false, true)}>
                  {navLinkContent}
                </span>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              draggable={isAdmin && isOpen} 
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              className={itemWrapperClasses}
              title={effectiveTitle || item.title || item.name}
            >
              <NavLink 
                to={currentPath} 
                className={({ isActive }) => NavLinkClasses(isActive, item.isDisabled)} 
                end={item.exact !== undefined ? item.exact : (item.path === PATHS.DASHBOARD || item.path === PATHS.ACTOR_EM_CENA || item.path === PATHS.ADMIN_DASHBOARD || item.path === PATHS.TUTOR_DASHBOARD)} // Added more specific `end` conditions
              >
                {navLinkContent}
              </NavLink>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};