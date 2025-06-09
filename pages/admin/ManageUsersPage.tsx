
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { Input } from '../../components/Common/Input';
import { PATHS, ROLE_NAMES, PLAN_DETAILS_MAP, ACTOR_LEVEL_NAMES, BILLING_CYCLE_NAMES } from '../../constants'; // MOCK_ASSETS_URL removed
import { User, Role, Plan, ActorLevel, BillingCycle } from '../../types';
import { UserGroupIcon, EyeIcon, AcademicCapIcon, ClockIcon, ArrowPathIcon as RenewalIcon, CreditCardIcon as SubscriptionIcon } from '../../components/Common/Icons'; 
import { useAuth } from '../../contexts/AuthContext';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { UserEditModal } from '../../components/Admin/UserEditModal';
import { useToasts } from '../../contexts/ToastContext';
import { calculateDaysRemaining } from '../../utils/dateFormatter';

type ActorTab = 'ativos' | 'inativos';

const ManageUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: adminUser } = useAuth();
  const { platformUsers, toggleUserApproval: toggleGuestApproval } = usePlatformUsers();
  const { addToast } = useToasts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [actionLoadingForUserId, setActionLoadingForUserId] = useState<string | null>(null);
  const [activeActorTab, setActiveActorTab] = useState<ActorTab>('ativos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);

  useEffect(() => {
    if (!adminUser || adminUser.currentRole !== Role.ADMIN) {
        addToast("Acesso não autorizado.", 'error');
        navigate(PATHS.LOGIN);
    }
  }, [adminUser, navigate, addToast]);

  const searchedUsers = platformUsers.filter(u =>
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const allActors = searchedUsers.filter(u => u.currentRole === Role.ACTOR);
  
  // Simplified tab logic based solely on isApproved
  const activeActors = allActors.filter(u => u.isApproved === true);
  const inactiveActors = allActors.filter(u => u.isApproved === false);
  
  const guests = searchedUsers.filter(u => u.currentRole === Role.GUEST);
  const tutors = searchedUsers.filter(u => u.currentRole === Role.TUTOR);
  const admins = searchedUsers.filter(u => u.currentRole === Role.ADMIN);


  const handleOpenEditModal = (userToEdit: User) => {
    setSelectedUserForEdit(userToEdit);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserForEdit(null);
  };

  const handleToggleGuestApprovalLocal = async (userId: string, currentStatus: boolean) => {
    setActionLoadingForUserId(userId);
    try {
      await new Promise(resolve => setTimeout(resolve, 700)); 
      toggleGuestApproval(userId); 
      addToast(`Acesso de convidado ${currentStatus ? 'suspenso' : 'concedido'} com sucesso.`, 'success');
    } catch (e: any) {
      addToast("Falha ao alterar status de aprovação do convidado.", 'error');
    } finally {
      setActionLoadingForUserId(null);
    }
  };

  if (isLoadingPage) {
    return <div className="text-center p-10 text-text-body">Carregando usuários...</div>;
  }
  
  const renderUserTable = (users: User[], userType: Role, currentActorTab?: ActorTab) => {
    const isActorTable = userType === Role.ACTOR;
    const isGuestTable = userType === Role.GUEST;
    const isTutorTable = userType === Role.TUTOR;
    const isAdminTable = userType === Role.ADMIN;

    if (users.length === 0 && !isLoadingPage) {
      return (
        <Card className="mt-4">
          <div className="text-center py-8">
            <UserGroupIcon className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-headings mb-1">
              Nenhum usuário encontrado
            </h3>
            <p className="text-sm text-text-body">
              {searchTerm ? `Nenhum ${ROLE_NAMES[userType].toLowerCase()} corresponde à sua busca.` : 
               isActorTable && currentActorTab ? `Não há atores/atrizes ${currentActorTab === 'ativos' ? 'ativos' : 'inativos'}.` :
               `Não há ${ROLE_NAMES[userType].toLowerCase()}s cadastrados.`
              }
            </p>
          </div>
        </Card>
      );
    }
    
    return (
      <div className="overflow-x-auto bg-card-bg shadow-md rounded-lg border border-border-subtle mt-4">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              {isActorTable && <>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assinatura</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo Rest.</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renovação</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </>}
              {isGuestTable && <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aprovação</th>}
              {isTutorTable && <>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feedbacks</th>
              </>}
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-card-bg divide-y divide-border-subtle">
            {users.map((u) => {
              const timeRemainingDisplay = (isActorTable && currentActorTab === 'inativos') 
                ? "Expirado" 
                : (isActorTable ? calculateDaysRemaining(u.subscriptionEndDate) : 'N/A');
              const userImage = u.imageUrl || `/placeholder-images/profile-default-${u.id.substring(0, 5)}-50x50.jpg`; // Use specific placeholder if no image

              return (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-9 w-9">
                      <img className="h-9 w-9 rounded-full object-cover" src={userImage} alt={u.name || u.email} />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-text-headings">{u.name || 'N/A'}</div>
                    </div>
                  </div>
                </td>
                {isActorTable && (
                  <>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-body">
                      {u.actorLevel ? (
                        <span className="flex items-center">
                          <AcademicCapIcon className="w-4 h-4 mr-1 text-text-muted"/> 
                          {ACTOR_LEVEL_NAMES[u.actorLevel] || 'N/A'}
                        </span>
                      ) : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-body">
                      {u.activePlan ? (PLAN_DETAILS_MAP[u.activePlan]?.name || 'N/A') : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-body">
                      {u.billingCycle ? BILLING_CYCLE_NAMES[u.billingCycle] : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-body">
                      {timeRemainingDisplay}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-body">
                      {u.isAutoRenew ? 'Automática' : 'Manual'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isApproved ? 'bg-status-active-bg text-status-active-text' : 'bg-status-inactive-bg text-status-inactive-text'}`}>
                            {u.isApproved ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                  </>
                )}
                {isGuestTable && (
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isApproved ? 'bg-status-active-bg text-status-active-text' : 'bg-status-inactive-bg text-status-inactive-text'}`}>
                            {u.isApproved ? 'Aprovado' : 'Pendente'}
                        </span>
                    </td>
                 )}
                {isTutorTable && (
                  <>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${u.isApproved ? 'bg-status-active-bg text-status-active-text' : 'bg-status-inactive-bg text-status-inactive-text'}`}>
                        {u.tutorApplicationStatus === 'APPROVED' ? 'Aprovado' : 
                         u.tutorApplicationStatus === 'PENDING_REVIEW' ? 'Pendente' :
                         u.tutorApplicationStatus === 'OBSERVATION' ? 'Observação' : 'Rejeitado'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-text-body">
                      {u.feedbacksSentCount || 0} enviados
                    </td>
                  </>
                )}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-body">{u.email}</td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {isActorTable && (
                    <Link to={PATHS.ADMIN_ACTOR_REVIEW.replace(':actorId', u.id)}>
                      <Button variant="outline" size="sm" disabled={!!actionLoadingForUserId} leftIcon={<EyeIcon className="w-4 h-4" />}>Dossiê</Button>
                    </Link>
                  )}
                  {isGuestTable && ( 
                    <Button 
                      variant={u.isApproved ? 'danger' : 'secondary'} 
                      size="sm" 
                      onClick={() => handleToggleGuestApprovalLocal(u.id, !!u.isApproved)}
                      isLoading={actionLoadingForUserId === u.id}
                      disabled={!!actionLoadingForUserId && actionLoadingForUserId !== u.id}
                    >
                      {u.isApproved ? 'Suspender' : 'Aprovar'}
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenEditModal(u)}
                    disabled={!!actionLoadingForUserId}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <div className="p-0 space-y-8"> 
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-text-headings">Gerenciar Usuários</h1>
        <Input 
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs text-sm md:ml-auto" 
            disabled={!!actionLoadingForUserId}
        />
      </div>
      
      <div>
        <div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-2">
            <h2 className="text-xl font-semibold text-text-headings">
                Atores e Atrizes 
                <span className="text-base font-normal text-text-muted ml-1">
                  ({activeActorTab === 'ativos' ? activeActors.length : inactiveActors.length})
                </span>
            </h2>
            <div className="flex space-x-2">
                <Button 
                    variant={activeActorTab === 'ativos' ? 'primary' : 'outline'} 
                    onClick={() => setActiveActorTab('ativos')} 
                    size="sm"
                    disabled={!!actionLoadingForUserId}
                >
                    Ativos ({activeActors.length})
                </Button>
                <Button 
                    variant={activeActorTab === 'inativos' ? 'primary' : 'outline'} 
                    onClick={() => setActiveActorTab('inativos')} 
                    size="sm"
                    disabled={!!actionLoadingForUserId}
                >
                    Inativos ({inactiveActors.length})
                </Button>
            </div>
        </div>
        {activeActorTab === 'ativos' && renderUserTable(activeActors, Role.ACTOR, 'ativos')}
        {activeActorTab === 'inativos' && renderUserTable(inactiveActors, Role.ACTOR, 'inativos')}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text-headings mb-1 border-b border-border-subtle pb-2">Tutores ({tutors.length})</h2>
        {renderUserTable(tutors, Role.TUTOR)}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text-headings mb-1 border-b border-border-subtle pb-2">Convidados ({guests.length})</h2>
        {renderUserTable(guests, Role.GUEST)}
      </div>

      <div>
        <h2 className="text-xl font-semibold text-text-headings mb-1 border-b border-border-subtle pb-2">Administradores ({admins.length})</h2>
        {renderUserTable(admins, Role.ADMIN)}
      </div>

      {isModalOpen && selectedUserForEdit && <UserEditModal user={selectedUserForEdit} isOpen={isModalOpen} onClose={handleCloseModal} />}
    </div>
  );
};

export default ManageUsersPage;
