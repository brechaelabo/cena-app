
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { 
    PlusCircleIcon, 
    UserGroupIcon, 
    CheckCircleIcon, 
    XCircleIcon, 
    PuzzlePieceIcon,
    BookOpenIcon,
    SparklesIcon,
    VideoCameraIcon
} from '../../components/Common/Icons';
import { PATHS } from '../../constants';
import { useSessoesOneOnOne } from '../../contexts/SessoesOneOnOneContext';
import { SessaoCategoria } from '../../types';
import { useToasts } from '../../contexts/ToastContext';

const iconMapAdmin: { [key: string]: React.ElementType } = {
  BookOpenIcon,
  SparklesIcon,
  VideoCameraIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
};

const AdminManageSessoesPage: React.FC = () => {
  const { categorias, setCategoriaStatus, deleteCategoria } = useSessoesOneOnOne();
  const { addToast } = useToasts();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const handleToggleStatus = async (categoria: SessaoCategoria) => {
    setActionLoading(prev => ({ ...prev, [`status-${categoria.id}`]: true }));
    try {
      await setCategoriaStatus(categoria.id, !categoria.isActive);
      addToast(`Categoria "${categoria.title}" ${!categoria.isActive ? 'ativada' : 'desativada'}.`, 'success');
    } catch (e) {
      addToast("Falha ao alterar status da categoria.", 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`status-${categoria.id}`]: false }));
    }
  };
  
  const handleDelete = async (categoriaId: string, categoriaTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${categoriaTitle}"? Esta ação não pode ser desfeita.`)) {
      setActionLoading(prev => ({ ...prev, [`delete-${categoriaId}`]: true }));
      try {
        await deleteCategoria(categoriaId);
        addToast(`Categoria "${categoriaTitle}" excluída com sucesso.`, 'success');
      } catch (e) {
        addToast("Falha ao excluir a categoria.", 'error');
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete-${categoriaId}`]: false }));
      }
    }
  };

  return (
    <div className="p-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-black">Gerenciar Categorias de Sessões 1:1</h1>
        <Link to={PATHS.ADMIN_CREATE_SESSAO_CATEGORIA}>
            <Button variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>}>
                Nova Categoria de Sessão
            </Button>
        </Link>
      </div>

      {categorias.length === 0 ? (
        <Card className="text-center">
          <div className="py-10 md:py-16">
            <UserGroupIcon className="w-16 h-16 md:w-20 md:h-20 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-headings mb-2">Nenhuma categoria de sessão cadastrada</h2>
            <p className="text-text-body mb-6">Crie a primeira categoria para organizar as sessões individuais.</p>
            <Link to={PATHS.ADMIN_CREATE_SESSAO_CATEGORIA}>
              <Button variant="primary">Criar Nova Categoria</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto bg-card-bg shadow-md rounded-lg border border-border-subtle">
          <table className="min-w-full divide-y divide-border-subtle">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ícone</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição Curta</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-card-bg divide-y divide-border-subtle">
              {categorias.map((categoria) => {
                const IconComponent = categoria.iconName ? iconMapAdmin[categoria.iconName] || PuzzlePieceIcon : PuzzlePieceIcon;
                return (
                  <tr key={categoria.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <IconComponent className="w-6 h-6 text-link-active" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-headings">{categoria.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-body max-w-xs truncate" title={categoria.description}>{categoria.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${categoria.isActive ? 'bg-status-active-bg text-status-active-text' : 'bg-status-inactive-bg text-status-inactive-text'}`}>
                        {categoria.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button 
                            variant={categoria.isActive ? "secondary" : "primary"} 
                            size="sm" 
                            onClick={() => handleToggleStatus(categoria)}
                            isLoading={actionLoading[`status-${categoria.id}`]}
                            disabled={!!Object.values(actionLoading).some(Boolean) && !actionLoading[`status-${categoria.id}`]}
                        >
                            {categoria.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Link to={PATHS.ADMIN_EDIT_SESSAO_CATEGORIA.replace(':categoryId', categoria.id)}>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              disabled={!!Object.values(actionLoading).some(Boolean)}
                            >
                              Editar
                            </Button>
                        </Link>
                        <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDelete(categoria.id, categoria.title)}
                            isLoading={actionLoading[`delete-${categoria.id}`]}
                            disabled={!!Object.values(actionLoading).some(Boolean) && !actionLoading[`delete-${categoria.id}`]}
                        >
                            Excluir
                        </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminManageSessoesPage;
