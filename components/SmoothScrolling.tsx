"use client";

import { ReactLenis } from 'lenis/react';
import React from 'react';
import { usePathname } from 'next/navigation';

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExcluded = pathname.startsWith('/admin') || pathname.startsWith('/register');

  if (isExcluded) {
    return <>{children}</>;
  }

  return (
    <ReactLenis root options={{ lerp: 1, autoRaf: true, stopInertiaOnNavigate: true }}>
      {children}
    </ReactLenis>
  );
}
