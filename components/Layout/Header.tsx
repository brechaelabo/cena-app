
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APP_NAME, PATHS, ROLE_NAMES } from '../../constants';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../Common/Button';
import { MenuIcon, UserIcon, LogoutIcon, PriceTagIcon, ChevronDownIcon } from '../Common/Icons';
import { Role } from '../../types';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);

  const handleLogout = () => {
    logout(); 
  };

  const handleSwitchRole = (newRole: Role) => {
    switchRole(newRole);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="bg-brand-primary shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          {user && (
            <button onClick={toggleSidebar} className="mr-2 p-2 text-text-primary hover:text-white hover:bg-brand-accent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-primary lg:hidden">
              <MenuIcon />
            </button>
          )}
          <Link to={user ? PATHS.DASHBOARD : PATHS.HOME} className="text-2xl font-bold text-white">
            {APP_NAME}
          </Link>
        </div>
        <nav className="flex items-center space-x-3">
          {!user && (
            <>
              <Link to={PATHS.PRICING} className="text-text-secondary hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center">
                <PriceTagIcon className="w-4 h-4 mr-1" /> Planos
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(PATHS.LOGIN)}
                className="text-text-primary border-text-secondary hover:bg-brand-accent hover:text-action-primary-bg focus:ring-text-secondary"
              >
                Entrar
              </Button>
              <Button 
                size="sm" 
                onClick={() => navigate(PATHS.REGISTER)} 
                className="bg-white text-black hover:bg-gray-200 focus:ring-gray-300" 
              >
                Registrar
              </Button>
            </>
          )}
          {user && (
            <div className="relative flex items-center space-x-2">
              {user.roles.length > 1 && (
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="text-text-secondary hover:text-white hover:bg-brand-accent flex items-center"
                  >
                    {ROLE_NAMES[user.currentRole]}
                    <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-bg-dark-element rounded-md shadow-lg py-1 z-50 border border-brand-accent">
                      {user.roles.map(rolePivot => (
                        <button
                          key={rolePivot.role}
                          onClick={() => handleSwitchRole(rolePivot.role)}
                          className={`block w-full text-left px-4 py-2 text-sm ${
                            user.currentRole === rolePivot.role 
                              ? 'bg-brand-accent text-white' 
                              : 'text-text-secondary hover:bg-brand-accent hover:text-white'
                          }`}
                        >
                          {ROLE_NAMES[rolePivot.role]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {user.roles.length <= 1 && (
                <span className="text-text-secondary text-sm hidden md:block">
                  {user.name || user.email} ({ROLE_NAMES[user.currentRole]})
                </span>
              )}
              <button onClick={handleLogout} className="p-2 text-text-primary hover:text-white hover:bg-brand-accent rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-primary" title="Sair">
                <LogoutIcon />
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};