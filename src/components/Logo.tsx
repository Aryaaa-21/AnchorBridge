import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 70C20 70 35 40 50 40C65 40 80 70 80 70" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
      <rect x="42" y="30" width="16" height="24" rx="4" fill="currentColor"/>
      <path d="M50 54V75" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
      <circle cx="50" cy="22" r="6" fill="currentColor"/>
    </svg>
  );
};
