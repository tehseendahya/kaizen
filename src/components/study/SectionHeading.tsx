import type { JSX, ReactNode } from 'react';

interface SectionHeadingProps {
  id: string;
  level?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}

export default function SectionHeading({ 
  id, 
  level = 2, 
  children,
  className = ''
}: SectionHeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  const baseClasses = 'font-semibold scroll-mt-20';
  const sizeClasses = {
    2: 'text-2xl',
    3: 'text-xl',
    4: 'text-lg'
  };

  return (
    <Tag 
      id={id} 
      className={`${baseClasses} ${sizeClasses[level]} ${className}`}
    >
      <a 
        href={`#${id}`} 
        className="group inline-flex items-center hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        aria-label={`Link to ${children}`}
      >
        {children}
        <span className="ml-2 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity" aria-hidden="true">
          #
        </span>
      </a>
    </Tag>
  );
}
