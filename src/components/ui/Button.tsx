interface ButtonProps {
  variant?: 'primary' | 'secondary';
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  href,
  onClick,
  children,
  className = '',
  icon
}: ButtonProps) {
  const baseClass = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  if (href) {
    return (
      <a href={href} className={`${baseClass} ${className}`}>
        {icon}
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClass} ${className}`}>
      {icon}
      {children}
    </button>
  );
}
