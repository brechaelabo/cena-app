
export enum Role {
  ADMIN = 'ADMIN',
  TUTOR = 'TUTOR',
  ACTOR = 'ACTOR',
  GUEST = 'GUEST',
  VISITOR = 'VISITOR' 
}

export enum Plan {
  BASIC = 'BASIC',
  PLUS = 'PLUS',
  PRO = 'PRO'
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMIANNUAL = 'SEMIANNUAL',
  ANNUAL = 'ANNUAL'
}

export enum AddOnType {
  LIVE_FEEDBACK_UPGRADE = 'LIVE_FEEDBACK_UPGRADE',
  ONE_ON_ONE_SESSION = 'ONE_ON_ONE_SESSION'
}

export enum FeedbackMode {
  ASYNC = 'ASYNC',
  LIVE = 'LIVE'
}

export enum TutorApplicationStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  OBSERVATION = 'OBSERVATION',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum EducationLevel {
  HIGH_SCHOOL = 'HIGH_SCHOOL',
  COLLEGE_INCOMPLETE = 'COLLEGE_INCOMPLETE',
  COLLEGE_COMPLETE = 'COLLEGE_COMPLETE',
  POST_GRADUATE = 'POST_GRADUATE'
}

export enum ActorLevel {
  INICIJANTE = 'INICIJANTE',
  INTERMEDIARIO = 'INTERMEDIARIO',
  PROFISSIONAL_DRT = 'PROFISSIONAL_DRT',
  PROFISSIONAL_EXPERIENTE_DRT = 'PROFISSIONAL_EXPERIENTE_DRT',
}

export enum ActorOtherInterest {
  AUTO_GRAVACAO = 'AUTO_GRAVACAO',
  ESTRATEGIAS_CARREIRA = 'ESTRATEGIAS_CARREIRA',
  PRODUCAO_MATERIAL = 'PRODUCAO_MATERIAL',
}

export interface User {
  id: string;
  clerkId?: string;
  email: string;
  name?: string;
  imageUrl?: string;
  roles: RolePivot[];
  currentRole: Role;
  activePlan?: Plan;
  billingCycle?: BillingCycle; 
  isApproved?: boolean; 
  createdAt: string;
  updatedAt: string;
  preferredTutorId?: string | null;

  // Tutor specific profile fields (some can be reused by actors)
  dateOfBirth?: string;
  phone?: string;
  socialMediaLinks?: { platform: string; url: string }[];
  hasNoSocialMedia?: boolean;
  formativeExperiences?: string;
  baseTechnique?: string; // For Tutors
  otherTechnique?: string; // For Tutors if baseTechnique is 'Outra'
  professionalExperiences?: string;
  whyJoinCena?: string; // Could be "Objectives" for Actors
  tutorApplicationStatus?: TutorApplicationStatus; // Tutor specific
  educationLevel?: EducationLevel; 
  feedbacksSentCount?: number; // Mock stat for Tutors
  actorsTutoredCount?: number; // Mock stat for Tutors

  // Actor specific profile fields
  actorLevel?: ActorLevel;
  interestedTechniques?: string[]; // Array of technique names (from TECHNIQUE_OPTIONS)
  otherInterests?: ActorOtherInterest[];
  subscriptionEndDate?: string; 
  isAutoRenew?: boolean;      
}

export interface RolePivot {
  id: string;
  userId: string;
  role: Role;
  plan?: Plan;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: Plan;
  billingCycle: BillingCycle;
  stripeSubId?: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  createdAt: string;
  updatedAt: string;
}

export interface Theme {
  id: string;
  title: string;
  description: string;
  headerImageUrl?: string; 
  headerImageDataUrl?: string | null; 
  videoUrl?: string;
  pdfUrls: string[]; 
  month: number;
  year: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Submission {
  id: string;
  themeId: string;
  themeTitle?: string; 
  userId: string; 
  userName?: string; 
  userLevel?: ActorLevel; 
  tapeUrls: string[];
  feedbackMode: FeedbackMode;
  createdAt: string;
  addOnPurchaseId?: string;
  feedbackStatus?: 'PENDING' | 'COMPLETED'; 
  feedbackTutorName?: string; 
  feedbackId?: string; 
  assignedTutorId?: string | null; 
  assignedTutorImageUrl?: string; 
  deadlineTimestamp?: number; 
  _themeMonth?: number; 
  _themeYear?: number;  
  _renderKey?: number; 
}

export interface Feedback {
  id: string;
  submissionId: string; 
  tutorId: string;
  tutorName?: string;
  actorId: string; 
  actorName?: string;
  videoUrl: string; 
  transcript: string;
  liveAt?: string; 
  createdAt: string;
}

export interface FeedbackBrief {
  id: string;
  status: 'PENDING' | 'COMPLETED';
  tutorName?: string;
}

export interface AddOnPurchase {
  id: string;
  userId: string;
  type: AddOnType;
  redeemed: boolean;
  targetSubmissionId?: string;
  createdAt: string;
}

export interface PlanDetails {
  id: Plan;
  name: string;
  priceMonthly: number;
  selftapesPerMonth: number;
  feedbacksPerMonth: number;
  freeTextSubmissions: number;
  features: string[];
  discounts?: { cycle: BillingCycle, discount: string, freeUpgrades?: number }[];
}

export interface PricingInfo {
  plans: PlanDetails[];
  addOns: {
    liveFeedback: { price: number; description:string };
    oneOnOneSession: { price: number; description: string };
  };
}

export type ThemeFormData = Omit<Theme, 'id' | 'createdAt' | 'updatedAt' | 'active' | 'headerImageDataUrl' | 'pdfUrls'> & {
  active?: boolean;
  headerImageFile?: File | null; 
  headerImageDataUrl?: string | null; 
  pdfFiles?: (File | null)[]; 
  pdfUrls?: string[]; 
};

export type SubmissionFormData = {
  tapeUrls: string[];
};

export type SubmissionCreateData = {
  themeId: string;
  userId: string; 
  tapeUrls: string[];
  feedbackMode: FeedbackMode;
  addOnPurchaseId?: string;
};


export type FeedbackCreateData = {
    submissionId: string;
    tutorId: string;
    actorId: string;
    videoUrl: string;
    transcript: string;
    liveAt?: string;
};


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export enum EventAudienceType {
  ALL = 'ALL', // Todos os usuários (incluindo visitantes não logados)
  SUBSCRIBERS = 'SUBSCRIBERS', // Todos os assinantes (Basic, Plus, Pro) e equipe
  PLUS_PRO = 'PLUS_PRO', // Assinantes Plus, Pro e equipe
  PRO_ONLY = 'PRO_ONLY' // Apenas assinantes Pro e equipe
}

export interface LivePublicEvent {
  id: string;
  title: string;
  description: string;
  meetLink: string;
  isActive: boolean;
  scheduledAt?: string; 
  scheduledEndTime?: string; 
  audienceType?: EventAudienceType; // Novo campo
  updatedAt: string;
  updatedBy: string; 
}

export interface ScheduledSession {
  id: string;
  tutorId: string;
  tutorName?: string;
  actorId: string;
  actorName?: string;
  meetLink: string;
  scheduledAt: string;
  notes?: string; 
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED';
  createdAt: string;
  updatedAt: string;
}

export type ScheduledSessionCreateData = Omit<ScheduledSession, 'id' | 'createdAt' | 'updatedAt' | 'tutorName' | 'actorName'>;
export type LivePublicEventUpdateData = Partial<Omit<LivePublicEvent, 'id' | 'updatedAt' | 'updatedBy'>> & { id?: string; audienceType?: EventAudienceType; };
export type LivePublicEventCreateData = Omit<LivePublicEvent, 'id' | 'updatedAt' | 'updatedBy' | 'audienceType'> & { audienceType: EventAudienceType; };


export type TutorApplicationFormData = {
  name: string;
  email: string;
  profileImageFile?: File | null;
  dateOfBirth?: string;
  phone?: string;
  educationLevel?: EducationLevel; 
  socialMediaLinks?: { platform: string; url: string }[];
  hasNoSocialMedia?: boolean;
  formativeExperiences?: string;
  baseTechnique?: string;
  otherTechnique?: string;
  professionalExperiences?: string;
  whyJoinCena?: string;
};

export type ActorProfileFormData = {
  name: string; 
  email: string; 
  profileImageFile?: File | null;
  dateOfBirth?: string;
  phone?: string;
  educationLevel?: EducationLevel; 
  socialMediaLinks?: { platform: string; url: string }[];
  hasNoSocialMedia?: boolean;
  formativeExperiences?: string;
  professionalExperiences?: string;
  objectives?: string; 
  actorLevel?: ActorLevel;
  interestedTechniques?: string[];
  otherInterests?: ActorOtherInterest[];
};

// Types for "Percursos" (Courses)
export enum CourseType {
  LIVE_ONLINE = 'LIVE_ONLINE',
  LIVE_PRESENTIAL = 'LIVE_PRESENTIAL',
  PRE_RECORDED = 'PRE_RECORDED',
}

export const COURSE_TYPE_NAMES: Record<CourseType, string> = {
  [CourseType.LIVE_ONLINE]: 'Ao Vivo (Online)',
  [CourseType.LIVE_PRESENTIAL]: 'Ao Vivo (Presencial)',
  [CourseType.PRE_RECORDED]: 'Gravado',
};

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string; 
  type: CourseType;
  location?: string; 
  scheduledAt?: string; 
  duration?: string; 
  price: number;
  installments?: number; // Número de parcelas
  materials?: string[]; 
  meetLink?: string; 
  imageUrl?: string; 
  imageDataUrl?: string | null; 
  isPublished: boolean; 
  createdAt: string;
  updatedAt: string;
  slug: string; // For unique URL generation
}

export type CourseFormData = Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'imageDataUrl' | 'slug'> & {
  imageFile?: File | null;
  imageDataUrl?: string | null;
};

// Types for "Sessões 1:1" (One-on-One Sessions)
export interface SessaoCategoria {
  id: string;
  slug: string;
  title: string;
  description: string; // Short description for listing
  longDescription: string; // Detailed description for detail page
  iconName?: string; // e.g., "BookOpenIcon" - maps to an icon component
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SessaoCategoriaFormData = Omit<SessaoCategoria, 'id' | 'createdAt' | 'updatedAt' | 'slug'>;

// Notification System Types
export enum NotificationType {
  NEW_THEME = 'NEW_THEME',
  SUBMISSION_CONFIRMED = 'SUBMISSION_CONFIRMED',
  FEEDBACK_READY = 'FEEDBACK_READY',
  SESSION_SCHEDULED_ACTOR = 'SESSION_SCHEDULED_ACTOR', // For actor when tutor schedules
  SESSION_REQUESTED_TUTOR = 'SESSION_REQUESTED_TUTOR', // For tutor when actor requests (if flow exists)
  SESSION_CANCELED_TUTOR = 'SESSION_CANCELED_TUTOR', // For actor when tutor cancels
  SESSION_CANCELED_ACTOR = 'SESSION_CANCELED_ACTOR',   // For tutor when actor cancels (if flow exists)
  NEW_COURSE = 'NEW_COURSE',
  NEW_EVENT = 'NEW_EVENT', // Public live event
  USER_APPROVED = 'USER_APPROVED', // For Guest/Tutor
  TUTOR_APP_APPROVED = 'TUTOR_APP_APPROVED',
  TUTOR_APP_REJECTED = 'TUTOR_APP_REJECTED',
  GENERAL_INFO = 'GENERAL_INFO',
}

export interface Notification {
  id: string;
  userId: string; 
  type: NotificationType;
  title: string;
  message: string;
  linkTo?: string; 
  iconName?: string; 
  createdAt: string; 
  isRead: boolean;
}

export type NotificationCreationData = {
  type: NotificationType;
  title: string;
  message: string;
  linkTo?: string;
  iconName?: string;
};

// Enum for Admin Notification Filter by Subscription Status
export enum SubscriptionStatusFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
}

// Landing Page Content Types (for current LandingPage.tsx structure)
export interface HeroContentLP {
  title: string; // "Eleve sua Atuação com {APP_NAME}"
  subtitle: string; // "Plataforma de prática contínua..."
  ctaButton1Text: string; // "Comece Agora"
  ctaButton2Text: string; // "Ver Planos"
}

export interface FeatureItemLP {
  id: string; // e.g., 'pratica-constante'
  title: string;
  description: string;
  // Icon is fixed in LandingPage.tsx for simplicity with current request
}

export interface PricingPreviewLP {
  sectionTitle: string; // "Nossos Planos"
  // Plan details are from PRICING_INFO
  viewAllPlansButtonText: string; // "Ver todos os planos e Add-ons"
}

export interface FinalCTAContentLP {
  title: string; // "Pronto para dar o próximo passo..."
  subtitle: string; // "Junte-se à {APP_NAME}..."
  buttonText: string; // "Criar minha Conta"
}

export interface LandingPageContent {
  hero: HeroContentLP;
  featuresSectionTitle: string; // "Por que escolher {APP_NAME}?"
  featureItems: FeatureItemLP[];
  pricingPreview: PricingPreviewLP;
  finalCTA: FinalCTAContentLP;
  footerCopyrightTextTemplate: string; // "© {YEAR} {APP_NAME}. Todos os direitos reservados."
}

// Sidebar Management Types
export interface SidebarNavItemConfig {
  id: string; // Unique identifier, typically the path
  name: string;
  title?: string; // Optional display title, e.g., for tooltips when sidebar is collapsed
  iconName: string; // Name of the icon component (e.g., 'HomeIcon')
  path: string;
  defaultOrder: number; // Original order for reset purposes
  currentOrder: number; // Current order, managed by admin
  isVisible: boolean;
  isDisabled: boolean;
  originalRoles: Role[]; // Roles this item originally belonged to
  isDynamic?: boolean; // True if path contains params like :slug or :themeId
  exact?: boolean; // For NavLink `end` prop
  notificationPath?: string; // Path that this item's notification count might depend on (e.g. MESSAGES for BellIcon)
}

export type SidebarRoleConfig = Record<Role, SidebarNavItemConfig[]>;