
import React from 'react';
import { LoginForm } from '../components/Auth/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-page-bg p-4">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-8 text-center">Bem-vindo à CENA</h1>
        {/* LoginForm uses Card, which is already styled for light theme */}
        {/* The Card within LoginForm will have increased padding if we adjust its internal className or Card's default */}
        <LoginForm /> 
    </div>
  );
};

export default LoginPage;