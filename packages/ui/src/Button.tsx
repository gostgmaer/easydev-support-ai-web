import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // Style Variants mapping
    const baseStyle = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50';
    
    const variants = {
      default: 'bg-primary-500 text-white hover:bg-primary-600',
      destructive: 'bg-danger text-white hover:bg-danger/90',
      outline: 'border border-neutral-200 bg-transparent hover:bg-neutral-100 text-neutral-900',
      secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
      ghost: 'hover:bg-neutral-100 hover:text-neutral-900 bg-transparent',
      link: 'text-primary-500 underline-offset-4 hover:underline'
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 rounded-md px-3',
      lg: 'h-11 rounded-md px-8',
      icon: 'h-10 w-10'
    };

    const classNames = `${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`.trim();

    return <Comp className={classNames} ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';
