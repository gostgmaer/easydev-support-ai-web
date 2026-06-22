import * as React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button';
import { cn } from '../../utils';

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    Pick<VariantProps<typeof buttonVariants>, 'variant'> {
  icon: React.ReactNode;
  label: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const ICON_SIZE_CLASS: Record<NonNullable<IconButtonProps['size']>, string> = {
  xs: 'h-7 w-7',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-11 w-11',
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = 'ghost', size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        className={cn(buttonVariants({ variant }), ICON_SIZE_CLASS[size], 'p-0', className)}
        {...props}
      >
        {icon}
      </button>
    );
  },
);
IconButton.displayName = 'IconButton';
