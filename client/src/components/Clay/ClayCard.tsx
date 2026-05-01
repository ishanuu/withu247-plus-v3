import React from 'react';
import '../../../src/styles/claymorphism.css';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'interactive' | 'highlight';
}

export const ClayCard: React.FC<ClayCardProps> = ({
  children,
  className = '',
  elevated = false,
  onClick,
  variant = 'default',
}) => {
  const baseClass = 'clay-card';
  const elevatedClass = elevated ? 'elevated' : '';
  const variantClass = variant !== 'default' ? `variant-${variant}` : '';

  return (
    <div
      className={`${baseClass} ${elevatedClass} ${variantClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default ClayCard;
