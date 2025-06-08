
import { Plan, PlanDetails, PricingInfo, Role, BillingCycle, AddOnType, TutorApplicationStatus, EducationLevel, ActorLevel, ActorOtherInterest, EventAudienceType, SubscriptionStatusFilter, SidebarNavItemConfig } from './types';

export const APP_NAME = "CENA";
export const CENA_WHATSAPP_NUMBER = "552134964734"; // Corrected WhatsApp Number (digits only)

export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRICING: '/pricing',
  DASHBOARD: '/dashboard', // General dashboard, specific roles might redirect
  PENDING_APPROVAL: '/pending-approval', 
  CURRENT_THEME: '/theme/current', 
  LIVE_SESSIONS: '/live-sessions', 
  MESSAGES: '/messages', // New path for general messages/notifications
  
  // Percursos (Courses)
  PERCURSOS_ACTOR: '/percursos',
  COURSE_DETAIL: '/percursos/:slug', 

  // Sessões 1:1
  SESSOES_ACTOR_LISTING: '/sessoes-1-1', 
  SESSOES_ACTOR_CATEGORY_DETAIL: '/sessoes-1-1/:categorySlug', 
  SESSÕES_ACTOR_PLACEHOLDER: '/sessoes-1-1/em-breve',


  // Actor specific
  ACTOR_EM_CENA: '/actor/em-cena', // New actor landing page
  // ACTOR_MESSAGES path removed, now uses general PATHS.MESSAGES
  ACTOR_SUBMIT_TAPE: '/actor/submit/:themeId',
  ACTOR_VIEW_FEEDBACK: '/actor/feedback/:submissionId',
  ACTOR_PROFILE_FORM: '/actor/profile/edit', 
  
  // Tutor specific
  TUTOR_DASHBOARD: '/tutor/dashboard',
  TUTOR_REVIEW_SUBMISSIONS: '/tutor/submissions',
  TUTOR_GIVE_FEEDBACK: '/tutor/feedback/:submissionId',
  TUTOR_COMPLETED_FEEDBACKS: '/tutor/feedbacks/completed',
  TUTOR_APPLICATION_FORM: '/tutor/apply', 
  TUTOR_PROFILE_PAGE: '/tutor/profile/:tutorId', 
  TUTOR_PROFILE_EDIT_FORM: '/tutor/profile/edit', 
  
  // Admin specific
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_MANAGE_THEMES: '/admin/themes',
  ADMIN_CREATE_THEME: '/admin/themes/new',
  ADMIN_EDIT_THEME: '/admin/themes/edit/:themeId',
  ADMIN_MANAGE_USERS: '/admin/users',
  ADMIN_MANAGE_TUTORS: '/admin/tutors', 
  ADMIN_ASSIGN_SUBMISSIONS: '/admin/assign-submissions', 
  ADMIN_TUTOR_REVIEW_APP: '/admin/tutors/review/:tutorId', 
  ADMIN_ACTOR_REVIEW: '/admin/actors/review/:actorId', 
  ADMIN_PROFILE_PAGE: '/admin/profile',
  ADMIN_MANAGE_PERCURSOS: '/admin/percursos',
  ADMIN_CREATE_PERCURSO: '/admin/percursos/new',
  ADMIN_EDIT_PERCURSO: '/admin/percursos/edit/:percursoId',
  ADMIN_MANAGE_SESSOES: '/admin/sessoes-1-1', 
  ADMIN_CREATE_SESSAO_CATEGORIA: '/admin/sessoes-1-1/new', 
  ADMIN_EDIT_SESSAO_CATEGORIA: '/admin/sessoes-1-1/edit/:categoryId', 
  ADMIN_MANAGE_LANDING_PAGE: '/admin/manage-landing-page',
  ADMIN_MANAGE_SIDEBARS: '/admin/manage-sidebars', // New Path

  // Guest specific
  GUEST_AREA: '/guest/area', 
  GUEST_PROFILE_PAGE: '/guest/profile',
  NOT_FOUND: '/404'
};

export const ROLE_NAMES: Record<Role | TutorApplicationStatus, string> = {
  [Role.ADMIN]: 'Administrador',
  [Role.TUTOR]: 'Tutor(a)',
  [Role.ACTOR]: 'Ator/Atriz',
  [Role.GUEST]: 'Convidado(a)',
  [Role.VISITOR]: 'Visitante',
  [TutorApplicationStatus.PENDING_REVIEW]: 'Em Avaliação',
  [TutorApplicationStatus.OBSERVATION]: 'Em Observação',
  [TutorApplicationStatus.APPROVED]: 'Aprovado', 
  [TutorApplicationStatus.REJECTED]: 'Rejeitado', 
};

export const EDUCATION_LEVEL_NAMES: Record<EducationLevel, string> = {
  [EducationLevel.HIGH_SCHOOL]: 'Ensino Médio Completo',
  [EducationLevel.COLLEGE_INCOMPLETE]: 'Superior Incompleto',
  [EducationLevel.COLLEGE_COMPLETE]: 'Superior Completo',
  [EducationLevel.POST_GRADUATE]: 'Pós-graduação',
};

export const ACTOR_LEVEL_NAMES: Record<ActorLevel, string> = {
  [ActorLevel.INICIJANTE]: 'Iniciante',
  [ActorLevel.INTERMEDIARIO]: 'Intermediário',
  [ActorLevel.PROFISSIONAL_DRT]: 'Profissional (com DRT)',
  [ActorLevel.PROFISSIONAL_EXPERIENTE_DRT]: 'Profissional Experiente (com DRT)',
};

export const ACTOR_OTHER_INTEREST_OPTIONS: { id: ActorOtherInterest, label: string }[] = [
  { id: ActorOtherInterest.AUTO_GRAVACAO, label: 'Técnicas de Auto-gravação' },
  { id: ActorOtherInterest.ESTRATEGIAS_CARREIRA, label: 'Estratégias de Carreira' },
  { id: ActorOtherInterest.PRODUCAO_MATERIAL, label: 'Produção de Material Profissional (Reel, etc.)' },
];


export const TECHNIQUE_OPTIONS: string[] = [
  'Adler', 'Boal', 'Bogart', 'Chekhov', 'Chubbuck', 'Experimental', 'Grotowski', 'Guskin', 'Hagen', 'Híbrida', 'Johnstone', 'Meisner', 'Outra', 'Practical Aesthetics', 'Spolin', 'Stanislavski', 'Strasberg'
].sort();


// MOCK_ASSETS_URL removed as picsum.photos placeholders are being replaced with descriptive paths.

export const PLAN_DETAILS_MAP: Record<Plan, PlanDetails> = {
  [Plan.BASIC]: {
    id: Plan.BASIC,
    name: "Básico",
    priceMonthly: 97,
    selftapesPerMonth: 1,
    feedbacksPerMonth: 1,
    freeTextSubmissions: 0,
    features: [
      "1 self-tape por tema",
      "1 feedback em vídeo assíncrono",
      "Acesso completo ao material do tema (PDFs, vídeo do host)",
      "Histórico de feedbacks"
    ],
  },
  [Plan.PLUS]: {
    id: Plan.PLUS,
    name: "Plus",
    priceMonthly: 167,
    selftapesPerMonth: 3,
    feedbacksPerMonth: 3,
    freeTextSubmissions: 1,
    features: [
      "Até 3 self-tapes por tema",
      "1 envio com texto livre",
      "3 feedbacks em vídeo assíncronos",
      "Participação em alguns eventos ao vivo",
      "Descontos de 15% em mentorias"
    ],
  },
  [Plan.PRO]: {
    id: Plan.PRO,
    name: "Pro",
    priceMonthly: 247,
    selftapesPerMonth: 5,
    feedbacksPerMonth: 5,
    freeTextSubmissions: 2,
    features: [
      "Até 5 self-tapes por tema",
      "2 envios com texto livre",
      "5 feedbacks em vídeo assíncronos",
      "Acesso antecipado ao tema do mês seguinte",
      "Pode sugerir temas futuros",
      "Participação em todos os eventos com prioridade de perguntas",
      "Descontos de 20% em mentorias, serviços e oficinas presenciais",
      "Prioridade de vagas em eventos com participação limitada"
    ],
  },
};

export const PRICING_INFO: PricingInfo = {
  plans: [PLAN_DETAILS_MAP.BASIC, PLAN_DETAILS_MAP.PLUS, PLAN_DETAILS_MAP.PRO],
  addOns: {
    liveFeedback: { price: 70, description: "Upgrade Feedback Ao Vivo" },
    oneOnOneSession: { price: 150, description: "Sessão 1:1 Avulsa" },
  }
};

export const BILLING_CYCLE_NAMES: Record<BillingCycle, string> = {
  [BillingCycle.MONTHLY]: 'Mensal',
  [BillingCycle.QUARTERLY]: 'Trimestral',
  [BillingCycle.SEMIANNUAL]: 'Semestral',
  [BillingCycle.ANNUAL]: 'Anual',
};

export const BILLING_CYCLE_DISCOUNTS_DETAILS: Record<BillingCycle, { label: string; discountRate: number; freeUpgrades: number }> = {
  [BillingCycle.MONTHLY]: { label: 'Mensal', discountRate: 0, freeUpgrades: 0 },
  [BillingCycle.QUARTERLY]: { label: 'Trimestral (5% OFF)', discountRate: 0.05, freeUpgrades: 0 },
  [BillingCycle.SEMIANNUAL]: { label: 'Semestral (10% OFF)', discountRate: 0.10, freeUpgrades: 1 },
  [BillingCycle.ANNUAL]: { label: 'Anual (15% OFF)', discountRate: 0.15, freeUpgrades: 2 },
};

export const EVENT_AUDIENCE_TYPE_NAMES: Record<EventAudienceType, string> = {
  [EventAudienceType.ALL]: 'Todos',
  [EventAudienceType.SUBSCRIBERS]: 'Assinantes',
  [EventAudienceType.PLUS_PRO]: 'Assinantes Plus e Pro',
  [EventAudienceType.PRO_ONLY]: 'Assinantes Pro',
};


export const SIDEBAR_WIDTH_OPEN = 'w-64'; 
export const SIDEBAR_WIDTH_CLOSED = 'lg:w-20';

export const SUBSCRIPTION_STATUS_FILTER_NAMES: Record<SubscriptionStatusFilter, string> = {
  [SubscriptionStatusFilter.ALL]: 'Todas (Ativas e Expiradas)',
  [SubscriptionStatusFilter.ACTIVE]: 'Apenas Ativas',
  [SubscriptionStatusFilter.EXPIRED]: 'Apenas Expiradas',
};

// Master list of all potential navigation items for sidebar configuration
// NOTA: Esta constante MASTER_NAV_ITEMS define a estrutura padrão e as propriedades
// (nome, ícone, ordem padrão, papéis originais) dos itens da sidebar.
// O SidebarConfigContext usa esta lista para gerar a configuração inicial da sidebar
// para cada papel, caso nenhuma configuração personalizada seja encontrada no localStorage.
// Se você modificar os valores aqui (ex: defaultOrder, name, iconName), essas
// alterações se tornarão o novo padrão "lembrado pelo código" quando o localStorage
// estiver vazio ou para novos usuários.
export const MASTER_NAV_ITEMS: Omit<SidebarNavItemConfig, 'currentOrder' | 'isVisible' | 'isDisabled'>[] = [
  // Actor Specific (will be filtered by role in context initialization)
  { id: PATHS.ACTOR_EM_CENA, name: 'Em Cena', iconName: 'HomeIcon', path: PATHS.ACTOR_EM_CENA, defaultOrder: 1, originalRoles: [Role.ACTOR], exact: true },
  { id: PATHS.CURRENT_THEME, name: 'Tema do Mês', iconName: 'SquaresPlusIcon', path: PATHS.CURRENT_THEME, defaultOrder: 2, originalRoles: [Role.ACTOR, Role.GUEST], exact: true },
  { id: PATHS.ACTOR_SUBMIT_TAPE, name: 'Enviar Self-tape', iconName: 'VideoCameraIcon', path: PATHS.ACTOR_SUBMIT_TAPE.replace(':themeId', 'current'), defaultOrder: 3, originalRoles: [Role.ACTOR], isDynamic: true },
  { id: PATHS.ACTOR_VIEW_FEEDBACK, name: 'Meus Feedbacks', iconName: 'ClipboardCheckIcon', path: PATHS.ACTOR_VIEW_FEEDBACK.replace(':submissionId', 'all'), defaultOrder: 4, originalRoles: [Role.ACTOR], isDynamic: true },
  { id: PATHS.SESSOES_ACTOR_LISTING, name: 'Sessões 1:1', iconName: 'UserGroupIcon', path: PATHS.SESSOES_ACTOR_LISTING, defaultOrder: 5, originalRoles: [Role.ACTOR], title: 'Sessões Individuais Personalizadas' },
  { id: PATHS.PERCURSOS_ACTOR, name: 'Percursos', iconName: 'BookOpenIcon', path: PATHS.PERCURSOS_ACTOR, defaultOrder: 6, originalRoles: [Role.ACTOR, Role.GUEST], title: 'Nossos cursos e workshops' },
  { id: PATHS.SESSÕES_ACTOR_PLACEHOLDER, name: 'Percursos (Em Breve)', iconName: 'LockClosedIcon', path: PATHS.SESSÕES_ACTOR_PLACEHOLDER, defaultOrder: 6, originalRoles: [Role.ACTOR, Role.GUEST], title: 'Percursos (Em Breve)' }, // Alternative for Percursos if disabled
  { id: PATHS.LIVE_SESSIONS, name: 'Ao Vivo', iconName: 'LiveIndicatorIcon', path: PATHS.LIVE_SESSIONS, defaultOrder: 7, originalRoles: [Role.ACTOR, Role.TUTOR, Role.GUEST, Role.ADMIN] },
  { id: PATHS.MESSAGES, name: 'Mensagens', iconName: 'BellIcon', path: PATHS.MESSAGES, defaultOrder: 8, originalRoles: [Role.ACTOR, Role.TUTOR, Role.GUEST, Role.ADMIN], notificationPath: PATHS.MESSAGES },
  { id: PATHS.ACTOR_PROFILE_FORM, name: 'Meu Perfil', iconName: 'UserIcon', path: PATHS.ACTOR_PROFILE_FORM, defaultOrder: 9, originalRoles: [Role.ACTOR] },

  // Tutor Specific
  { id: PATHS.TUTOR_DASHBOARD, name: 'Painel Tutor', iconName: 'HomeIcon', path: PATHS.TUTOR_DASHBOARD, defaultOrder: 1, originalRoles: [Role.TUTOR], exact: true },
  { id: PATHS.TUTOR_REVIEW_SUBMISSIONS, name: 'Envios', iconName: 'InboxArrowDownIcon', path: PATHS.TUTOR_REVIEW_SUBMISSIONS, defaultOrder: 2, originalRoles: [Role.TUTOR] },
  { id: PATHS.TUTOR_COMPLETED_FEEDBACKS, name: 'Feedbacks Concluídos', iconName: 'ClipboardCheckIcon', path: PATHS.TUTOR_COMPLETED_FEEDBACKS, defaultOrder: 3, originalRoles: [Role.TUTOR] },
  // Live Sessions and Messages are common, already listed above. Default orders 7 and 8 apply.
  { id: PATHS.TUTOR_PROFILE_EDIT_FORM, name: 'Meu Perfil', iconName: 'UserIcon', path: PATHS.TUTOR_PROFILE_EDIT_FORM, defaultOrder: 9, originalRoles: [Role.TUTOR] }, // Updated defaultOrder

  // Admin Specific
  { id: PATHS.ADMIN_DASHBOARD, name: 'Painel Admin', iconName: 'CogIcon', path: PATHS.ADMIN_DASHBOARD, defaultOrder: 1, originalRoles: [Role.ADMIN], exact: true },
  { id: PATHS.ADMIN_MANAGE_THEMES, name: 'Temas', iconName: 'SquaresPlusIcon', path: PATHS.ADMIN_MANAGE_THEMES, defaultOrder: 2, originalRoles: [Role.ADMIN] },
  { id: PATHS.ADMIN_MANAGE_PERCURSOS, name: 'Percursos', iconName: 'BookOpenIcon', path: PATHS.ADMIN_MANAGE_PERCURSOS, defaultOrder: 3, originalRoles: [Role.ADMIN] },
  { id: PATHS.ADMIN_MANAGE_SESSOES, name: 'Sessões 1:1', iconName: 'UserGroupIcon', path: PATHS.ADMIN_MANAGE_SESSOES, defaultOrder: 4, originalRoles: [Role.ADMIN] },
  { id: PATHS.ADMIN_MANAGE_LANDING_PAGE, name: 'Landing Page', iconName: 'CogIcon', path: PATHS.ADMIN_MANAGE_LANDING_PAGE, defaultOrder: 5, originalRoles: [Role.ADMIN] },
  { id: PATHS.ADMIN_MANAGE_USERS, name: 'Usuários', iconName: 'UserGroupIcon', path: PATHS.ADMIN_MANAGE_USERS, defaultOrder: 6, originalRoles: [Role.ADMIN] },
  { id: PATHS.ADMIN_MANAGE_TUTORS, name: 'Tutores', iconName: 'AcademicCapIcon', path: PATHS.ADMIN_MANAGE_TUTORS, defaultOrder: 7, originalRoles: [Role.ADMIN] },
  { id: PATHS.ADMIN_ASSIGN_SUBMISSIONS, name: 'Atribuição Envios', iconName: 'ClipboardDocumentListIcon', path: PATHS.ADMIN_ASSIGN_SUBMISSIONS, defaultOrder: 8, originalRoles: [Role.ADMIN] },
  { id: PATHS.ADMIN_MANAGE_SIDEBARS, name: 'Menus Laterais', iconName: 'MenuIcon', path: PATHS.ADMIN_MANAGE_SIDEBARS, defaultOrder: 9, originalRoles: [Role.ADMIN]}, 
  // Live Sessions and Messages are common, already listed above for Admin. Default orders 7 and 8 apply.
  { id: PATHS.ADMIN_PROFILE_PAGE, name: 'Meu Perfil', iconName: 'UserIcon', path: PATHS.ADMIN_PROFILE_PAGE, defaultOrder: 10, originalRoles: [Role.ADMIN] },

  // Guest Specific
  // Current Theme, Percursos, Live Sessions, Messages are common, already listed above for Guest. Default orders 2, 6, 7, 8 apply.
  { id: PATHS.GUEST_PROFILE_PAGE, name: 'Meu Perfil', iconName: 'UserIcon', path: PATHS.GUEST_PROFILE_PAGE, defaultOrder: 3, originalRoles: [Role.GUEST] },
];
