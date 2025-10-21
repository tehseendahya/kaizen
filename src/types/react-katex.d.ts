declare module 'react-katex' {
  import * as React from 'react';

  type ErrorRenderer = (error: Error) => React.ReactNode;

  interface MathComponentPropsWithMath {
    math: string;
    children?: string;
    errorColor?: string;
    renderError?: ErrorRenderer;
  }

  interface MathComponentPropsWithChildren {
    math?: string;
    children: string;
    errorColor?: string;
    renderError?: ErrorRenderer;
  }

  type MathComponentProps = MathComponentPropsWithMath | MathComponentPropsWithChildren;

  export const InlineMath: React.FC<MathComponentProps>;
  export const BlockMath: React.FC<MathComponentProps>;
}
