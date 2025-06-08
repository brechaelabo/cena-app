
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SessaoCategoria } from '../types';

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

const INITIAL_MOCK_SESSOES_CATEGORIAS: SessaoCategoria[] = [
  {
    id: 'sessao-cat-001',
    slug: 'analise-de-texto',
    title: 'Análise de Texto',
    description: 'Aprofunde-se na compreensão de roteiros, subtextos e objetivos do personagem.',
    longDescription: 'Nestas sessões, o tutor irá guiá-lo através de uma análise detalhada do texto escolhido, ajudando a desvendar camadas de significado, identificar os objetivos e motivações do personagem, e construir uma interpretação mais rica e fundamentada. Ideal para preparação de cenas, monólogos ou mesmo para expandir seu repertório de leitura dramática.',
    iconName: 'BookOpenIcon',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sessao-cat-002',
    slug: 'tecnica-vocal-corporal',
    title: 'Técnica Vocal e Corporal',
    description: 'Exercícios práticos para aprimorar sua voz, dicção, presença cênica e expressão corporal.',
    longDescription: 'Trabalhe sua voz e corpo para uma atuação mais expressiva e consciente. As sessões podem focar em projeção vocal, articulação, respiração, relaxamento, consciência corporal, e desbloqueio de tensões, utilizando diversas abordagens técnicas adaptadas às suas necessidades.',
    iconName: 'SparklesIcon', // Placeholder, could be MicrophoneIcon or BodyIcon if added
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sessao-cat-003',
    slug: 'preparacao-testes-especificos',
    title: 'Preparação para Testes Específicos',
    description: 'Receba orientação direcionada para audições, self-tapes e call-backs.',
    longDescription: 'Prepare-se de forma estratégica para seus próximos testes. Estas sessões podem incluir escolha de material adequado, simulação de audição, direcionamento para a linguagem específica do projeto, e dicas para se destacar e causar uma ótima impressão nos diretores de elenco.',
    iconName: 'ClipboardCheckIcon',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sessao-cat-004',
    slug: 'feedback-regravacao',
    title: 'Feedback de Regravação',
    description: 'Analise uma self-tape regravada após um feedback inicial, focando na evolução.',
    longDescription: 'Ideal para atores que receberam um feedback da CENA ou de outro profissional e desejam aprofundar a análise sobre uma nova versão do seu self-tape. O tutor ajudará a identificar os progressos, ajustar detalhes e refinar ainda mais a performance.',
    iconName: 'VideoCameraIcon',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sessao-cat-005',
    slug: 'mentoria-carreira-mercado',
    title: 'Mentoria de Carreira e Mercado',
    description: 'Discuta estratégias de carreira, material de divulgação, networking e posicionamento no mercado.',
    longDescription: 'Uma conversa focada no seu desenvolvimento profissional. Aborde temas como construção de material de divulgação (fotos, reel, currículo), estratégias para networking, entendimento do mercado audiovisual e teatral, e planejamento de próximos passos na sua carreira.',
    iconName: 'UserGroupIcon',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// NOTA: A constante INITIAL_MOCK_SESSOES_CATEGORIAS acima define as categorias padrão
// que serão carregadas se nenhuma configuração for encontrada no localStorage.
// Se você atualizou esta constante para refletir os novos padrões desejados,
// a aplicação a usará quando o localStorage estiver vazio.

interface SessoesOneOnOneContextType {
  categorias: SessaoCategoria[];
  addCategoria: (categoria: Omit<SessaoCategoria, 'id' | 'createdAt' | 'updatedAt' | 'slug'>) => Promise<void>;
  updateCategoria: (updatedCategoria: SessaoCategoria) => Promise<void>;
  deleteCategoria: (categoriaId: string) => Promise<void>;
  getCategoriaById: (id: string) => SessaoCategoria | undefined;
  getCategoriaBySlug: (slug: string) => SessaoCategoria | undefined;
  setCategoriaStatus: (categoriaId: string, isActive: boolean) => Promise<void>;
}

const SessoesOneOnOneContext = createContext<SessoesOneOnOneContextType | undefined>(undefined);

export const SessoesOneOnOneProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categorias, setCategorias] = useState<SessaoCategoria[]>(() => {
    const storedCategorias = localStorage.getItem('cena-sessoes-categorias');
    return storedCategorias ? JSON.parse(storedCategorias) : INITIAL_MOCK_SESSOES_CATEGORIAS;
  });

  useEffect(() => {
    localStorage.setItem('cena-sessoes-categorias', JSON.stringify(categorias));
  }, [categorias]);

  const addCategoria = async (categoriaData: Omit<SessaoCategoria, 'id' | 'createdAt' | 'updatedAt' | 'slug'>) => {
    const newCategoria: SessaoCategoria = {
      ...categoriaData,
      id: `sessao-cat-${Date.now()}`,
      slug: generateSlug(categoriaData.title),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCategorias(prev => [...prev, newCategoria]);
  };

  const updateCategoria = async (updatedCategoriaData: SessaoCategoria) => {
     const updatedWithSlug = {
      ...updatedCategoriaData,
      slug: generateSlug(updatedCategoriaData.title),
      updatedAt: new Date().toISOString(),
    };
    setCategorias(prev =>
      prev.map(cat => (cat.id === updatedWithSlug.id ? updatedWithSlug : cat))
    );
  };

  const deleteCategoria = async (categoriaId: string) => {
    setCategorias(prev => prev.filter(cat => cat.id !== categoriaId));
  };

  const getCategoriaById = (id: string) => {
    return categorias.find(cat => cat.id === id);
  };

  const getCategoriaBySlug = (slug: string) => {
    return categorias.find(cat => cat.slug === slug);
  };

  const setCategoriaStatus = async (categoriaId: string, isActive: boolean) => {
    setCategorias(prev =>
      prev.map(cat =>
        cat.id === categoriaId ? { ...cat, isActive, updatedAt: new Date().toISOString() } : cat
      )
    );
  };

  return (
    <SessoesOneOnOneContext.Provider
      value={{
        categorias,
        addCategoria,
        updateCategoria,
        deleteCategoria,
        getCategoriaById,
        getCategoriaBySlug,
        setCategoriaStatus,
      }}
    >
      {children}
    </SessoesOneOnOneContext.Provider>
  );
};

export const useSessoesOneOnOne = (): SessoesOneOnOneContextType => {
  const context = useContext(SessoesOneOnOneContext);
  if (context === undefined) {
    throw new Error('useSessoesOneOnOne must be used within a SessoesOneOnOneProvider');
  }
  return context;
};