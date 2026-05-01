import React from 'react';

interface ClayBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const ClayBadge: React.FC<ClayBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const baseClass = 'clay-badge';
  const variantClass = variant !== 'default' ? variant : '';
  const sizeClass = `size-${size}`;

  return (
    <span className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default ClayBadge;
