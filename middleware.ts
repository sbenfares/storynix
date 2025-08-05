// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Laisser passer les routes système Next.js
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname === '/api/auth'
  ) {
    // Route d'authentification ouverte
    return NextResponse.next();
  }

  // 🔒 PROTÉGER LES APIS SENSIBLES
  if (
    pathname.startsWith('/api/generate-story') ||
    pathname.startsWith('/api/generate-audio')
  ) {
    const accessCode = process.env.STORYNIX_ACCESS_CODE;

    if (accessCode) {
      const authHeader = request.headers.get('authorization');

      if (!authHeader || authHeader !== `Bearer ${accessCode}`) {
        console.log("🚫 Tentative d'accès non autorisée à:", pathname);
        return NextResponse.json(
          { error: 'Accès non autorisé' },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Matcher toutes les routes sauf les fichiers statiques
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
