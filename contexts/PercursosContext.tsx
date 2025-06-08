
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Course, CourseType, NotificationType, Role, NotificationCreationData } from '../types'; 
import { useNotifications } from './NotificationContext'; 
import { usePlatformUsers } from './UserManagementContext'; // Added
import { PATHS } from '../constants';

const MOCK_INITIAL_COURSES: Course[] = [
  {
    id: 'percurso-001',
    title: 'Interpretação para Cinema: Do Clássico ao Contemporâneo',
    description: 'Explore técnicas de atuação cinematográfica, analisando desde os grandes clássicos até as produções mais recentes. Aulas práticas e teóricas.',
    instructor: 'Profa. Dra. Helena Vasconcelos',
    type: CourseType.LIVE_ONLINE,
    scheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), 
    duration: '8 semanas (2 encontros/semana)',
    price: 497.00,
    installments: 3,
    materials: ['Roteiros selecionados', 'Artigos sobre história do cinema', 'Links para cenas de referência'],
    meetLink: 'https://meet.google.com/xyz-abc-def', 
    imageUrl: '/placeholder-images/percurso-interpretacao-cinema-600x400.jpg', // Updated placeholder
    imageDataUrl: '/placeholder-images/percurso-interpretacao-cinema-600x400.jpg', // Updated placeholder for mock
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: 'interpretacao-cinema-classico-contemporaneo'
  },
  {
    id: 'percurso-002',
    title: 'A Arte da Self-Tape: Dominando a Audição Online',
    description: 'Aprenda os segredos para criar self-tapes impactantes, desde a iluminação e som até a direção de si mesmo. Ideal para atores que buscam oportunidades no mercado digital.',
    instructor: 'Prof. João Santos',
    type: CourseType.PRE_RECORDED, 
    duration: '10 módulos (Acesso vitalício)',
    price: 297.00,
    installments: 2,
    materials: ['Guia de equipamentos básicos', 'Checklist de gravação', 'Modelos de slate'],
    imageUrl: '/placeholder-images/percurso-arte-selftape-600x400.jpg', // Updated placeholder
    imageDataUrl: '/placeholder-images/percurso-arte-selftape-600x400.jpg', // Updated placeholder for mock
    isPublished: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: 'arte-self-tape-audicao-online'
  },
   {
    id: 'percurso-003',
    title: 'Workshop Intensivo de Viewpoints (Presencial RJ)',
    description: 'Uma imersão prática na técnica de Viewpoints com exercícios e criação coletiva. Vagas limitadas.',
    instructor: 'Profa. Ana Lima',
    type: CourseType.LIVE_PRESENTIAL, 
    location: 'Espaço CENA - Rio de Janeiro, RJ',
    scheduledAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), 
    duration: 'Sábado e Domingo (10h às 18h)',
    price: 650.00,
    installments: 3,
    imageUrl: '/placeholder-images/percurso-workshop-viewpoints-600x400.jpg', // Updated placeholder
    imageDataUrl: '/placeholder-images/percurso-workshop-viewpoints-600x400.jpg', // Updated placeholder for mock
    isPublished: false, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slug: 'workshop-viewpoints-presencial-rio'
  },
];

// NOTA: A constante MOCK_INITIAL_COURSES acima e o valor inicial de
// isPercursosPagePublished definem os dados padrão que serão carregados
// se nenhuma configuração for encontrada no localStorage.
// Se você atualizou estas constantes para refletir os novos padrões desejados,
// a aplicação as usará quando o localStorage estiver vazio.

interface PercursosContextType {
  courses: Course[];
  isPercursosPagePublished: boolean;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (updatedCourse: Course) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  getCourseById: (id: string) => Course | undefined;
  getCourseBySlug: (slug: string) => Course | undefined;
  togglePercursosPagePublication: () => Promise<void>;
  setCoursePublicationStatus: (courseId: string, isPublished: boolean) => Promise<void>;
}

const PercursosContext = createContext<PercursosContextType | undefined>(undefined);

export const PercursosProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(() => {
    const storedCourses = localStorage.getItem('cena-percursos');
    return storedCourses ? JSON.parse(storedCourses) : MOCK_INITIAL_COURSES;
  });

  const [isPercursosPagePublished, setIsPercursosPagePublished] = useState<boolean>(() => {
    const storedStatus = localStorage.getItem('cena-percursos-page-published');
    return storedStatus ? JSON.parse(storedStatus) : true; 
  });
  const { addNotification } = useNotifications(); 
  const { platformUsers } = usePlatformUsers(); // Added

  useEffect(() => {
    localStorage.setItem('cena-percursos', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('cena-percursos-page-published', JSON.stringify(isPercursosPagePublished));
  }, [isPercursosPagePublished]);

  const notifyActorsAndGuests = (notificationData: NotificationCreationData) => { // Changed type here
    const targetUserIds = platformUsers
        .filter(u => u.currentRole === Role.ACTOR || u.currentRole === Role.GUEST)
        .map(u => u.id);
    if (targetUserIds.length > 0) {
        addNotification(targetUserIds, notificationData);
    }
  };

  const addCourse = async (course: Course) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setCourses(prevCourses => [...prevCourses, course]);
    if (course.isPublished && isPercursosPagePublished) {
      notifyActorsAndGuests({
        type: NotificationType.NEW_COURSE,
        title: 'Novo Percurso Adicionado!',
        message: `Confira o novo percurso "${course.title}" ministrado por ${course.instructor}.`,
        linkTo: PATHS.COURSE_DETAIL.replace(':slug', course.slug),
        iconName: 'BookOpenIcon',
      });
    }
  };

  const updateCourse = async (updatedCourse: Course) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const oldCourse = courses.find(c => c.id === updatedCourse.id);
    setCourses(prevCourses =>
      prevCourses.map(course => (course.id === updatedCourse.id ? updatedCourse : course))
    );
    if (updatedCourse.isPublished && isPercursosPagePublished && (!oldCourse || !oldCourse.isPublished)) {
      notifyActorsAndGuests({
        type: NotificationType.NEW_COURSE,
        title: `Percurso Atualizado: ${updatedCourse.title}`,
        message: `O percurso "${updatedCourse.title}" foi atualizado e está disponível.`,
        linkTo: PATHS.COURSE_DETAIL.replace(':slug', updatedCourse.slug),
        iconName: 'BookOpenIcon',
      });
    }
  };

  const deleteCourse = async (courseId: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setCourses(prevCourses => prevCourses.filter(course => course.id !== courseId));
  };

  const getCourseById = (id: string) => {
    return courses.find(course => course.id === id);
  };

  const getCourseBySlug = (slug: string) => {
    return courses.find(course => course.slug === slug);
  };

  const togglePercursosPagePublication = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsPercursosPagePublished(prev => !prev);
  };

  const setCoursePublicationStatus = async (courseId: string, isPublished: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const courseToUpdate = courses.find(c => c.id === courseId);
    setCourses(prevCourses =>
      prevCourses.map(course =>
        course.id === courseId ? { ...course, isPublished } : course
      )
    );
    if (courseToUpdate && isPublished && !courseToUpdate.isPublished && isPercursosPagePublished) {
      notifyActorsAndGuests({
        type: NotificationType.NEW_COURSE,
        title: `Novo Percurso Disponível: ${courseToUpdate.title}`,
        message: `O percurso "${courseToUpdate.title}" agora está disponível para inscrição!`,
        linkTo: PATHS.COURSE_DETAIL.replace(':slug', courseToUpdate.slug),
        iconName: 'BookOpenIcon',
      });
    }
  };

  return (
    <PercursosContext.Provider
      value={{
        courses,
        isPercursosPagePublished,
        addCourse,
        updateCourse,
        deleteCourse,
        getCourseById,
        getCourseBySlug,
        togglePercursosPagePublication,
        setCoursePublicationStatus,
      }}
    >
      {children}
    </PercursosContext.Provider>
  );
};

export const usePercursos = (): PercursosContextType => {
  const context = useContext(PercursosContext);
  if (context === undefined) {
    throw new Error('usePercursos must be used within a PercursosProvider');
  }
  return context;
};