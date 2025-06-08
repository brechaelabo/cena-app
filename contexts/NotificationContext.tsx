
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Notification, NotificationType, Role, User, NotificationCreationData } from '../types'; // Added NotificationCreationData
import { PATHS } from '../constants';
// Removed: import { usePlatformUsers } from './UserManagementContext'; 

const MOCK_INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    userId: 'user-actor-01', // Mariana Almeida
    type: NotificationType.NEW_THEME,
    title: 'Novo Tema do Mês Disponível!',
    message: "O tema 'Monólogo Clássico Reinventado' já está disponível. Explore os materiais e prepare sua self-tape!",
    linkTo: PATHS.CURRENT_THEME,
    iconName: 'MenuIcon',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
  },
  {
    id: 'notif-002',
    userId: 'user-actor-01', // Mariana Almeida
    type: NotificationType.FEEDBACK_READY,
    title: 'Seu Feedback Chegou!',
    message: "O feedback para sua self-tape do tema 'A Jornada do Herói' está pronto. Confira!",
    linkTo: PATHS.ACTOR_VIEW_FEEDBACK.replace(':submissionId', 'mocksub-001'),
    iconName: 'ClipboardCheckIcon',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 'notif-003',
    userId: 'user-tutor-01', // Prof. João Santos
    type: NotificationType.USER_APPROVED,
    title: 'Sua Conta foi Aprovada!',
    message: "Parabéns! Seu cadastro como tutor foi aprovado. Você já pode acessar todas as funcionalidades da plataforma.",
    linkTo: PATHS.TUTOR_DASHBOARD,
    iconName: 'CheckCircleIcon',
    createdAt: new Date().toISOString(),
    isRead: false,
  },
];

interface NotificationContextType {
  notifications: Notification[];
  getNotificationsForUser: (userId: string) => Notification[];
  addNotification: (
    targetUserIds: string | string[], 
    notificationData: NotificationCreationData // Changed to NotificationCreationData
  ) => void;
  markAsRead: (notificationId: string, userId: string) => void;
  markAllAsRead: (userId: string) => void;
  getUnreadNotificationCount: (userId: string) => number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const storedNotifications = localStorage.getItem('cena-notifications');
    return storedNotifications ? JSON.parse(storedNotifications) : MOCK_INITIAL_NOTIFICATIONS;
  });
  
  // Removed: const { platformUsers } = usePlatformUsers(); 

  useEffect(() => {
    localStorage.setItem('cena-notifications', JSON.stringify(notifications));
  }, [notifications]);

  const getNotificationsForUser = (userId: string): Notification[] => {
    return notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1; // Unread first
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Then by date descending
      });
  };

  const addNotification = (
    targetUserIds: string | string[], 
    notificationData: NotificationCreationData // Changed to NotificationCreationData
  ) => {
    const newNotificationBase = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    let finalTargetIds: string[] = [];

    if (Array.isArray(targetUserIds)) {
      finalTargetIds = targetUserIds;
    } else {
      finalTargetIds = [targetUserIds];
    }
    
    const newNotifications: Notification[] = finalTargetIds.map(uid => ({
        ...newNotificationBase,
        id: `${newNotificationBase.id}-${uid}`, 
        userId: uid,
    }));

    setNotifications(prev => [...prev, ...newNotifications]);
  };

  const markAsRead = (notificationId: string, userId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId && n.userId === userId ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = (userId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.userId === userId ? { ...n, isRead: true } : n))
    );
  };

  const getUnreadNotificationCount = (userId: string): number => {
    return notifications.filter(n => n.userId === userId && !n.isRead).length;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        getNotificationsForUser,
        addNotification,
        markAsRead,
        markAllAsRead,
        getUnreadNotificationCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
