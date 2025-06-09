
export const clearMockData = () => {
  // Lista COMPLETA de chaves do localStorage que podem conter dados mock
  const mockKeys = [
    'cena-themes',
    'cena-submissions', 
    'cena-feedbacks',
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
  // Limpa TUDO - incluindo auth e todos os dados mock
  localStorage.clear();
  console.log('🧹 ALL localStorage data cleared - forcing fresh start');
};

export const forceRealDataOnly = () => {
  // Remove todos os dados mock e força reload
  clearAllAppData();
  window.location.reload();
};
