import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId } = await request.json();

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Limitation de longueur pour éviter les abus de coût
    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Texte trop long pour la génération audio' },
        { status: 400 }
      );
    }

    // Pour le MVP, retourner un fichier audio mock
    // En production, ici vous feriez l'appel à ElevenLabs/PlayHT

    // Simuler la génération audio
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Créer un buffer audio simple pour test (silence de 10 secondes)
    const sampleRate = 44100;
    const duration = 10; // 10 secondes
    const numSamples = sampleRate * duration;

    // Créer un WAV header simple
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Données audio (silence)
    for (let i = 0; i < numSamples; i++) {
      view.setInt16(44 + i * 2, 0, true);
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Disposition': 'attachment; filename="story.wav"',
      },
    });
  } catch (error) {
    console.error('Erreur génération audio:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la génération audio' },
      { status: 500 }
    );
  }
}
