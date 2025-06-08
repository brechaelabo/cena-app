
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Role, Plan, RolePivot, BillingCycle, TutorApplicationStatus, TutorApplicationFormData, EducationLevel, ActorLevel, ActorOtherInterest, ActorProfileFormData, NotificationType } from '../types';
import { PATHS, ROLE_NAMES } from '../constants'; 
import { useNotifications } from './NotificationContext'; 

const generateFutureDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const generatePastDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

const INITIAL_MOCK_USERS: User[] = [
  {
    id: 'user-admin-01', email: 'admin@cena.com', name: 'Helena Vasconcelos',
    roles: [{ id: 'rp1', userId: 'user-admin-01', role: Role.ADMIN, createdAt: '2023-01-01T00:00:00Z' }],
    currentRole: Role.ADMIN, isApproved: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
    imageUrl: '/placeholder-images/profile-helena-admin-50x50.jpg' 
  },
  {
    id: 'user-actor-01', email: 'actor@cena.com', name: 'Mariana Almeida',
    roles: [{ id: 'rp2', userId: 'user-actor-01', role: Role.ACTOR, plan: Plan.BASIC, createdAt: '2022-01-15T10:00:00Z' }],
    currentRole: Role.ACTOR, activePlan: Plan.BASIC, billingCycle: BillingCycle.MONTHLY, isApproved: false, createdAt: '2022-01-15T10:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
    imageUrl: '/placeholder-images/profile-mariana-actor-50x50.jpg', 
    preferredTutorId: 'user-tutor-02',
    actorLevel: ActorLevel.INTERMEDIARIO, 
    interestedTechniques: ['Meisner', 'Stanislavski', 'Chubbuck'],
    otherInterests: [ActorOtherInterest.AUTO_GRAVACAO, ActorOtherInterest.ESTRATEGIAS_CARREIRA],
    dateOfBirth: '1995-08-20', phone: '(11) 99999-1111', educationLevel: EducationLevel.COLLEGE_COMPLETE,
    formativeExperiences: 'Curso de Teatro Tablado. Workshop de Viewpoints com Fulano.', professionalExperiences: 'Peça "A Aurora da Minha Vida", curta "Entre Linhas".', whyJoinCena: 'Aprimorar self-tapes e receber feedbacks direcionados.',
    subscriptionEndDate: generateFutureDate(20), 
    isAutoRenew: true,
  },
  {
    id: 'user-tutor-01', email: 'tutor@cena.com', name: 'Prof. João Santos',
    roles: [{ id: 'rp3', userId: 'user-tutor-01', role: Role.TUTOR, createdAt: '2023-01-01T00:00:00Z' }],
    currentRole: Role.TUTOR, isApproved: false, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
    imageUrl: '/placeholder-images/profile-joao-tutor-50x50.jpg', 
    tutorApplicationStatus: TutorApplicationStatus.PENDING_REVIEW,
    educationLevel: EducationLevel.POST_GRADUATE,
    dateOfBirth: '1985-05-15',
    phone: '(21) 98888-2222', 
  },
  {
    id: 'user-guest-01', email: 'guest@cena.com', name: 'Visitante Curioso',
    roles: [{ id: 'rp4', userId: 'user-guest-01', role: Role.GUEST, createdAt: '2023-01-01T00:00:00Z' }],
    currentRole: Role.GUEST, isApproved: false, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
    imageUrl: '/placeholder-images/profile-guest-curioso-50x50.jpg' 
  },
  {
    id: 'user-tutor-02', email: 'tutor2@cena.com', name: 'Profa. Ana Lima',
    roles: [{ id: 'rp5', userId: 'user-tutor-02', role: Role.TUTOR, createdAt: '2023-01-01T00:00:00Z' }],
    currentRole: Role.TUTOR, isApproved: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
    imageUrl: '/placeholder-images/profile-ana-tutor-50x50.jpg', 
    tutorApplicationStatus: TutorApplicationStatus.APPROVED,
    educationLevel: EducationLevel.COLLEGE_COMPLETE,
    baseTechnique: 'Meisner',
    dateOfBirth: '1990-03-25',
    phone: '(31) 97777-3333',
    feedbacksSentCount: 15,
    actorsTutoredCount: 8,
  },
  {
    id: 'user-actor-02', email: 'carlos@cena.com', name: 'Carlos Pereira',
    roles: [{ id: 'rp6', userId: 'user-actor-02', role: Role.ACTOR, plan: Plan.PLUS, createdAt: '2021-06-20T10:00:00Z' }],
    currentRole: Role.ACTOR, activePlan: Plan.PLUS, billingCycle: BillingCycle.QUARTERLY, isApproved: false, createdAt: '2021-06-20T10:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
    imageUrl: '/placeholder-images/profile-carlos-actor-50x50.jpg', 
    subscriptionEndDate: generatePastDate(10), 
    isAutoRenew: false,
    actorLevel: ActorLevel.PROFISSIONAL_DRT,
    interestedTechniques: ['Viewpoints', 'Grotowski'],
  },
  {
    id: 'user-actor-03', email: 'beatriz@cena.com', name: 'Beatriz Costa',
    roles: [{ id: 'rp7', userId: 'user-actor-03', role: Role.ACTOR, plan: Plan.PRO, createdAt: '2023-11-05T10:00:00Z' }],
    currentRole: Role.ACTOR, activePlan: Plan.PRO, billingCycle: BillingCycle.ANNUAL, isApproved: false, createdAt: '2023-11-05T10:00:00Z', updatedAt: '2023-01-01T00:00:00Z',
    imageUrl: '/placeholder-images/profile-beatriz-actor-50x50.jpg', 
    subscriptionEndDate: generateFutureDate(300), 
    isAutoRenew: true,
    actorLevel: ActorLevel.PROFISSIONAL_EXPERIENTE_DRT,
    interestedTechniques: ['Meisner', 'Adler'],
  },
  {
    id: 'user-actor-04',
    clerkId: 'clerk-actor-04',
    email: 'pedro.silva@cena.com',
    name: 'Pedro Silva',
    roles: [{ id: 'rp-actor4', userId: 'user-actor-04', role: Role.ACTOR, plan: Plan.BASIC, createdAt: new Date().toISOString() }],
    currentRole: Role.ACTOR,
    activePlan: Plan.BASIC,
    billingCycle: BillingCycle.MONTHLY,
    isApproved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: '/placeholder-images/profile-pedro-actor-50x50.jpg', 
    subscriptionEndDate: generateFutureDate(5),
    isAutoRenew: true,
    actorLevel: ActorLevel.INICIJANTE,
    interestedTechniques: ['Stanislavski'],
  },
   {
    id: 'user-tutor-03',
    clerkId: 'clerk-tutor-03',
    email: 'ricardo.alves@cena.com',
    name: 'Prof. Ricardo Alves',
    roles: [{ id: 'rp-tutor3', userId: 'user-tutor-03', role: Role.TUTOR, createdAt: new Date().toISOString() }],
    currentRole: Role.TUTOR,
    isApproved: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: '/placeholder-images/profile-ricardo-tutor-50x50.jpg', 
    tutorApplicationStatus: TutorApplicationStatus.APPROVED,
  },
  {
    id: 'user-tutor-04',
    clerkId: 'clerk-tutor-04',
    email: 'sofia.mendes@cena.com',
    name: 'Profa. Sofia Mendes',
    roles: [{ id: 'rp-tutor4', userId: 'user-tutor-04', role: Role.TUTOR, createdAt: new Date().toISOString() }],
    currentRole: Role.TUTOR,
    isApproved: false, 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: '/placeholder-images/profile-sofia-tutor-50x50.jpg', 
    tutorApplicationStatus: TutorApplicationStatus.PENDING_REVIEW,
  }
];


interface UserManagementContextType {
  platformUsers: User[];
  getUserById: (userId: string) => User | undefined;
  updateUserInList: (updatedUser: User) => void;
  toggleUserApproval: (userId: string) => void;
  addTutorApplicationDetails: (tutorId: string, formData: TutorApplicationFormData, profileImageUrl?: string) => User | undefined;
  updateTutorApplicationStatus: (tutorId: string, status: TutorApplicationStatus) => void;
  countActorsAssignedToTutor: (tutorId: string) => number;
  updateUserProfile: (userId: string, formData: ActorProfileFormData | TutorApplicationFormData, profileImageUrl?: string) => User | undefined;
  addActorProfileDetails: (actorId: string, formData: ActorProfileFormData, profileImageUrl?: string) => User | undefined;
  addRegisteredUser: (newUser: User) => void; 
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const UserManagementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [platformUsers, setPlatformUsers] = useState<User[]>(() => {
    const storedUsers = localStorage.getItem('cena-platform-users');
    return storedUsers ? JSON.parse(storedUsers) : INITIAL_MOCK_USERS;
  });
  const { addNotification } = useNotifications(); 

  useEffect(() => {
    localStorage.setItem('cena-platform-users', JSON.stringify(platformUsers));
  }, [platformUsers]);

  const getUserById = (userId: string): User | undefined => {
    return platformUsers.find(u => u.id === userId);
  };

  const updateUserInList = (updatedUser: User) => {
    let finalUpdatedUser: User | null = null;
    setPlatformUsers(prevUsers =>
      prevUsers.map(u => {
        if (u.id === updatedUser.id) {
          finalUpdatedUser = { ...u, ...updatedUser, updatedAt: new Date().toISOString() };
          return finalUpdatedUser;
        }
        return u;
      })
    );
    return finalUpdatedUser || undefined; // Return the updated user or undefined if not found
  };
  
  const toggleUserApproval = (userId: string) => {
    const user = platformUsers.find(u => u.id === userId);
    if(user){
        const newApprovalStatus = !user.isApproved;
        const updatedUser = { ...user, isApproved: newApprovalStatus };
        updateUserInList(updatedUser);

        if (newApprovalStatus && (user.currentRole === Role.GUEST || user.currentRole === Role.ACTOR)) {
            addNotification(userId, {
                type: NotificationType.USER_APPROVED,
                title: 'Sua Conta foi Ativada!',
                message: `Parabéns! Seu acesso como ${ROLE_NAMES[user.currentRole]} foi concedido. Explore a plataforma!`,
                linkTo: user.currentRole === Role.ACTOR ? PATHS.ACTOR_EM_CENA : PATHS.DASHBOARD,
                iconName: 'CheckCircleIcon',
            });
        }
    }
  };

  const addTutorApplicationDetails = (tutorId: string, formData: TutorApplicationFormData, profileImageUrl?: string): User | undefined => {
    let finalUpdatedTutor: User | undefined = undefined;
    setPlatformUsers(prevUsers => {
      const newUsers = prevUsers.map(u => {
        if (u.id === tutorId && u.currentRole === Role.TUTOR) {
          finalUpdatedTutor = {
            ...u,
            name: formData.name,
            email: formData.email, 
            imageUrl: profileImageUrl || u.imageUrl,
            dateOfBirth: formData.dateOfBirth,
            phone: formData.phone,
            educationLevel: formData.educationLevel,
            socialMediaLinks: formData.socialMediaLinks,
            hasNoSocialMedia: formData.hasNoSocialMedia,
            formativeExperiences: formData.formativeExperiences,
            baseTechnique: formData.baseTechnique,
            otherTechnique: formData.otherTechnique,
            professionalExperiences: formData.professionalExperiences,
            whyJoinCena: formData.whyJoinCena,
            tutorApplicationStatus: u.tutorApplicationStatus || TutorApplicationStatus.PENDING_REVIEW, 
            updatedAt: new Date().toISOString(),
          };
          return finalUpdatedTutor;
        }
        return u;
      });
      return newUsers;
    });
    return finalUpdatedTutor;
  };

  const updateTutorApplicationStatus = (tutorId: string, status: TutorApplicationStatus) => {
    const tutor = platformUsers.find(u => u.id === tutorId);
    if (tutor) {
        const newIsApprovedForAppStatus = status === TutorApplicationStatus.APPROVED; 
        const updatedTutor = { ...tutor, tutorApplicationStatus: status, isApproved: newIsApprovedForAppStatus };
        updateUserInList(updatedTutor);
        
        if (status === TutorApplicationStatus.APPROVED) {
             addNotification(tutorId, {
                type: NotificationType.TUTOR_APP_APPROVED,
                title: 'Sua Candidatura de Tutor foi Aprovada!',
                message: 'Parabéns! Você agora tem acesso completo como tutor na plataforma CENA.',
                linkTo: PATHS.TUTOR_DASHBOARD,
                iconName: 'CheckCircleIcon',
            });
        } else if (status === TutorApplicationStatus.REJECTED) {
            addNotification(tutorId, {
                type: NotificationType.TUTOR_APP_REJECTED,
                title: 'Atualização sobre sua Candidatura de Tutor',
                message: 'Recebemos sua candidatura. No momento, não seguiremos com sua aprovação. Agradecemos o interesse.',
                linkTo: PATHS.MESSAGES, 
                iconName: 'XCircleIcon',
            });
        }
    }
  };

  const countActorsAssignedToTutor = (tutorId: string): number => {
    return platformUsers.filter(u => u.currentRole === Role.ACTOR && u.preferredTutorId === tutorId).length;
  };

  const updateUserProfile = (userId: string, formData: ActorProfileFormData | TutorApplicationFormData, profileImageUrl?: string): User | undefined => {
    let finalUpdatedUser: User | undefined = undefined;
    setPlatformUsers(prevUsers => {
      const newUsers = prevUsers.map(u => {
        if (u.id === userId) {
          finalUpdatedUser = {
            ...u,
            name: formData.name,
            imageUrl: profileImageUrl || u.imageUrl,
            dateOfBirth: formData.dateOfBirth,
            phone: formData.phone,
            educationLevel: formData.educationLevel,
            socialMediaLinks: formData.socialMediaLinks,
            hasNoSocialMedia: formData.hasNoSocialMedia,
            formativeExperiences: formData.formativeExperiences,
            professionalExperiences: formData.professionalExperiences,
            whyJoinCena: (formData as ActorProfileFormData).objectives || (formData as TutorApplicationFormData).whyJoinCena,
            ...(u.currentRole === Role.ACTOR && {
                actorLevel: (formData as ActorProfileFormData).actorLevel,
                interestedTechniques: (formData as ActorProfileFormData).interestedTechniques,
                otherInterests: (formData as ActorProfileFormData).otherInterests,
            }),
            ...(u.currentRole === Role.TUTOR && {
                baseTechnique: (formData as TutorApplicationFormData).baseTechnique,
                otherTechnique: (formData as TutorApplicationFormData).otherTechnique,
            }),
            updatedAt: new Date().toISOString(),
          };
          return finalUpdatedUser;
        }
        return u;
      });
      return newUsers;
    });
    return finalUpdatedUser;
  };
  
  const addActorProfileDetails = (actorId: string, formData: ActorProfileFormData, profileImageUrl?: string): User | undefined => {
    let finalUpdatedActor: User | undefined = undefined;
    // First, update the profile details and get the updated user
    const updatedUserWithProfile = updateUserProfile(actorId, formData, profileImageUrl);

    if (updatedUserWithProfile) {
      // Then, specifically set isApproved to true for this actor
      setPlatformUsers(prevUsers => {
        const newUsers = prevUsers.map(u => {
          if (u.id === actorId && u.currentRole === Role.ACTOR) {
            if (!u.isApproved) { // Check if approval state actually changes
              addNotification(actorId, {
                  type: NotificationType.USER_APPROVED,
                  title: 'Seu Perfil foi Completado e sua Conta Ativada!',
                  message: 'Parabéns! Seu perfil está completo e seu acesso à plataforma foi ativado. Explore a CENA!',
                  linkTo: PATHS.ACTOR_EM_CENA,
                  iconName: 'CheckCircleIcon',
              });
            }
            finalUpdatedActor = { ...u, ...updatedUserWithProfile, isApproved: true, updatedAt: new Date().toISOString() };
            return finalUpdatedActor;
          }
          return u;
        });
        return newUsers;
      });
    }
    return finalUpdatedActor || updatedUserWithProfile; // Return the most updated version
  };

  const addRegisteredUser = (newUser: User) => {
    setPlatformUsers(prevUsers => {
      if (prevUsers.some(u => u.id === newUser.id || u.email === newUser.email)) {
        return prevUsers; 
      }
      return [...prevUsers, newUser];
    });
  };

  return (
    <UserManagementContext.Provider value={{ 
        platformUsers, 
        getUserById, 
        updateUserInList, 
        toggleUserApproval, 
        addTutorApplicationDetails, 
        updateTutorApplicationStatus,
        countActorsAssignedToTutor,
        updateUserProfile,
        addActorProfileDetails,
        addRegisteredUser, 
    }}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const usePlatformUsers = (): UserManagementContextType => {
  const context = useContext(UserManagementContext);
  if (context === undefined) {
    throw new Error('usePlatformUsers must be used within a UserManagementProvider');
  }
  return context;
};
