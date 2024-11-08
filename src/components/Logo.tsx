import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Base do banco de dados */}
      <ellipse cx="16" cy="24" rx="12" ry="4" fill="currentColor" opacity="0.7" />
      
      {/* Camadas do banco de dados */}
      <ellipse cx="16" cy="16" rx="12" ry="4" fill="currentColor" opacity="0.8" />
      <ellipse cx="16" cy="8" rx="12" ry="4" fill="currentColor" />
      
      {/* Linhas de conexão */}
      <path
        d="M4 8v16M28 8v16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Símbolo de suporte */}
      <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path
        d="M16 13v6M13 16h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}