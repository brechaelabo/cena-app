
import React, { useState, useEffect } from 'react';
import { Button } from '../Common/Button';
import { User, Role, Plan, ActorLevel, BillingCycle } from '../../types';
import { ROLE_NAMES, PLAN_DETAILS_MAP } from '../../constants';
import { usePlatformUsers } from '../../contexts/UserManagementContext'; 
import { useToasts } from '../../contexts/ToastContext';

interface UserEditModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user: initialUser, isOpen, onClose }) => {
  const [selectedRole, setSelectedRole] = useState<Role | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(undefined);
  const [actorStatus, setActorStatus] = useState<boolean | undefined>(undefined);
  const [actorAutoRenew, setActorAutoRenew] = useState<boolean | undefined>(undefined);
  
  const { updateUserInList } = usePlatformUsers();
  const { addToast } = useToasts();

  useEffect(() => {
    if (initialUser) {
      setSelectedRole(initialUser.currentRole);
      if (initialUser.currentRole === Role.ACTOR) {
        setSelectedPlan(initialUser.activePlan);
        setActorStatus(initialUser.isApproved);
        setActorAutoRenew(initialUser.isAutoRenew);
      } else {
        setSelectedPlan(undefined);
        setActorStatus(undefined);
        setActorAutoRenew(undefined);
      }
    }
  }, [initialUser]);

  if (!isOpen || !initialUser) return null;

  const handleSave = () => {
    if (!selectedRole) {
      addToast("Papel do usuário não selecionado.", "error");
      return;
    }

    try {
        let updatedUser: User = { 
          ...initialUser, // Start with current user data
          currentRole: selectedRole,
          updatedAt: new Date().toISOString(),
        };

        // Handle role pivots - ensure the selected role is the current one in the roles array
        const newRolesPivot = [...initialUser.roles]; // Create a shallow copy to modify
        const existingRolePivotIndex = newRolesPivot.findIndex(rp => rp.role === selectedRole);

        if (existingRolePivotIndex === -1) { // If selected role is new for the user
            newRolesPivot.push({
                id: `rp-modal-${Date.now()}`,
                userId: initialUser.id,
                role: selectedRole,
                plan: selectedRole === Role.ACTOR ? selectedPlan : undefined,
                createdAt: new Date().toISOString()
            });
        } else { // If selected role already exists, update its plan if it's Actor
             if (selectedRole === Role.ACTOR) {
                newRolesPivot[existingRolePivotIndex].plan = selectedPlan;
             }
        }
        updatedUser.roles = newRolesPivot;


        if (selectedRole === Role.ACTOR) {
            updatedUser.activePlan = selectedPlan;
            updatedUser.isApproved = actorStatus;
            updatedUser.isAutoRenew = actorAutoRenew;
            // Ensure other actor-specific fields are maintained or initialized if necessary
            updatedUser.actorLevel = initialUser.actorLevel || ActorLevel.INICIJANTE;
            updatedUser.billingCycle = initialUser.billingCycle || BillingCycle.MONTHLY;
            updatedUser.subscriptionEndDate = initialUser.subscriptionEndDate;
            updatedUser.interestedTechniques = initialUser.interestedTechniques || [];
            updatedUser.otherInterests = initialUser.otherInterests || [];
        } else {
            // Clear actor-specific fields because the new role is not Actor.
            updatedUser.activePlan = undefined;
            updatedUser.billingCycle = undefined;
            updatedUser.actorLevel = undefined;
            updatedUser.subscriptionEndDate = undefined;
            updatedUser.isAutoRenew = undefined;
            updatedUser.interestedTechniques = undefined;
            updatedUser.otherInterests = undefined;
            updatedUser.preferredTutorId = undefined; 
            
            // Set default approval for new role if needed
            updatedUser.isApproved = selectedRole === Role.ADMIN;
        }
        
        updateUserInList(updatedUser);
        addToast("Usuário atualizado com sucesso!", "success");
        onClose();

    } catch(e: any) {
        addToast(e.message || "Erro ao salvar alterações.", "error");
    }
  };
  
  const commonSelectClass = "w-full p-2 rounded bg-bg-dark-element text-text-primary border border-brand-accent focus:ring-link-active focus:border-link-active";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-brand-primary p-6 rounded-lg shadow-xl w-full max-w-md text-white">
        <h2 className="text-xl font-semibold mb-6">Editar Usuário: {initialUser.name}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">Papel Principal:</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => {
                const newRole = e.target.value as Role;
                setSelectedRole(newRole);
                if (newRole !== Role.ACTOR) {
                    setSelectedPlan(undefined); 
                    setActorStatus(initialUser.currentRole === newRole ? initialUser.isApproved : newRole === Role.ADMIN); 
                    setActorAutoRenew(undefined);
                } else {
                    setActorStatus(initialUser.isApproved);
                    setActorAutoRenew(initialUser.isAutoRenew);
                    setSelectedPlan(initialUser.activePlan || Plan.BASIC);
                }
              }}
              className={commonSelectClass}
            >
              {Object.values(Role).filter(r => r !== Role.VISITOR && r !== Role.TUTOR).map(r => (
                <option key={r} value={r}>{ROLE_NAMES[r]}</option>
              ))}
            </select>
          </div>

          {selectedRole === Role.ACTOR && (
            <>
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-text-secondary mb-1">Plano (Ator):</label>
                <select
                    id="plan"
                    value={selectedPlan || ''}
                    onChange={(e) => setSelectedPlan(e.target.value as Plan)}
                    className={commonSelectClass}
                >
                    <option value="" disabled>Selecione um plano</option>
                    {Object.values(Plan).map(p => (
                    <option key={p} value={p}>{PLAN_DETAILS_MAP[p].name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label htmlFor="actorStatus" className="block text-sm font-medium text-text-secondary mb-1">Status da Conta (Ator):</label>
                <select
                  id="actorStatus"
                  value={actorStatus ? 'true' : 'false'}
                  onChange={(e) => setActorStatus(e.target.value === 'true')}
                  className={commonSelectClass}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
              <div>
                <label htmlFor="actorAutoRenew" className="block text-sm font-medium text-text-secondary mb-1">Renovação Automática (Ator):</label>
                <select
                  id="actorAutoRenew"
                  value={actorAutoRenew ? 'true' : 'false'}
                  onChange={(e) => setActorAutoRenew(e.target.value === 'true')}
                  className={commonSelectClass}
                >
                  <option value="true">Automática</option>
                  <option value="false">Manual</option>
                </select>
              </div>
            </>
          )}
        </div>
        <div className="mt-8 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} className="border-text-secondary text-text-secondary hover:bg-brand-accent hover:text-white">Cancelar</Button>
          <Button variant="primary" onClick={handleSave} className="bg-white text-brand-primary hover:bg-gray-200">Salvar Alterações</Button>
        </div>
      </div>
    </div>
  );
};
