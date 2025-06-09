import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PATHS } from '../../constants';
import { Button } from '../Common/Button';
import { Input } from '../Common/Input';
import { Card } from '../Common/Card';
import { useToasts } from '../../contexts/ToastContext'; // Importado

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); 
  // const [error, setError] = useState(''); // Removido estado de erro local
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToasts(); // Usar toasts

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password); 
      navigate(PATHS.DASHBOARD); 
    } catch (err: any) {
      addToast(err.message || 'Falha no login. Verifique suas credenciais.', 'error');
    }
  };

  return (
    <Card title="Entrar na Plataforma CENA" className="max-w-md mx-auto bg-white text-brand-primary">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
          disabled={isLoading} // Adicionado disabled
        />
        <Input
          label="Senha"
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="********"
          disabled={isLoading} // Adicionado disabled
        />
        {/* {error && <p className="text-sm text-red-500 text-center">{error}</p>} Removido */}
        <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading}>
          Entrar
        </Button>
        <p className="text-sm text-center text-gray-600">
          Não tem uma conta?{' '}
          <a onClick={() => navigate(PATHS.REGISTER)} className="font-medium text-brand-primary hover:underline cursor-pointer">
            Registre-se
          </a>
        </p>
      </form>
    </Card>
  );
};