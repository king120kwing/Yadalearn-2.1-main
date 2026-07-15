import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
    noPadding?: boolean;
}

const maxWidths = {
    sm: 'max-w-2xl',    // 672px
    md: 'max-w-4xl',    // 896px
    lg: 'max-w-6xl',    // 1152px
    xl: 'max-w-7xl',    // 1280px
    full: 'max-w-full',
};

export const ResponsiveContainer = ({
    children,
    size = 'xl',
    className,
    noPadding = false,
}: ResponsiveContainerProps) => {
    return (
        <div
            className={cn(
                'w-full mx-auto',
                maxWidths[size],
                !noPadding && 'px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12',
                className
            )}
        >
            {children}
        </div>
    );
};
