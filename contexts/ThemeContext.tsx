
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Theme, NotificationType, Role, NotificationCreationData } from '../types'; 
import { PATHS } from '../constants'; // MOCK_ASSETS_URL removed
import { useNotifications } from './NotificationContext'; 
import { usePlatformUsers } from './UserManagementContext'; // Added for resolving user groups

// Initial Mock Themes (can be moved from constants.ts or kept for initialization)
const INITIAL_MOCK_THEMES: Theme[] = [
  {
    id: 'theme-001',
    title: 'Monólogo Clássico Reinventado',
    description: 'Escolha um monólogo clássico e apresente-o com uma perspectiva moderna.',
    month: 7,
    year: 2024,
    active: true,
    pdfUrls: ['ClassicsRevisted_Guide.pdf', 'Monologue_Examples.pdf'], // Store names for uploaded files
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    headerImageUrl: '/placeholder-images/theme-monologo-classico-800x300.jpg', // Updated placeholder
    headerImageDataUrl: '/placeholder-images/theme-monologo-classico-800x300.jpg', // Updated placeholder for mock
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'theme-002',
    title: 'Cena de Comédia Original',
    description: 'Crie e interprete uma cena curta de comédia original.',
    month: 8,
    year: 2024,
    active: false,
    pdfUrls: ['ComedyWriting_Tips.pdf'],
    videoUrl: '',
    headerImageUrl: '/placeholder-images/theme-comedia-original-800x300.jpg', // Updated placeholder
    headerImageDataUrl: '/placeholder-images/theme-comedia-original-800x300.jpg', // Updated placeholder for mock
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// NOTA: A constante INITIAL_MOCK_THEMES acima define os temas padrão
// que serão carregados se nenhuma configuração for encontrada no localStorage.
// Se você atualizou esta constante para refletir os novos padrões desejados,
// a aplicação a usará quando o localStorage estiver vazio.

interface ThemeContextType {
  themes: Theme[];
  addTheme: (theme: Theme) => void;
  updateTheme: (updatedTheme: Theme) => void;
  getActiveTheme: () => Theme | undefined;
  getThemeById: (id: string) => Theme | undefined;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themes, setThemes] = useState<Theme[]>(() => {
    const storedThemes = localStorage.getItem('cena-themes');
    return storedThemes ? JSON.parse(storedThemes) : INITIAL_MOCK_THEMES;
  });
  const { addNotification } = useNotifications(); 
  const { platformUsers } = usePlatformUsers(); // Added

  useEffect(() => {
    localStorage.setItem('cena-themes', JSON.stringify(themes));
  }, [themes]);

  const notifyAllActors = (notificationData: NotificationCreationData) => { // Changed type here
    const actorUserIds = platformUsers.filter(u => u.currentRole === Role.ACTOR).map(u => u.id);
    if (actorUserIds.length > 0) {
      addNotification(actorUserIds, notificationData);
    }
  };

  const addTheme = (theme: Theme) => {
    const newThemeWithId = { ...theme, id: `theme-${Date.now()}` };
    setThemes(prevThemes => [...prevThemes, newThemeWithId]);
    if (newThemeWithId.active) {
      notifyAllActors({
        type: NotificationType.NEW_THEME,
        title: 'Novo Tema do Mês Disponível!',
        message: `O tema "${newThemeWithId.title}" já está disponível para você explorar.`,
        linkTo: PATHS.CURRENT_THEME,
        iconName: 'MenuIcon',
      });
    }
  };

  const updateTheme = (updatedTheme: Theme) => {
    const oldTheme = themes.find(t => t.id === updatedTheme.id);
    setThemes(prevThemes =>
      prevThemes.map(theme => (theme.id === updatedTheme.id ? updatedTheme : theme))
    );
    if (updatedTheme.active && (!oldTheme || !oldTheme.active)) {
      notifyAllActors({
        type: NotificationType.NEW_THEME,
        title: 'Tema do Mês Atualizado!',
        message: `O tema "${updatedTheme.title}" agora é o tema ativo. Confira!`,
        linkTo: PATHS.CURRENT_THEME,
        iconName: 'MenuIcon',
      });
    }
  };

  const getActiveTheme = () => {
    return themes.find(theme => theme.active);
  };

  const getThemeById = (id: string) => {
    return themes.find(theme => theme.id === id);
  };

  return (
    <ThemeContext.Provider value={{ themes, addTheme, updateTheme, getActiveTheme, getThemeById }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemes = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemes must be used within a ThemeProvider');
  }
  return context;
};