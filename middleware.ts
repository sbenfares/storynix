import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Protéger les routes API sensibles
  if (request.nextUrl.pathname.startsWith('/api/generate-')) {
    const authHeader = request.headers.get('authorization');
    const validApiKey = process.env.STORYNIX_API_KEY;

    // Vérifier la clé API interne
    if (!authHeader || authHeader !== `Bearer ${validApiKey}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/generate-:path*'],
};
