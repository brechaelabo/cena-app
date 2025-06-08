
import React, { useState, useEffect, useContext } from 'react'; 
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate as useRRDNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserManagementProvider } from './contexts/UserManagementContext';
import { SubmissionsProvider } from './contexts/SubmissionContext';
import { LiveSessionProvider } from './contexts/LiveSessionContext';
import { PercursosProvider } from './contexts/PercursosContext';
import { SessoesOneOnOneProvider } from './contexts/SessoesOneOnOneContext';
import { ToastProvider, useToasts } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext'; 
import { LandingPageProvider } from './contexts/LandingPageContext';
import { SidebarConfigProvider } from './contexts/SidebarConfigContext'; 
import { Toast } from './components/Common/Toast';
import { PATHS } from './constants';
import { Role } from './types';

import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { PageWrapper } from './components/Layout/PageWrapper';

// Page Components
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import DashboardPage from './pages/DashboardPage'; 
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageThemesPage from './pages/admin/ManageThemesPage';
import ThemeFormPage from './pages/admin/ThemeFormPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageTutorsPage from './pages/admin/ManageTutorsPage';
import AdminTutorReviewPage from './pages/admin/AdminTutorReviewPage';
import AdminActorReviewPage from './pages/admin/AdminActorReviewPage';
import AssignSubmissionsToTutorsPage from './pages/admin/AssignSubmissionsToTutorsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';
import ManagePercursosPage from './pages/admin/ManagePercursosPage';
import PercursoFormPage from './pages/admin/PercursoFormPage';
import AdminManageSessoesPage from './pages/admin/AdminManageSessoesPage';
import SessaoCategoriaFormPage from './pages/admin/SessaoCategoriaFormPage';
import ManageLandingPage from './pages/admin/ManageLandingPage'; 
import ManageSidebarsPage from './pages/admin/ManageSidebarsPage'; 

import EmCenaPage from './pages/actor/EmCenaPage';
import MessagesPage from './pages/common/MessagesPage'; 
import ActorSubmitTapePage from './pages/actor/ActorSubmitTapePage';
import ActorViewFeedbackPage from './pages/actor/ActorViewFeedbackPage'; // CORRECTED RELATIVE PATH
import ActorProfileFormPage from './pages/actor/ActorProfileFormPage';
import PercursosPage from './pages/actor/PercursosPage';
import CourseDetailPage from './pages/actor/CourseDetailPage';
import SessoesOneOnOneListingPage from './pages/actor/SessoesOneOnOneListingPage';
import SessaoOneOnOneCategoryPage from './pages/actor/SessaoOneOnOneCategoryPage';
import SessoesOneOnOnePlaceholderPage from './pages/actor/SessoesOneOnOnePlaceholderPage';

import TutorDashboard from './pages/tutor/TutorDashboard';
import TutorApplicationFormPage from './pages/tutor/TutorApplicationFormPage';
import TutorProfilePage from './pages/tutor/TutorProfilePage';
import TutorProfileEditFormPage from './pages/tutor/TutorProfileEditFormPage';
import TutorReviewSubmissionsPage from './pages/tutor/TutorReviewSubmissionsPage';
import TutorGiveFeedbackPage from './pages/tutor/TutorGiveFeedbackPage';
import TutorCompletedFeedbacksPage from './pages/tutor/TutorCompletedFeedbacksPage';

import CurrentThemePage from './pages/common/CurrentThemePage';
import LiveSessionsPage from './pages/common/LiveSessionsPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import GuestProfilePage from './pages/guest/GuestProfilePage';
import NotFoundPage from './pages/NotFoundPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl text-text-body">Carregando...</p></div>;
  }

  if (!user) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }
  
  // Primary redirection logic for onboarding is now in AppContent's useEffect.
  // This ProtectedRoute check for `!isApproved` can be simplified.
  // It ensures that if a user somehow bypasses AppContent's redirect (e.g. initial load on a protected route),
  // they are still handled, although AppContent's logic is more granular for onboarding.
  if (!user.isApproved) {
    const allowedPendingPaths = [
        PATHS.PENDING_APPROVAL,
        PATHS.ACTOR_PROFILE_FORM,
        PATHS.TUTOR_APPLICATION_FORM,
        // Add any other public or essential pages here if needed during pending state
        PATHS.LOGIN, PATHS.REGISTER, PATHS.HOME, PATHS.PRICING,
    ];
    if (!allowedPendingPaths.includes(location.pathname)) {
        // Generic fallback for unapproved users if AppContent's more specific redirects haven't caught them
        // For actors/tutors this will likely be re-redirected by AppContent to their specific form
        return <Navigate to={PATHS.PENDING_APPROVAL} state={{ from: location }} replace />;
    }
  }


  if (allowedRoles && !allowedRoles.includes(user.currentRole)) {
    return <Navigate to={user.currentRole === Role.ACTOR ? PATHS.ACTOR_EM_CENA : PATHS.DASHBOARD} replace />;
  }

  return <>{children}</>;
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToasts();
  return (
    <div className="fixed top-20 right-5 z-50 space-y-3">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const location = useLocation();
  const navigate = useRRDNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const publicPages = [
    PATHS.HOME, PATHS.PRICING, PATHS.LOGIN, PATHS.REGISTER,
    PATHS.SESSÕES_ACTOR_PLACEHOLDER 
  ];
  
  const onboardingFormPaths = [PATHS.ACTOR_PROFILE_FORM, PATHS.TUTOR_APPLICATION_FORM];
  const pendingApprovalPath = PATHS.PENDING_APPROVAL;

  useEffect(() => {
    if (!isLoading && user) {
      const currentPath = location.pathname;
      const isPublicOrOnboarding = 
        publicPages.includes(currentPath) || 
        onboardingFormPaths.includes(currentPath) || 
        currentPath === pendingApprovalPath;

      if (!user.isApproved && !isPublicOrOnboarding) {
        if (user.currentRole === Role.ACTOR) {
          navigate(PATHS.ACTOR_PROFILE_FORM, { replace: true });
        } else if (user.currentRole === Role.TUTOR) {
          if (!user.formativeExperiences || user.formativeExperiences.length === 0) {
            navigate(PATHS.TUTOR_APPLICATION_FORM, { replace: true });
          } else {
            navigate(PATHS.PENDING_APPROVAL, { replace: true });
          }
        } else if (user.currentRole === Role.GUEST) {
          navigate(PATHS.PENDING_APPROVAL, { replace: true });
        }
      }
    }
  }, [user, isLoading, location, navigate, publicPages, onboardingFormPaths, pendingApprovalPath]);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isInitialLoad = isLoading && !user;
  const allowedPathsDuringLoad = [...publicPages, ...onboardingFormPaths, pendingApprovalPath];

  if (isInitialLoad && !allowedPathsDuringLoad.includes(location.pathname)) {
     return <div className="flex justify-center items-center h-screen"><p className="text-xl text-text-body">Iniciando CENA...</p></div>;
  }

  const showLayout = user && 
                    !publicPages.includes(location.pathname) &&
                    !onboardingFormPaths.includes(location.pathname) &&
                    location.pathname !== pendingApprovalPath;


  return (
    <div className="flex flex-col min-h-screen">
      {showLayout && <Header toggleSidebar={toggleSidebar} />}
      {!showLayout && !publicPages.includes(location.pathname) && <Header toggleSidebar={() => {}} />}
      <ToastContainer />

      <div className="flex flex-1 pt-16">
        {showLayout && <Sidebar isOpen={sidebarOpen} />}

        <PageWrapper sidebarOpen={sidebarOpen} isPublicPage={!showLayout}>
          <Routes>
            <Route path={PATHS.HOME} element={<LandingPage />} />
            <Route path={PATHS.LOGIN} element={user && user.isApproved ? <Navigate to={PATHS.DASHBOARD} /> : <LoginPage />} />
            <Route path={PATHS.REGISTER} element={user && user.isApproved ? <Navigate to={PATHS.DASHBOARD} /> : <RegisterPage />} />
            <Route path={PATHS.PRICING} element={<PricingPage />} />

            <Route path={PATHS.PENDING_APPROVAL} element={<PendingApprovalPage />} />
            <Route path={PATHS.TUTOR_APPLICATION_FORM} element={<TutorApplicationFormPage />} />
            <Route path={PATHS.ACTOR_PROFILE_FORM} element={<ActorProfileFormPage />} /> 
            <Route path={PATHS.SESSÕES_ACTOR_PLACEHOLDER} element={<SessoesOneOnOnePlaceholderPage />} />


            <Route
              path={PATHS.DASHBOARD}
              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
             <Route
              path={PATHS.CURRENT_THEME}
              element={<ProtectedRoute allowedRoles={[Role.ACTOR, Role.GUEST]}><CurrentThemePage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.LIVE_SESSIONS}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.TUTOR, Role.ACTOR, Role.GUEST]}><LiveSessionsPage /></ProtectedRoute>}
            />
             <Route
              path={PATHS.MESSAGES} 
              element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.TUTOR, Role.ACTOR, Role.GUEST]}><MessagesPage /></ProtectedRoute>}
            />

            {/* Percursos Routes */}
            <Route
              path={PATHS.PERCURSOS_ACTOR}
              element={<ProtectedRoute allowedRoles={[Role.ACTOR, Role.GUEST]}><PercursosPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.COURSE_DETAIL}
              element={<ProtectedRoute allowedRoles={[Role.ACTOR, Role.GUEST]}><CourseDetailPage /></ProtectedRoute>}
            />

            {/* Sessões 1:1 Routes */}
            <Route
              path={PATHS.SESSOES_ACTOR_LISTING}
              element={<ProtectedRoute allowedRoles={[Role.ACTOR]}><SessoesOneOnOneListingPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.SESSOES_ACTOR_CATEGORY_DETAIL}
              element={<ProtectedRoute allowedRoles={[Role.ACTOR]}><SessaoOneOnOneCategoryPage /></ProtectedRoute>}
            />


            <Route
              path={PATHS.TUTOR_PROFILE_PAGE}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.TUTOR, Role.ACTOR, Role.GUEST]}><TutorProfilePage /></ProtectedRoute>}
            />
             <Route
              path={PATHS.TUTOR_PROFILE_EDIT_FORM}
              element={<ProtectedRoute allowedRoles={[Role.TUTOR]}><TutorProfileEditFormPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_PROFILE_PAGE}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminProfilePage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.GUEST_PROFILE_PAGE}
              element={<ProtectedRoute allowedRoles={[Role.GUEST]}><GuestProfilePage /></ProtectedRoute>}
            />

            {/* Admin Routes */}
            <Route
              path={PATHS.ADMIN_DASHBOARD}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_MANAGE_THEMES}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ManageThemesPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_CREATE_THEME}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ThemeFormPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_EDIT_THEME}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ThemeFormPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_MANAGE_USERS}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ManageUsersPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_MANAGE_TUTORS}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ManageTutorsPage /></ProtectedRoute>}
            />
             <Route
              path={PATHS.ADMIN_TUTOR_REVIEW_APP}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminTutorReviewPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_ACTOR_REVIEW}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminActorReviewPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_ASSIGN_SUBMISSIONS}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AssignSubmissionsToTutorsPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_MANAGE_PERCURSOS}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ManagePercursosPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_CREATE_PERCURSO}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><PercursoFormPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_EDIT_PERCURSO}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><PercursoFormPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_MANAGE_SESSOES}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><AdminManageSessoesPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_CREATE_SESSAO_CATEGORIA}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><SessaoCategoriaFormPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ADMIN_EDIT_SESSAO_CATEGORIA}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><SessaoCategoriaFormPage /></ProtectedRoute>}
            />
             <Route
              path={PATHS.ADMIN_MANAGE_LANDING_PAGE}
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ManageLandingPage /></ProtectedRoute>}
            />
             <Route
              path={PATHS.ADMIN_MANAGE_SIDEBARS} 
              element={<ProtectedRoute allowedRoles={[Role.ADMIN]}><ManageSidebarsPage /></ProtectedRoute>}
            />

            {/* Actor Routes */}
             <Route
              path={PATHS.ACTOR_EM_CENA}
              element={<ProtectedRoute allowedRoles={[Role.ACTOR]}><EmCenaPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ACTOR_SUBMIT_TAPE}
              element={<ProtectedRoute allowedRoles={[Role.ACTOR]}><ActorSubmitTapePage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.ACTOR_VIEW_FEEDBACK}
              element={<ProtectedRoute allowedRoles={[Role.ACTOR]}><ActorViewFeedbackPage /></ProtectedRoute>}
            />
            {/* ActorProfileFormPage route is now public for initial onboarding, but ProtectedRoute will apply for subsequent edits by logged-in actors if needed */}


            {/* Tutor Routes */}
            <Route
              path={PATHS.TUTOR_DASHBOARD}
              element={<ProtectedRoute allowedRoles={[Role.TUTOR]}><TutorDashboard /></ProtectedRoute>}
            />
            <Route
              path={PATHS.TUTOR_REVIEW_SUBMISSIONS}
              element={<ProtectedRoute allowedRoles={[Role.TUTOR]}><TutorReviewSubmissionsPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.TUTOR_GIVE_FEEDBACK}
              element={<ProtectedRoute allowedRoles={[Role.TUTOR]}><TutorGiveFeedbackPage /></ProtectedRoute>}
            />
            <Route
              path={PATHS.TUTOR_COMPLETED_FEEDBACKS}
              element={<ProtectedRoute allowedRoles={[Role.TUTOR]}><TutorCompletedFeedbacksPage /></ProtectedRoute>}
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </PageWrapper>
      </div>
      {showLayout && sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ToastProvider>
        <NotificationProvider>
          <UserManagementProvider>
            <AuthProvider>
              <ThemeProvider>
                <PercursosProvider>
                  <LiveSessionProvider>
                    <SubmissionsProvider>
                      <SidebarConfigProvider>
                        <SessoesOneOnOneProvider>
                          <LandingPageProvider>
                            <AppContent />
                          </LandingPageProvider>
                        </SessoesOneOnOneProvider>
                      </SidebarConfigProvider>
                    </SubmissionsProvider>
                  </LiveSessionProvider>
                </PercursosProvider>
              </ThemeProvider>
            </AuthProvider>
          </UserManagementProvider>
        </NotificationProvider>
      </ToastProvider>
    </HashRouter>
  );
};

export default App;
