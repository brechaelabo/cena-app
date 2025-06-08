
import React from 'react';
import { SIDEBAR_WIDTH_CLOSED, SIDEBAR_WIDTH_OPEN } from '../../constants';

interface PageWrapperProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  isPublicPage?: boolean; 
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, sidebarOpen, isPublicPage = false }) => {
  // On mobile (screens smaller than 'lg'), sidebar is an overlay, so page content should not have margin.
  // On 'lg' screens and up, apply margin based on sidebar state.
  const marginLeftClass = isPublicPage 
    ? 'ml-0' 
    : (sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'); // Assuming SIDEBAR_WIDTH_OPEN is 'w-64' (256px) and SIDEBAR_WIDTH_CLOSED is 'w-20' (80px)
  
  return (
    <main className={`flex-1 transition-all duration-300 ease-in-out p-4 md:p-6 ${marginLeftClass}`}>
      <div className="container mx-auto">
        {children}
      </div>
    </main>
  );
};