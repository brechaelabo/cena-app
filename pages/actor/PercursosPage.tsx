
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePercursos } from '../../contexts/PercursosContext';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { BookOpenIcon, LockClosedIcon, CalendarDaysIcon, UserIcon as InstructorIcon, PriceTagIcon } from '../../components/Common/Icons';
import { PATHS } from '../../constants';
import { Course, CourseType, COURSE_TYPE_NAMES } from '../../types';
import { useToasts } from '../../contexts/ToastContext';
import { formatFullDate } from '../../utils/dateFormatter';

const PercursosPage: React.FC = () => {
  const { courses, isPercursosPagePublished } = usePercursos();
  const { addToast } = useToasts();
  const navigate = useNavigate();
  
  const handleInscricaoSimulada = (courseTitle: string) => {
    addToast(`Inscrição em "${courseTitle}" realizada com sucesso! (Simulação). Em breve, o link da sala ou acesso ao material estaria disponível aqui.`, 'success');
  };

  if (!isPercursosPagePublished) {
    return (
      <div className="text-center p-10 md:p-20">
        <LockClosedIcon className="w-20 h-20 md:w-28 md:h-28 text-text-muted mx-auto mb-6" />
        <h1 className="text-2xl md:text-4xl font-bold text-headings mb-4">Percursos em Breve!</h1>
        <p className="text-lg text-text-body mb-8 max-w-xl mx-auto">
          Nossa equipe está preparando experiências de aprendizado incríveis para você.
          Volte em breve para conferir os novos Percursos da CENA!
        </p>
        <Button onClick={() => navigate(PATHS.DASHBOARD)} variant="primary" size="lg">
          Voltar ao Painel
        </Button>
      </div>
    );
  }

  const publishedCourses = courses.filter(course => course.isPublished);

  return (
    <div className="p-0">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-black">Nossos Percursos</h1>
        <p className="text-lg text-text-body mt-2">Invista no seu desenvolvimento com os cursos e workshops da CENA.</p>
      </div>

      {publishedCourses.length === 0 ? (
        <Card className="text-center">
          <div className="py-10 md:py-16">
            <BookOpenIcon className="w-16 h-16 md:w-20 md:h-20 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-semibold text-headings mb-2">Nenhum percurso disponível no momento</h2>
            <p className="text-text-body">Estamos trabalhando em novos conteúdos. Volte em breve!</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {publishedCourses.map(course => (
            <Link 
              key={course.id} 
              to={PATHS.COURSE_DETAIL.replace(':slug', course.slug)}
              className="block hover:no-underline focus:outline-none focus:ring-2 focus:ring-link-active focus:ring-offset-2 rounded-lg"
            >
              <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                {course.imageDataUrl || course.imageUrl ? (
                  <img 
                    src={course.imageDataUrl || course.imageUrl} 
                    alt={course.title} 
                    className="w-full h-48 object-cover" 
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <BookOpenIcon className="w-16 h-16 text-gray-400"/>
                  </div>
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-black mb-2 line-clamp-2" title={course.title}>{course.title}</h2>
                  <div className="flex items-center text-sm text-text-muted mb-2">
                    <InstructorIcon className="w-4 h-4 mr-1.5" />
                    <span>{course.instructor}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-action-secondary-bg text-action-secondary-text rounded-full font-medium self-start mb-3">
                      {COURSE_TYPE_NAMES[course.type]}
                  </span>
                  
                  <p className="text-sm text-text-body mb-4 line-clamp-3 flex-grow">{course.description}</p>
                  
                  <div className="text-2xl font-extrabold text-black mb-1">
                      R$ {course.price.toFixed(2)}
                  </div>
                  {course.installments && course.installments > 1 && (
                      <p className="text-xs text-text-muted mb-4">ou em até {course.installments}x de R$ {(course.price / course.installments).toFixed(2)}</p>
                  )}

                  <div className="mt-auto">
                      <Button 
                          variant="primary" 
                          className="w-full"
                          // onClick={(e) => { e.preventDefault(); handleInscricaoSimulada(course.title);}} // Keep CTA here or on detail page
                      >
                          Ver Detalhes
                      </Button>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PercursosPage;
