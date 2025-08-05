import OpenAI from 'openai';
import { NextRequest } from 'next/server';
import { StoryRequest, Story, ApiError, UniverseId } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: StoryRequest = await request.json();
    const { childName, universe } = body;

    // Validation des entrées
    if (!childName || !universe) {
      const error: ApiError = { error: 'Prénom et univers requis' };
      return Response.json(error, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      const error: ApiError = { error: 'Clé API OpenAI manquante' };
      return Response.json(error, { status: 500 });
    }

    const universePrompts: Record<UniverseId, string> = {
      pirates:
        'pirates, trésors cachés, navires, aventures en haute mer, perroquets, cartes au trésor, îles mystérieuses',
      animals:
        "animaux de la forêt, nature magique, amitié avec les animaux, protection de l'environnement, écureuils, renards, hiboux",
      space:
        'espace, planètes colorées, vaisseaux spatiaux, aliens bienveillants, exploration galactique, étoiles scintillantes',
      fairy:
        'fées, magie scintillante, enchantements, royaumes féeriques, cristaux magiques, créatures merveilleuses',
      ninja:
        'ninjas honorables, arts martiaux, Japon ancien, missions secrètes, sagesse, courage et respect',
    };

    const prompt = `Tu es un conteur professionnel spécialisé dans les histoires pour enfants de 4 à 8 ans.

Crée une histoire captivante et bienveillante avec ces paramètres :
- Prénom du héros/héroïne : ${childName}
- Univers et éléments : ${universePrompts[universe as UniverseId]}
- Durée de lecture : 4-6 minutes à l'oral (environ 600-900 mots)
- Ton : joyeux, encourageant, rassurant, adapté aux enfants
- Structure : histoire complète avec début captivant, aventure passionnante et fin heureuse
- Valeurs : amitié, courage, bienveillance, découverte, entraide

L'histoire doit :
- Mettre ${childName} comme personnage principal héroïque
- Être immersive et stimuler l'imagination des enfants
- Avoir une morale positive sans être moralisatrice
- Utiliser un vocabulaire simple mais riche et descriptif
- Inclure des éléments sensoriels (sons, couleurs, textures)
- Avoir un rythme dynamique avec des moments d'action et de calme
- Se terminer par une victoire personnelle de ${childName}

Divise l'histoire en 4 chapitres courts et équilibrés.

Réponds UNIQUEMENT au format JSON suivant (aucun texte avant ou après) :
{
  "title": "titre accrocheur de l'histoire avec le prénom",
  "content": "texte complet de l'histoire prêt à être lu à haute voix, avec des transitions fluides entre les chapitres",
  "chapters": ["nom du chapitre 1", "nom du chapitre 2", "nom du chapitre 3", "nom du chapitre 4"]
}`;

    console.log(
      `📝 Génération d'histoire pour ${childName} (univers: ${universe})`
    );

    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini', // Le plus récent et économique
      messages: [
        {
          role: 'system',
          content:
            'Tu es un conteur expert en histoires pour enfants. Tu réponds toujours en JSON valide, sans formatage markdown.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const responseContent = completion.choices[0].message.content?.trim() || '';

    // Nettoyage de la réponse (au cas où il y aurait du formatage markdown)
    const cleanedResponse = responseContent
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^[^{]*/, '') // Supprimer tout ce qui précède le premier {
      .replace(/[^}]*$/, '}'); // Garder seulement jusqu'au dernier }

    let story: Story;
    try {
      story = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ Erreur parsing JSON:', parseError);
      console.error('Réponse OpenAI:', responseContent);

      // Fallback : créer une histoire simple
      story = {
        title: `L'aventure magique de ${childName}`,
        content: `Il était une fois ${childName}, un enfant extraordinaire qui vivait des aventures merveilleuses. Un jour, ${childName} découvrit un monde magique rempli de surprises et d'amis fidèles. Grâce à son courage et sa gentillesse, ${childName} réussit à surmonter tous les défis et à vivre une aventure inoubliable. À la fin, ${childName} rentra chez lui avec des souvenirs plein le cœur et la certitude que de nouvelles aventures l'attendaient.`,
        chapters: [
          "Le début de l'aventure",
          'La découverte',
          'Le défi',
          'Le retour triomphant',
        ],
      };
    }

    // Validation des données
    if (!story.title || !story.content) {
      throw new Error('Histoire incomplète générée');
    }

    // S'assurer que les chapitres existent
    if (!story.chapters || story.chapters.length === 0) {
      story.chapters = ['Chapitre 1', 'Chapitre 2', 'Chapitre 3', 'Chapitre 4'];
    }

    console.log(`✅ Histoire générée: "${story.title}"`);
    console.log(`📊 Longueur: ${story.content.length} caractères`);

    return Response.json(story);
  } catch (error) {
    console.error('❌ Erreur génération histoire:', error);

    const apiError: ApiError = {
      error: "Erreur lors de la génération de l'histoire",
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    };

    return Response.json(apiError, { status: 500 });
  }
}

// Optionnel : ajouter une route GET pour tester
export async function GET() {
  return Response.json({
    message: 'API Storynix - Generate Story',
    status: 'active',
    openai_configured: !!process.env.OPENAI_API_KEY,
  });
}
