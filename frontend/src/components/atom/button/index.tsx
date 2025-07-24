import { Link } from "react-router-dom";
import { Typography } from "../typography";

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline2' | 'underline' | 'basic' | 'lang';
  children: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  to?: string;
  type?: "button" | "submit" | "reset";
}

const variantClasses: Record<string, string> = {
  primary: 'px-4 py-2 bg-primary text-typo-white hover:bg-primary-70 items-center justify-center',
  secondary: 'px-4 py-2 bg-secondary text-typo-white hover:bg-secondary-70 items-center justify-center',
  outline: 'px-4 py-2 bg-typo-white text-primary border-2 border-primary hover:bg-primary hover:text-typo-white items-center justify-center',
  outline2: 'px-4 py-2 bg-typo-white text-typo border-2 border-typo-outline hover:bg-typo-outline items-center justify-center',
  underline: 'underline text-primary hover:text-typo-secondary items-center justify-center',
  basic: 'text-primary hover:text-primary-70 items-center justify-center',
  lang: 'px-2 py-2 bg-white text-primary items-center justify-center',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  iconLeft,
  iconRight,
  className = '',
  onClick,
  to,
  type = "button",
}) => {
  const variantStyle = variantClasses[variant] || variantClasses.primary;

  const buttonContent = (
    <div className="flex items-center justify-center space-x-1">
      {iconLeft && <span className="w-6 h-6">{iconLeft}</span>}
      <Typography type="button" font="dm-sans" weight="semibold">
        {children}
      </Typography>
      {iconRight && <span className="w-6 h-6">{iconRight}</span>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className={`inline-block rounded-md ${variantStyle} ${className}`}>
        {buttonContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={`flex justify-center rounded-md ${variantStyle} ${className}`}
      onClick={onClick}
    >
      {buttonContent}
    </button>
  );
};