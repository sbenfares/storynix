import { NextRequest } from "next/server";
import { AudioRequest, ApiError } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: AudioRequest = await request.json();
    const { text, voiceId = "pNInz6obpgDQGcFmaJgB" } = body; // Voix enfantine par défaut

    // Validation des entrées
    if (!text || text.trim().length === 0) {
      const error: ApiError = {
        error: "Le texte est requis pour générer l'audio",
      };
      return Response.json(error, { status: 400 });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      const error: ApiError = { error: "Clé API ElevenLabs manquante" };
      return Response.json(error, { status: 500 });
    }

    // Limitation de la longueur du texte (ElevenLabs gratuit = 10k caractères/mois)
    if (text.length > 2000) {
      console.warn(`⚠️ Texte tronqué: ${text.length} -> 2000 caractères`);
    }

    const truncatedText = text.substring(0, 2000);

    console.log(
      `🎵 Génération audio ElevenLabs - ${truncatedText.length} caractères`
    );

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: truncatedText,
          model_id: "eleven_multilingual_v2",
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
      console.error("❌ Erreur ElevenLabs:", response.status, errorText);

      throw new Error(
        `ElevenLabs API error: ${response.status} - ${errorText}`
      );
    }

    const audioBuffer = await response.arrayBuffer();

    console.log(`✅ Audio généré: ${audioBuffer.byteLength} bytes`);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="storynix-story.mp3"',
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("❌ Erreur génération audio:", error);

    const apiError: ApiError = {
      error: "Erreur lors de la génération audio",
      details: error instanceof Error ? error.message : "Erreur inconnue",
    };

    return Response.json(apiError, { status: 500 });
  }
}

// Route GET pour tester la configuration
export async function GET() {
  return Response.json({
    message: "API Storynix - Generate Audio",
    status: "active",
    elevenlabs_configured: !!process.env.ELEVENLABS_API_KEY,
    available_characters: "Vérifiez votre quota ElevenLabs",
  });
}
