
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { usePlatformUsers } from '../../contexts/UserManagementContext';
import { User, Role } from '../../types';
import { Card } from '../../components/Common/Card';
import { Button } from '../../components/Common/Button';
import { ArrowLeftIcon, UserIcon as ProfileIcon, CalendarDaysIcon, GlobeAltIcon, AcademicCapIcon, SparklesIcon, ArrowPathIcon as ExperienceIcon, CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '../../components/Common/Icons';
import { PATHS, ROLE_NAMES, TECHNIQUE_OPTIONS, EDUCATION_LEVEL_NAMES } from '../../constants'; // MOCK_ASSETS_URL removed
import { calculateAge, formatFullDate, getMonthsSince } from '../../utils/dateFormatter';
import { useAuth } from '../../contexts/AuthContext';

const TutorProfilePage: React.FC = () => {
  const { tutorId } = useParams<{ tutorId: string }>();
  const { getUserById } = usePlatformUsers();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (tutorId) {
      const foundTutor = getUserById(tutorId);
      if (foundTutor && foundTutor.roles.some(r => r.role === Role.TUTOR) && (foundTutor.isApproved || currentUser?.currentRole === Role.ADMIN)) {
        setTutor(foundTutor);
      } else {
        setTutor(null); 
      }
    }
    setIsLoading(false);
  }, [tutorId, getUserById, currentUser]);

  if (isLoading) {
    return <div className="text-center p-10 text-text-body">Carregando perfil do tutor...</div>;
  }

  if (!tutor) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 text-xl">Perfil de tutor não encontrado ou não disponível.</p>
        <Button onClick={() => navigate(PATHS.DASHBOARD)} className="mt-4">Voltar</Button>
      </div>
    );
  }

  const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value?: string | number | null; children?: React.ReactNode }> = ({ icon, label, value, children }) => (
    <div className="flex items-start py-3">
      <div className="flex-shrink-0 w-8 h-8 mr-4 text-link-active flex items-center justify-center">{icon}</div>
      <div>
        <p className="text-sm font-medium text-text-muted">{label}</p>
        {value && <p className="text-md text-text-headings">{value}</p>}
        {children && <div className="text-md text-text-body mt-0.5">{children}</div>}
      </div>
    </div>
  );
  
  const SectionCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <Card className="mb-6 p-0">
        <div className={`px-5 py-3 border-b border-border-subtle flex items-center`}>
            {icon && <div className="mr-2 text-link-active">{icon}</div>}
            <h3 className="font-semibold text-black">{title}</h3>
        </div>
        <div className="p-5 space-y-3">
            {children}
        </div>
    </Card>
  );
  
  const tutorImage = tutor.imageUrl || `/placeholder-images/profile-tutor-default-${tutor.id.substring(0,5)}-150x150.jpg`;


  return (
    <div>
        <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 text-text-muted hover:text-link-active group inline-flex items-center"
        >
            <ArrowLeftIcon className="w-5 h-5 mr-1.5 text-text-muted group-hover:text-link-active transition-colors" /> Voltar
        </Button>

        <Card className="p-0 mb-8">
            <div className="p-6 md:flex md:items-center md:space-x-6">
                <img 
                    src={tutorImage} 
                    alt={tutor.name} 
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto md:mx-0 mb-4 md:mb-0 border-4 border-white shadow-lg"
                />
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-black">{tutor.name}</h1>
                    <p className="text-lg text-link-active">{ROLE_NAMES[Role.TUTOR]}</p>
                    <div className="mt-2 text-sm text-text-muted space-x-3">
                        <span>Idade: {calculateAge(tutor.dateOfBirth)} anos</span>
                        <span>Membro CENA desde: {formatFullDate(tutor.createdAt)}</span>
                    </div>
                </div>
            </div>
        </Card>
        
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <SectionCard title="Sobre Mim e Motivação" icon={<SparklesIcon className="w-5 h-5"/>}>
                   <p className="text-text-body whitespace-pre-wrap">{tutor.whyJoinCena || "Não informado."}</p>
                </SectionCard>

                <SectionCard title="Experiências Formativas" icon={<AcademicCapIcon className="w-5 h-5"/>}>
                    <p className="text-text-body whitespace-pre-wrap">{tutor.formativeExperiences || "Não informado."}</p>
                </SectionCard>

                <SectionCard title="Experiências Profissionais" icon={<ExperienceIcon className="w-5 h-5"/>}>
                    <p className="text-text-body whitespace-pre-wrap">{tutor.professionalExperiences || "Não informado."}</p>
                </SectionCard>
            </div>

            <div className="lg:col-span-1 space-y-6">
                 <SectionCard title="Detalhes e Contato" icon={<ProfileIcon className="w-5 h-5"/>}>
                    <DetailItem icon={<CalendarDaysIcon />} label="Data de Nascimento" value={tutor.dateOfBirth ? formatFullDate(tutor.dateOfBirth) : "Não informada"} />
                    {tutor.educationLevel && (
                        <DetailItem icon={<AcademicCapIcon className="w-5 h-5"/>} label="Escolaridade" value={EDUCATION_LEVEL_NAMES[tutor.educationLevel]} />
                    )}
                    <DetailItem icon={<AcademicCapIcon className="w-5 h-5"/>} label="Técnica Base Principal" value={tutor.baseTechnique === 'Outra' ? tutor.otherTechnique : tutor.baseTechnique || "Não informada"} />
                    
                    {tutor.phone && <DetailItem icon={<ProfileIcon className="w-5 h-5"/>} label="Telefone" value={tutor.phone} />}
                    
                    {!tutor.hasNoSocialMedia && tutor.socialMediaLinks && tutor.socialMediaLinks.length > 0 && tutor.socialMediaLinks.some(l => l.url) && (
                        <DetailItem icon={<GlobeAltIcon />} label="Redes Sociais">
                            <ul className="space-y-1 mt-1">
                                {tutor.socialMediaLinks.filter(link => link.url).map((link, index) => (
                                    <li key={index}>
                                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-link-active hover:underline text-sm">
                                            {link.platform}: {link.url}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </DetailItem>
                    )}
                 </SectionCard>
                 {currentUser?.currentRole === Role.ADMIN && (
                     <SectionCard title="Informações de Admin" icon={<ProfileIcon className="w-5 h-5"/>}>
                        <DetailItem icon={<InformationCircleIcon className="w-5 h-5"/>} label="Status da Candidatura" value={tutor.tutorApplicationStatus ? ROLE_NAMES[tutor.tutorApplicationStatus] || tutor.tutorApplicationStatus : "N/A"} />
                        <DetailItem icon={tutor.isApproved ? <CheckCircleIcon className="w-5 h-5 text-green-500"/> : <XCircleIcon className="w-5 h-5 text-red-500"/>} label="Acesso à Plataforma" value={tutor.isApproved ? "Ativo" : "Suspenso/Pendente"} />
                        <Link to={PATHS.ADMIN_TUTOR_REVIEW_APP.replace(':tutorId', tutor.id)}>
                            <Button variant="secondary" className="w-full mt-2">Ver Candidatura Detalhada</Button>
                        </Link>
                     </SectionCard>
                 )}
            </div>
        </div>


    </div>
  );
};

export default TutorProfilePage;
