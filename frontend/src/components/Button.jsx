import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${sizeClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
};
