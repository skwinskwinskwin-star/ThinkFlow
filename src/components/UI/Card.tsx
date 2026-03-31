
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hover, ...props }) => {
  return (
    <div
      className={cn(
        'bg-[var(--card)] border border-[var(--border)] rounded-[2.5rem] p-8 transition-all',
        hover && 'hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5',
        className
      )}
      {...props}
    />
  );
};
