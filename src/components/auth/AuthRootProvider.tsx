'use client';

import { Suspense } from 'react';
import { AuthRoot } from './AuthRoot';

function AuthRootContent() {
  return <AuthRoot />;
}

export function AuthRootProvider() {
  return (
    <Suspense fallback={null}>
      <AuthRootContent />
    </Suspense>
  );
}

