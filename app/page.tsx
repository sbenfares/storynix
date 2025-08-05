'use client';

import AuthGuard from '@/components/authGuard';
import StorynixHome from '@/components/storynixHome';

export default function Page() {
  return (
    <AuthGuard>
      <StorynixHome />
    </AuthGuard>
  );
}
