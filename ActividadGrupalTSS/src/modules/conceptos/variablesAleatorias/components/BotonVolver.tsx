import React from 'react';

interface BotonVolverProps {
  onClick?: () => void; // Opcional: por si quieres controlar la navegación manualmente
  className?: string;
}

export const BotonVolver: React.FC<BotonVolverProps> = ({ onClick, className = '' }) => {
  
  const handleBack = () => {
    if (onClick) {
      onClick();
    } else {
      // Comportamiento por defecto: ir atrás en el historial del navegador
      window.history.back();
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`
        group flex items-center gap-2 
        text-blue-900 hover:text-blue-700 
        font-sans text-sm font-bold uppercase tracking-wide 
        transition-all duration-200 
        hover:-translate-x-1 mb-4
        ${className}
      `}
      aria-label="Volver atrás"
    >
      {/* Icono de flecha izquierda (SVG inline para no depender de librerías) */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="transition-transform group-hover:scale-110"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>
      Volver al Temario
    </button>
  );
};