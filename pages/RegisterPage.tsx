
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PATHS, ROLE_NAMES } from '../constants';
import { Button } from '../components/Common/Button';
import { Input } from '../components/Common/Input';
import { Card } from '../components/Common/Card';
import { Role } from '../types';
import { useToasts } from '../contexts/ToastContext';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [roleRequest, setRoleRequest] = useState<Role>(Role.ACTOR);
  const { register, isLoading } = useAuth(); // Removed login from here
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const [passwordError, setPasswordError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      addToast('As senhas não coincidem.', 'error');
      return;
    }

    try {
      await register(email, name, roleRequest); 
      // Removed: await login(email, roleRequest); 
      // The register function in AuthContext now handles setting the logged-in state.
      
      if (roleRequest === Role.TUTOR) {
        addToast('Registro básico concluído. Complete sua candidatura de tutor.', 'info');
        navigate(PATHS.TUTOR_APPLICATION_FORM, { state: { email, name } });
      } else if (roleRequest === Role.ACTOR) {
        addToast('Registro concluído! Complete seu perfil de ator.', 'info');
        navigate(PATHS.ACTOR_PROFILE_FORM); 
      } else {
        navigate(PATHS.DASHBOARD); 
      }
    } catch (err: any) {
      addToast(err.message || 'Falha no registro. Tente novamente.', 'error');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page-bg p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-headings mb-8 text-center">Crie sua Conta CENA</h1>
      <Card title="Formulário de Registro" className="max-w-md w-full mx-auto p-6 sm:p-8"> 
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome Completo"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-lg"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-lg"
          />
          <div>
            <label htmlFor="roleRequest" className="block text-sm font-medium text-text-body mb-1.5">Quero me registrar como:</label>
            <select
              id="roleRequest"
              name="roleRequest"
              value={roleRequest}
              onChange={(e) => setRoleRequest(e.target.value as Role)}
              className="block w-full appearance-none rounded-lg border bg-card-bg text-text-body placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-link-active focus:border-link-active sm:text-sm px-3 py-2.5 border-border-subtle"
              disabled={isLoading}
            >
              <option value={Role.ACTOR}>{ROLE_NAMES[Role.ACTOR]}</option>
              <option value={Role.TUTOR}>{ROLE_NAMES[Role.TUTOR]}</option>
              <option value={Role.GUEST}>{ROLE_NAMES[Role.GUEST]}</option>
            </select>
          </div>
          
          <Input
            label="Senha"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={passwordError}
            disabled={isLoading}
            className="rounded-lg"
          />
          <Input
            label="Confirmar Senha"
            type="password"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            className="rounded-lg"
          />
          
          <Button type="submit" variant="primary" className="w-full rounded-lg" isLoading={isLoading} disabled={isLoading}>
            Registrar
          </Button>
          <p className="text-sm text-center text-text-muted">
            Já tem uma conta?{' '}
            <button type="button" onClick={() => navigate(PATHS.LOGIN)} className="font-medium text-link-active hover:underline">
              Entre
            </button>
          </p>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;