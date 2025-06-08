
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Common/Button';
import { Card } from '../../components/Common/Card';
import { PlusCircleIcon, BookOpenIcon, CheckCircleIcon, XCircleIcon, EyeIcon, LockClosedIcon } from '../../components/Common/Icons';
import { PATHS } from '../../constants';
import { usePercursos } from '../../contexts/PercursosContext';
import { Course, COURSE_TYPE_NAMES } from '../../types';
import { useToasts } from '../../contexts/ToastContext';
import { formatFullDate } from '../../utils/dateFormatter';

const ManagePercursosPage: React.FC = () => {
  const { courses, isPercursosPagePublished, togglePercursosPagePublication, setCoursePublicationStatus, deleteCourse } = usePercursos();
  const { addToast } = useToasts();
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const handleTogglePagePublication = async () => {
    setActionLoading(prev => ({ ...prev, globalPublish: true }));
    try {
      await togglePercursosPagePublication();
      addToast(`Página de Percursos ${!isPercursosPagePublished ? 'publicada' : 'ocultada'} para atores.`, 'success');
    } catch (e) {
      addToast("Falha ao alterar status de publicação da página.", 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, globalPublish: false }));
    }
  };

  const handleToggleCoursePublication = async (course: Course) => {
    setActionLoading(prev => ({ ...prev, [`coursePublish-${course.id}`]: true }));
    try {
      await setCoursePublicationStatus(course.id, !course.isPublished);
      addToast(`Percurso "${course.title}" ${!course.isPublished ? 'publicado' : 'ocultado'}.`, 'success');
    } catch (e) {
      addToast("Falha ao alterar status de publicação do percurso.", 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`coursePublish-${course.id}`]: false }));
    }
  };
  
  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o percurso "${courseTitle}"? Esta ação não pode ser desfeita.`)) {
      setActionLoading(prev => ({ ...prev, [`delete-${courseId}`]: true }));
      try {
        await deleteCourse(courseId);
        addToast(`Percurso "${courseTitle}" excluído com sucesso.`, 'success');
      } catch (e) {
        addToast("Falha ao excluir o percurso.", 'error');
      } finally {
        setActionLoading(prev => ({ ...prev, [`delete-${courseId}`]: false }));
      }
    }
  };


  return (
    <div className="p-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 md:mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-black">Gerenciar Percursos (Cursos)</h1>
        <div className="flex flex-col sm:flex-row gap-2">
            <Button 
                variant={isPercursosPagePublished ? "secondary" : "primary"}
                onClick={handleTogglePagePublication}
                isLoading={actionLoading['globalPublish']}
                disabled={!!Object.values(actionLoading).some(Boolean) && !actionLoading['globalPublish']}
                leftIcon={isPercursosPagePublished ? <XCircleIcon className="w-5 h-5"/> : <CheckCircleIcon className="w-5 h-5"/>}
            >
                {isPercursosPagePublished ? 'Ocultar Página de Percursos' : 'Publicar Página de Percursos'}
            </Button>
            <Link to={PATHS.ADMIN_CREATE_PERCURSO}>
                <Button variant="primary" leftIcon={<PlusCircleIcon className="w-5 h-5"/>} className="w-full sm:w-auto">
                    Novo Percurso
                </Button>
            </Link>
        </div>
      </div>
      {!isPercursosPagePublished && (
        <Card className="mb-6 bg-yellow-50 border-yellow-300">
            <div className="flex items-center">
                <LockClosedIcon className="w-6 h-6 text-yellow-600 mr-3"/>
                <p className="text-yellow-700 font-medium">
                    A página de "Percursos" está atualmente <span className="font-bold">OCULTA</span> para os atores. Clique no botão acima para publicá-la.
                </p>
            </div>
        </Card>
      )}


      {courses.length === 0 ? (
        <Card className="text-center">
          <div className="py-10 md:py-16">
            <BookOpenIcon className="w-16 h-16 md:w-20 md:h-20 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-headings mb-2">Nenhum percurso cadastrado</h2>
            <p className="text-text-body mb-6">Crie o primeiro percurso para seus atores.</p>
            <Link to={PATHS.ADMIN_CREATE_PERCURSO}>
              <Button variant="primary">Criar Novo Percurso</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col overflow-hidden">
              {course.imageDataUrl && (
                <img 
                  src={course.imageDataUrl} 
                  alt={course.title} 
                  className="w-full h-40 md:h-48 object-cover" 
                />
              )}
              {!course.imageDataUrl && course.imageUrl && (
                 <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-40 md:h-48 object-cover" 
                />
              )}
              {!course.imageDataUrl && !course.imageUrl && (
                <div className="w-full h-40 md:h-48 bg-gray-200 flex items-center justify-center">
                    <BookOpenIcon className="w-16 h-16 text-gray-400"/>
                </div>
              )}
              <div className="p-4 md:p-5 flex flex-col flex-grow">
                <h2 className="text-lg md:text-xl font-semibold text-black mb-1 line-clamp-2 group-hover:text-link-active">{course.title}</h2> {/* text-headings changed to text-black */}
                <p className="text-xs text-text-muted mb-2">Por: {course.instructor}</p>
                
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-medium flex items-center ${course.isPublished ? 'bg-status-active-bg text-status-active-text' : 'bg-status-inactive-bg text-status-inactive-text'}`}>
                    {course.isPublished ? <CheckCircleIcon className="w-3.5 h-3.5 mr-1" /> : <XCircleIcon className="w-3.5 h-3.5 mr-1" />}
                    {course.isPublished ? 'Publicado' : 'Não Publicado'}
                  </span>
                   <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium">{COURSE_TYPE_NAMES[course.type]}</span>
                </div>

                <p className="text-sm text-text-body mb-4 line-clamp-3 flex-grow">{course.description}</p>
                <p className="text-lg font-bold text-black mb-3">R$ {course.price.toFixed(2)}{course.installments && course.installments > 1 ? ` (em até ${course.installments}x)` : ''}</p>
                
                <div className="mt-auto pt-4 border-t border-border-subtle flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-end">
                    <Button 
                        variant={course.isPublished ? "secondary" : "primary"} 
                        size="sm" 
                        onClick={() => handleToggleCoursePublication(course)}
                        isLoading={actionLoading[`coursePublish-${course.id}`]}
                        disabled={!!Object.values(actionLoading).some(Boolean) && !actionLoading[`coursePublish-${course.id}`]}
                        className="w-full sm:w-auto"
                    >
                        {course.isPublished ? 'Ocultar' : 'Publicar'}
                    </Button>
                    <Link to={PATHS.ADMIN_EDIT_PERCURSO.replace(':percursoId', course.id)} className="w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          disabled={!!Object.values(actionLoading).some(Boolean)}
                          className="w-full"
                        >
                          Editar
                        </Button>
                    </Link>
                    <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        isLoading={actionLoading[`delete-${course.id}`]}
                        disabled={!!Object.values(actionLoading).some(Boolean) && !actionLoading[`delete-${course.id}`]}
                        className="w-full sm:w-auto"
                    >
                        Excluir
                    </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagePercursosPage;