
export const clearMockData = () => {
  // Lista de chaves do localStorage que podem conter dados mock
  const mockKeys = [
    'cena-themes',
    'cena-submissions', 
    'cena-platform-users',
    'cena-percursos',
    'cena-sessoes-categorias',
    'cena-landing-page-content',
    'cena-public-live-events',
    'cena-scheduled-sessions'
  ];

  let cleared = false;
  mockKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      cleared = true;
    }
  });

  if (cleared) {
    console.log('🧹 Mock data cleared from localStorage');
  }
};

export const clearAllAppData = () => {
  // Para desenvolvimento - limpa tudo incluindo auth
  const allKeys = [
    'cena-user',
    'cena-auth-token',
    ...['cena-themes', 'cena-submissions', 'cena-platform-users', 'cena-percursos', 'cena-sessoes-categorias', 'cena-landing-page-content', 'cena-public-live-events', 'cena-scheduled-sessions']
  ];
  
  allKeys.forEach(key => localStorage.removeItem(key));
  console.log('🧹 All app data cleared');
};
