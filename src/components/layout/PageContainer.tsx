import type { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
      {children}
    </main>
  );
}
