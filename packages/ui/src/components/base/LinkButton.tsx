import * as React from 'react';
import NextLink from 'next/link';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button';
import { cn } from '../../utils';

export interface LinkButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string;
  external?: boolean;
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ href, external = false, variant, size, className, children, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);

    if (external) {
      return (
        <a ref={ref} href={href} target="_blank" rel="noopener noreferrer" className={classes} {...props}>
          {children}
        </a>
      );
    }

    return (
      <NextLink ref={ref} href={href} className={classes} {...props}>
        {children}
      </NextLink>
    );
  },
);
LinkButton.displayName = 'LinkButton';
