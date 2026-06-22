import * as React from 'react';
import { contentWidths, type ContentWidthKey } from '@easydev/design-system';
import { cn } from '../../utils';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: ContentWidthKey;
}

export function PageContainer({ width = 'standard', className, style, ...props }: PageContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full px-4 py-6 sm:px-6 lg:px-8', className)}
      style={{ maxWidth: contentWidths[width], ...style }}
      {...props}
    />
  );
}
