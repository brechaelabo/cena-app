
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePercursos } from '../../contexts/PercursosContext';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { ArrowLeftIcon, BookOpenIcon, CalendarDaysIcon, ClockIcon, UserIcon as InstructorIcon, PriceTagIcon, DocumentTextIcon, VideoCameraIcon, PuzzlePieceIcon } from '../../components/Common/Icons';
import { PATHS } from '../../constants';
import { useToasts } from '../../contexts/ToastContext';
import { formatFullDate } from '../../utils/dateFormatter';
import { CourseType, COURSE_TYPE_NAMES } from '../../types'; // Changed import location for COURSE_TYPE_NAMES

const CourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getCourseBySlug } = usePercursos();
  const { addToast } = useToasts();
  const navigate = useNavigate();

  const course = slug ? getCourseBySlug(slug) : undefined;

  if (!course) {
    return (
      <div className="text-center p-10">
        <BookOpenIcon className="w-24 h-24 text-text-muted mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-headings mb-4">Percurso não encontrado</h1>
        <p className="text-text-body mb-6">
          O percurso que você está procurando não foi encontrado ou não está mais disponível.
        </p>
        <Button onClick={() => navigate(PATHS.PERCURSOS_ACTOR)} variant="secondary">
          Ver todos os Percursos
        </Button>
      </div>
    );
  }
  
  const handleInscricaoSimulada = () => {
    addToast(`Inscrição em "${course.title}" realizada com sucesso! (Simulação). Em breve, o link da sala ou acesso ao material estaria disponível aqui.`, 'success');
  };

  const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | number | null; children?: React.ReactNode }> = ({ icon, label, value, children }) => (
    <div className="flex items-start py-3 border-b border-border-subtle last:border-b-0">
      <div className="flex-shrink-0 w-6 h-6 mr-3 text-link-active flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-sm font-medium text-text-muted">{label}</p>
        {value && <p className="text-md text-text-headings font-semibold">{value}</p>}
        {children && <div className="text-md text-text-body mt-0.5">{children}</div>}
      </div>
    </div>
  );

  return (
    <div>
      <Button 
        variant="ghost" 
        onClick={() => navigate(PATHS.PERCURSOS_ACTOR)} 
        className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar para Percursos
      </Button>

      <Card className="p-0 overflow-hidden">
        {(course.imageDataUrl || course.imageUrl) && (
          <img 
            src={course.imageDataUrl || course.imageUrl} 
            alt={course.title} 
            className="w-full h-64 md:h-80 object-cover" 
          />
        )}
        {!course.imageDataUrl && !course.imageUrl && (
             <div className="w-full h-64 md:h-80 bg-gray-200 flex items-center justify-center">
                <BookOpenIcon className="w-24 h-24 text-gray-400"/>
            </div>
        )}

        <div className="p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">{course.title}</h1>
          <div className="flex items-center text-md text-text-muted mb-1">
            <InstructorIcon className="w-5 h-5 mr-2" />
            <span>Ministrado por: <strong>{course.instructor}</strong></span>
          </div>
           <span className="text-sm px-2.5 py-1 bg-action-secondary-bg text-action-secondary-text rounded-full font-semibold self-start mb-4 inline-block">
              {COURSE_TYPE_NAMES[course.type]}
          </span>
          
          <p className="text-lg text-text-body mb-6">{course.description}</p>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
            <DetailItem icon={<PriceTagIcon />} label="Investimento" value={`R$ ${course.price.toFixed(2)}${course.installments && course.installments > 1 ? ` (em até ${course.installments}x)` : ''}`} />
            {course.type !== CourseType.PRE_RECORDED && course.scheduledAt && (
                 <DetailItem icon={<CalendarDaysIcon />} label="Data de Início" value={formatFullDate(course.scheduledAt) || 'A definir'} />
            )}
            {course.duration && <DetailItem icon={<ClockIcon />} label="Duração" value={course.duration} />}
            {course.type === CourseType.LIVE_PRESENTIAL && course.location && (
                <DetailItem icon={<PuzzlePieceIcon />} label="Local" value={course.location} />
            )}
             {course.meetLink && course.type !== CourseType.PRE_RECORDED && (
                <DetailItem icon={<VideoCameraIcon />} label="Sala Virtual">
                    <span className="text-sm text-text-muted">(Link será disponibilizado após inscrição)</span>
                </DetailItem>
            )}
          </div>

          {course.materials && course.materials.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-black mb-3">Materiais Inclusos:</h3>
              <ul className="list-disc list-inside pl-5 space-y-1 text-text-body">
                {course.materials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-border-subtle text-center">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleInscricaoSimulada}
              className="w-full sm:w-auto rounded-lg"
            >
              Inscrever-se neste Percurso
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CourseDetailPage;
