import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { childName, universe } = await request.json();

    // Validation des données
    if (!childName || !universe) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Limitation de longueur pour éviter les abus
    if (childName.length > 50) {
      return NextResponse.json({ error: 'Prénom trop long' }, { status: 400 });
    }

    // Ici, appel à votre API ChatGPT
    // Pour le MVP, on retourne du contenu mock
    const mockStory = {
      title: `Les aventures de ${childName} dans le monde des ${universe}`,
      content: `Il était une fois ${childName}, un enfant curieux et courageux qui découvrit un monde magique rempli de mystères. Dans l'univers des ${universe}, ${childName} allait vivre une aventure extraordinaire qui changerait sa vie à jamais. Chaque pas dans ce monde nouveau révélait des merveilles insoupçonnées et des défis passionnants à relever.`,
      chapters: [
        `Le voyage commence`,
        `${childName} découvre ses pouvoirs`,
        `L'aventure finale`,
      ],
    };

    // Ajouter un délai pour simuler la génération
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json(mockStory);
  } catch (error) {
    console.error('Erreur génération histoire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération' },
      { status: 500 }
    );
  }
}
