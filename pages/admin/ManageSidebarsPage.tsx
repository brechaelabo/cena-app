import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { Role, SidebarNavItemConfig, SidebarRoleConfig } from '../../types';
import { ROLE_NAMES, MASTER_NAV_ITEMS, PATHS } from '../../constants';
import { useSidebarConfig } from '../../contexts/SidebarConfigContext';
import { useToasts } from '../../contexts/ToastContext';
import * as Icons from '../../components/Common/Icons'; // Import all icons
import { ToggleSwitch } from '../../components/Common/ToggleSwitch'; 

const ManageSidebarsPage: React.FC = () => {
  const { sidebarConfigs, getSidebarConfigForRole, updateSidebarConfigForRole, resetSidebarConfigForRole, isLoadingConfig } = useSidebarConfig();
  const { addToast } = useToasts();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.ACTOR); 
  const [currentRoleConfig, setCurrentRoleConfig] = useState<SidebarNavItemConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);


  useEffect(() => {
    if (!isLoadingConfig) {
      if (selectedRole === Role.ADMIN) {
        setSelectedRole(Role.ACTOR); 
        return;
      }
      const config = getSidebarConfigForRole(selectedRole);
      setCurrentRoleConfig(config.filter(item => item.id !== PATHS.ADMIN_MANAGE_SIDEBARS)); 
    }
  }, [selectedRole, sidebarConfigs, getSidebarConfigForRole, isLoadingConfig]);

  const handleItemChange = (itemId: string, field: keyof SidebarNavItemConfig, value: any) => {
    setCurrentRoleConfig(prevConfig =>
      prevConfig.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); 
    if (index !== draggedItemIndex) {
      setDropTargetIndex(index);
    }
  };
  
  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault();
    setDropTargetIndex(null);
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
      setDraggedItemIndex(null);
      return;
    }

    const newConfig = [...currentRoleConfig];
    const draggedItem = newConfig.splice(draggedItemIndex, 1)[0];
    newConfig.splice(targetIndex, 0, draggedItem);

    const reorderedConfig = newConfig.map((item, idx) => ({
      ...item,
      currentOrder: idx,
    }));
    setCurrentRoleConfig(reorderedConfig);
    setDraggedItemIndex(null);
  };


  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const finalConfig = currentRoleConfig.map((item, index) => ({
        ...item,
        currentOrder: index,
      }));
      updateSidebarConfigForRole(selectedRole, finalConfig);
      addToast(`Configurações do menu para ${ROLE_NAMES[selectedRole]} salvas!`, 'success');
    } catch (e) {
      addToast('Erro ao salvar configurações.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetRoleConfig = () => {
    if (window.confirm(`Tem certeza que deseja restaurar a configuração padrão do menu para ${ROLE_NAMES[selectedRole]}?`)) {
      resetSidebarConfigForRole(selectedRole);
      addToast(`Configuração do menu para ${ROLE_NAMES[selectedRole]} restaurada para o padrão.`, 'info');
    }
  };

  const handleToggleAll = (field: 'isVisible' | 'isDisabled', value: boolean) => {
    setCurrentRoleConfig(prevConfig =>
      prevConfig.map(item => {
        if (field === 'isDisabled') {
          // Only affect items that are visible
          return item.isVisible ? { ...item, isDisabled: !value } : item;
        }
        // For 'isVisible', apply to all items regardless of their 'isDisabled' state
        return { ...item, [field]: value };
      })
    );
  };


  if (isLoadingConfig) {
    return <div className="text-center p-6">Carregando configurações do menu...</div>;
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5 mr-2 text-text-muted" /> : <Icons.PuzzlePieceIcon className="w-5 h-5 mr-2 text-text-muted" />;
  };
  
  const isManagingAdminRole = selectedRole === Role.ADMIN;

  const ActionButton: React.FC<{onClick: () => void; children: React.ReactNode;}> = ({onClick, children}) => (
    <button 
      onClick={onClick} 
      className="px-0.5 py-0.5 text-[9px] bg-gray-100 hover:bg-gray-200 text-link-active rounded-sm transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6 p-0">
      <h1 className="text-2xl md:text-3xl font-bold text-black">Menus Laterais</h1>

      <Card>
        <div className="p-4">
          <label htmlFor="roleSelect" className="block text-sm font-medium text-text-body mb-1">
            Configurar Menu para o Papel:
          </label>
          <select
            id="roleSelect"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            className="w-full max-w-xs p-2 border border-border-subtle rounded-md bg-card-bg text-text-body focus:ring-link-active focus:border-link-active"
          >
            {(Object.values(Role) as Role[])
              .filter(r => r !== Role.VISITOR && r !== Role.ADMIN) 
              .map(r => (
                <option key={r} value={r}>{ROLE_NAMES[r]}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card title={<span className="text-black">{`Itens do Menu para ${ROLE_NAMES[selectedRole]}`}</span>}>
        <div className="p-4 space-y-3">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-2 items-center mb-1 pb-1 border-b border-border-subtle">
              <span className="font-semibold text-sm text-text-headings">Item do Menu</span>
              <div className="w-20 text-center">
                <span className="font-semibold text-sm text-text-headings block mb-0">Visível</span>
                <div className="flex items-center justify-center space-x-px text-[9px] mt-0.5">
                    <ActionButton onClick={() => handleToggleAll('isVisible', true)}>Todos</ActionButton>
                    <span className="mx-0.5 text-text-muted text-[9px]">/</span>
                    <ActionButton onClick={() => handleToggleAll('isVisible', false)}>Nenhum</ActionButton>
                </div>
              </div>
              <div className="w-20 text-center">
                <span className="font-semibold text-sm text-text-headings block mb-0">Ativo</span>
                 <div className="flex items-center justify-center space-x-px text-[9px] mt-0.5">
                    <ActionButton onClick={() => handleToggleAll('isDisabled', true)}>Todos</ActionButton>
                     <span className="mx-0.5 text-text-muted text-[9px]">/</span>
                    <ActionButton onClick={() => handleToggleAll('isDisabled', false)}>Nenhum</ActionButton>
                </div>
              </div>
            </div>

          {currentRoleConfig.map((item, index) => (
            <div
              key={item.id}
              draggable={!isManagingAdminRole}
              onDragStart={(e) => !isManagingAdminRole && handleDragStart(e, index)}
              onDragOver={(e) => !isManagingAdminRole && handleDragOver(e, index)}
              onDragLeave={!isManagingAdminRole && handleDragLeave}
              onDrop={(e) => !isManagingAdminRole && handleDrop(e, index)}
              className={`
                p-3 border border-border-subtle rounded-md bg-gray-50 
                grid grid-cols-[1fr_auto_auto] gap-x-2 gap-y-2 items-center
                ${!isManagingAdminRole ? 'cursor-grab' : ''}
                ${draggedItemIndex === index ? 'opacity-50 border-dashed border-link-active' : ''}
                ${dropTargetIndex === index && draggedItemIndex !== null && draggedItemIndex !== index ? 'border-2 border-solid border-link-active' : ''}
              `}
              style={{ transition: 'border 0.2s ease-in-out, opacity 0.2s ease-in-out' }}
            >
              <div className="flex items-center flex-grow min-w-0">
                {getIconComponent(item.iconName)}
                <span className="font-medium text-text-headings break-words" title={item.name}>{item.name}</span>
              </div>
              <div className="flex items-center justify-start pl-[29px] w-20"> {/* Padding for visual centering */}
                <ToggleSwitch
                    id={`visible-${item.id}`}
                    checked={item.isVisible}
                    onChange={(checked) => handleItemChange(item.id, 'isVisible', checked)}
                    disabled={isManagingAdminRole}
                />
              </div>
              <div className="flex items-center justify-start pl-[29px] w-20"> {/* Padding for visual centering */}
                 <ToggleSwitch
                    id={`active-${item.id}`}
                    checked={!item.isDisabled}
                    onChange={(checked) => handleItemChange(item.id, 'isDisabled', !checked)}
                    disabled={isManagingAdminRole || !item.isVisible}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-border-subtle">
        <Button variant="outline" onClick={handleResetRoleConfig} disabled={isSaving || isManagingAdminRole}>
          Restaurar Padrão para este Papel
        </Button>
        <Button variant="primary" onClick={handleSaveChanges} isLoading={isSaving} disabled={isSaving || isManagingAdminRole}>
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default ManageSidebarsPage;