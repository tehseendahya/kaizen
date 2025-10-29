import * as React from 'react';

type AvatarProps = React.HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
};

export function Avatar({ className = '', src, alt, children, ...rest }: AvatarProps) {
  return (
    <div
      className={`relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-white ${className}`}
      {...rest}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        children
      )}
    </div>
  );
}

export function AvatarImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} alt={props.alt} className={`h-full w-full object-cover ${props.className ?? ''}`} />;
}

export function AvatarFallback({ className = '', children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`text-sm font-medium ${className}`}>{children}</div>;
}

