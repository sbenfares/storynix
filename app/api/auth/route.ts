import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    // Mot de passe depuis les variables d'environnement
    const validPassword = process.env.STORYNIX_ACCESS_CODE;

    if (!validPassword) {
      return NextResponse.json(
        { success: false, message: 'Configuration manquante' },
        { status: 500 }
      );
    }

    if (password === validPassword) {
      return NextResponse.json({ success: true });
    } else {
      // Ajouter un délai pour éviter les attaques par force brute
      await new Promise(resolve => setTimeout(resolve, 1000));

      return NextResponse.json(
        { success: false, message: "Code d'accès incorrect" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
