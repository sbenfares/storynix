import { NextRequest } from 'next/server';
import { AudioRequest, ApiError } from '@/types';

// Configuration des voix disponibles
const AVAILABLE_VOICES = {
  voix1: 'Z9ZHGvFZ90R0h0x1prsJ', // Voix par défaut
  voix2: 'kwhMCf63M8O3rCfnQ3oQ',
  voix3: 'BpjGufoPiobT79j2vtj4',
  voix4: '6vTyAgAT8PncODBcLjRf',
};

// Instructions de prononciation
const PRONUNCIATION_GUIDE: Record<string, string> = {
  Selyan: 'Céliane',
  Maëlle: 'Ma-elle',
  Gaël: 'Ga-elle',
  Anaïs: 'Ana-iss',
  // Ajoute d'autres prénoms selon tes besoins
};

function applyPronunciationGuide(text: string): string {
  let processedText = text;

  // Appliquer les corrections de prononciation
  Object.entries(PRONUNCIATION_GUIDE).forEach(([original, pronunciation]) => {
    // Remplacement global avec préservation de la casse
    const regex = new RegExp(original, 'gi');
    processedText = processedText.replace(regex, match => {
      // Préserver la casse du premier caractère
      return match[0] === match[0].toUpperCase()
        ? pronunciation.charAt(0).toUpperCase() + pronunciation.slice(1)
        : pronunciation.toLowerCase();
    });
  });

  return processedText;
}

export async function POST(request: NextRequest) {
  try {
    const body: AudioRequest = await request.json();
    const { text, voiceId = 'child_female' } = body; // Utiliser la clé au lieu de l'ID direct

    // Validation des entrées
    if (!text || text.trim().length === 0) {
      const error: ApiError = {
        error: "Le texte est requis pour générer l'audio",
      };
      return Response.json(error, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      const error: ApiError = { error: 'Clé API ElevenLabs manquante' };
      return Response.json(error, { status: 500 });
    }

    // Résoudre l'ID de la voix
    const resolvedVoiceId =
      AVAILABLE_VOICES[voiceId as keyof typeof AVAILABLE_VOICES] || voiceId;

    // Appliquer les corrections de prononciation
    const processedText = applyPronunciationGuide(text);

    // Log des corrections appliquées
    if (processedText !== text) {
      console.log('🗣️ Corrections de prononciation appliquées');
      console.log('📝 Original:', text.substring(0, 100) + '...');
      console.log('📝 Corrigé:', processedText.substring(0, 100) + '...');
    }

    // Limitation de la longueur du texte (ElevenLabs gratuit = 10k caractères/mois)
    if (processedText.length > 2000) {
      console.warn(
        `⚠️ Texte tronqué: ${processedText.length} -> 2000 caractères`
      );
    }

    const truncatedText = processedText.substring(0, 2000);

    console.log(
      `🎵 Génération audio ElevenLabs - ${truncatedText.length} caractères - Voix: ${voiceId}`
    );

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.6,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur ElevenLabs:', response.status, errorText);

      throw new Error(
        `ElevenLabs API error: ${response.status} - ${errorText}`
      );
    }

    const audioBuffer = await response.arrayBuffer();

    console.log(`✅ Audio généré: ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="storynix-story-${voiceId}.mp3"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('❌ Erreur génération audio:', error);

    const apiError: ApiError = {
      error: 'Erreur lors de la génération audio',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    };

    return Response.json(apiError, { status: 500 });
  }
}

// Route GET pour tester la configuration
export async function GET() {
  return Response.json({
    message: 'API Storynix - Generate Audio',
    status: 'active',
    elevenlabs_configured: !!process.env.ELEVENLABS_API_KEY,
    available_voices: Object.keys(AVAILABLE_VOICES),
    pronunciation_guide: PRONUNCIATION_GUIDE,
    available_characters: 'Vérifiez votre quota ElevenLabs',
  });
}
