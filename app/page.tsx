'use client';

import React, { useState, useRef } from 'react';
import {
  Download,
  Loader2,
  Play,
  Pause,
  User,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { Universe, Story, UniverseId } from '@/types';

// Interface pour les options de voix
interface VoiceOption {
  id: string;
  name: string;
  emoji: string;
}

export default function StorynixHome() {
  const [childName, setChildName] = useState<string>('');
  const [selectedUniverse, setSelectedUniverse] = useState<UniverseId | ''>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedStory, setGeneratedStory] = useState<Story | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('child_female');
  const [error, setError] = useState<string | null>(null);

  // Référence pour l'audio
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Options de voix disponibles
  const voiceOptions: VoiceOption[] = [
    {
      id: 'child_female',
      name: 'Voix enfantine féminine',
      emoji: '👧',
    },
    {
      id: 'child_male',
      name: 'Voix enfantine masculine',
      emoji: '👦',
    },
    {
      id: 'adult_female',
      name: 'Narratrice adulte',
      emoji: '👩',
    },
    {
      id: 'adult_male',
      name: 'Narrateur adulte',
      emoji: '👨',
    },
  ];

  const universes: Universe[] = [
    {
      id: 'pirates',
      name: 'Pirates',
      emoji: '🏴‍☠️',
      description: 'Aventures en haute mer avec des trésors cachés',
    },
    {
      id: 'animals',
      name: 'Animaux',
      emoji: '🦁',
      description: 'Rencontres magiques avec les animaux de la forêt',
    },
    {
      id: 'space',
      name: 'Espace',
      emoji: '🚀',
      description: 'Explorations cosmiques et planètes mystérieuses',
    },
    {
      id: 'fairy',
      name: 'Fées',
      emoji: '🧚‍♀️',
      description: 'Magie et enchantements dans un monde féerique',
    },
    {
      id: 'ninja',
      name: 'Ninja',
      emoji: '🥷',
      description: 'Arts martiaux et missions secrètes au Japon',
    },
  ];

  const generateStory = async (): Promise<void> => {
    if (!childName.trim() || !selectedUniverse) {
      setError('Veuillez renseigner le prénom et choisir un univers');
      return;
    }

    setIsGenerating(true);
    setGeneratedStory(null);
    setAudioUrl(null);
    setError(null);

    try {
      // 1. Générer l'histoire avec ChatGPT
      console.log("🎬 Génération de l'histoire...");
      const storyResponse = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: childName.trim(),
          universe: selectedUniverse,
        }),
      });

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json();
        throw new Error(
          errorData.error || "Erreur lors de la génération de l'histoire"
        );
      }

      const story: Story = await storyResponse.json();
      setGeneratedStory(story);
      console.log('✅ Histoire générée:', story.title);

      // 2. Générer l'audio avec ElevenLabs
      console.log("🎵 Génération de l'audio...");
      const audioResponse = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: story.content,
          voiceId: selectedVoice,
        }),
      });

      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(
          errorData.error || 'Erreur lors de la génération audio'
        );
      }

      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
      console.log('✅ Audio généré avec succès');
    } catch (error) {
      console.error('❌ Erreur:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Une erreur inconnue est survenue'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = (): void => {
    if (!audioUrl) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const newAudio = new Audio(audioUrl);
      newAudio.onended = () => setIsPlaying(false);
      newAudio.play().catch(err => console.error('Erreur lecture audio:', err));
      audioRef.current = newAudio;
      setIsPlaying(true);
    }
  };

  const downloadPack = async (): Promise<void> => {
    if (!generatedStory || !audioUrl) return;

    try {
      // Import dynamique de JSZip
      const JSZip = (await import('jszip')).default;
      const { saveAs } = await import('file-saver');

      const zip = new JSZip();

      // 1. Ajouter le texte de l'histoire
      zip.file(`${generatedStory.title}.txt`, generatedStory.content);

      // 2. Ajouter l'audio
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();
      zip.file(`${generatedStory.title}.mp3`, audioBlob);

      // 3. Ajouter les métadonnées pour Lunii
      const metadata = {
        title: generatedStory.title,
        description: `Histoire personnalisée pour ${childName}`,
        author: 'Storynix',
        chapters: generatedStory.chapters || [],
        created: new Date().toISOString(),
        version: '1.0',
      };
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));

      // 4. Instructions d'installation
      const instructions = `📱 PACK STORYNIX - ${generatedStory.title}

🎯 CONTENU DU PACK :
- ${generatedStory.title}.mp3 (fichier audio principal)
- ${generatedStory.title}.txt (texte de l'histoire)
- metadata.json (informations techniques)

📋 INSTRUCTIONS D'INSTALLATION :

1. 📥 Téléchargez Lunii Studio :
   → Rendez-vous sur https://studio.lunii.com/
   → Téléchargez et installez le logiciel gratuit

2. 🔗 Connectez votre Lunii :
   → Allumez votre boîtier Lunii
   → Connectez-le à votre ordinateur via USB

3. 📂 Importez l'histoire :
   → Ouvrez Lunii Studio
   → Cliquez sur "Ajouter du contenu"
   → Sélectionnez les fichiers de ce pack
   → Suivez les instructions à l'écran

4. 🔄 Synchronisez :
   → Cliquez sur "Synchroniser"
   → Attendez la fin du transfert
   → Déconnectez votre Lunii

5. 🎉 Profitez :
   → L'histoire apparaît maintenant sur votre boîtier !
   → Sélectionnez-la et écoutez !

✨ Créé avec amour par Storynix
🌟 Pour plus d'histoires : https://storynix.com`;

      zip.file('INSTRUCTIONS.txt', instructions);

      // 5. Générer et télécharger le ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = `storynix-${childName.toLowerCase().replace(/\s+/g, '-')}-${selectedUniverse}.zip`;
      saveAs(zipBlob, fileName);

      console.log('✅ Pack ZIP téléchargé:', fileName);
    } catch (error) {
      console.error('❌ Erreur création ZIP:', error);
      setError('Erreur lors de la création du pack. Veuillez réessayer.');
    }
  };

  const handleUniverseSelect = (universeId: UniverseId): void => {
    setSelectedUniverse(universeId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <BookOpen className="text-indigo-600" size={40} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Storynix
            </h1>
            <Sparkles className="text-purple-500" size={40} />
          </div>
          <p className="text-xl text-gray-600 font-medium">
            Des histoires audio magiques et personnalisées pour vos enfants
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Compatible avec votre boîtier Lunii ✨
          </p>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 font-medium">❌ {error}</p>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Prénom */}
            <div>
              <label className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4">
                <User className="text-indigo-500" size={22} />
                Prénom de l'enfant
              </label>
              <input
                type="text"
                value={childName}
                onChange={e => setChildName(e.target.value)}
                placeholder="Ex: Emma, Louis, Chloé..."
                className="w-full px-4 py-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg font-medium transition-colors text-gray-800 placeholder-gray-400"
                disabled={isGenerating}
                maxLength={20}
              />
            </div>

            {/* Choix de voix */}
            <div>
              <label className="text-lg font-semibold text-gray-700 mb-4 block">
                🎙️ Choix de la voix
              </label>
              <div className="space-y-2">
                {voiceOptions.map((voice: VoiceOption) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    disabled={isGenerating}
                    className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      selectedVoice === voice.id
                        ? 'border-indigo-500 bg-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{voice.emoji}</span>
                      <span className="font-medium text-gray-800">
                        {voice.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Univers */}
          <div className="mt-8">
            <label className="text-lg font-semibold text-gray-700 mb-4 block">
              Choisis ton univers magique
            </label>
            <div className="grid grid-cols-2 gap-3">
              {universes.slice(0, 4).map(universe => (
                <button
                  key={universe.id}
                  onClick={() =>
                    handleUniverseSelect(universe.id as UniverseId)
                  }
                  disabled={isGenerating}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                    selectedUniverse === universe.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-200'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25 hover:shadow-md'
                  }`}
                >
                  <div className="text-3xl mb-2">{universe.emoji}</div>
                  <div className="font-semibold text-gray-800">
                    {universe.name}
                  </div>
                </button>
              ))}
            </div>
            {/* Ninja en bas */}
            <div className="mt-3">
              <button
                onClick={() => handleUniverseSelect('ninja')}
                disabled={isGenerating}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                  selectedUniverse === 'ninja'
                    ? 'border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-200'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25 hover:shadow-md'
                }`}
              >
                <div className="text-3xl mb-2">🥷</div>
                <div className="font-semibold text-gray-800">Ninja</div>
              </button>
            </div>
          </div>

          {/* Bouton génération */}
          <div className="text-center mt-8">
            <button
              onClick={generateStory}
              disabled={isGenerating || !childName.trim() || !selectedUniverse}
              className="px-10 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={28} />
                  <span>
                    {!generatedStory
                      ? 'Histoire en cours de création...'
                      : 'Audio en cours de création...'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles size={28} />
                  Créer mon histoire magique
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Résultat */}
        {generatedStory && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {generatedStory.title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-8 mb-8 border border-indigo-100">
              <p className="text-gray-700 leading-relaxed text-lg font-medium">
                {generatedStory.content}
              </p>
            </div>

            {/* Chapitres */}
            {generatedStory.chapters && generatedStory.chapters.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📚 Chapitres de l'histoire
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {generatedStory.chapters.map((chapter, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 font-medium">
                        {chapter}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contrôles audio */}
            {audioUrl && (
              <div className="text-center mb-8">
                <button
                  onClick={playAudio}
                  className="flex items-center gap-3 mx-auto px-8 py-4 bg-green-500 text-white font-bold text-lg rounded-xl hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  {isPlaying ? 'Mettre en pause' : 'Écouter'}
                </button>
              </div>
            )}

            {/* Téléchargement */}
            <div className="text-center">
              <button
                onClick={downloadPack}
                disabled={!audioUrl}
                className="flex items-center gap-3 mx-auto px-10 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-bold text-xl rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Download size={28} />
                Télécharger le pack Storynix
              </button>
              <p className="text-sm text-gray-500 mt-4 max-w-md mx-auto">
                Importez ce pack dans <strong>Lunii Studio</strong> puis
                synchronisez avec votre boîtier pour profiter de l'histoire
                personnalisée
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="font-bold text-gray-800 mb-4 text-xl">
            🎯 Comment installer votre histoire Storynix :
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                📥 Installation :
              </h4>
              <ol className="space-y-2 text-gray-600">
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">1.</span>{' '}
                  Téléchargez <strong>Lunii Studio</strong> (gratuit)
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">2.</span> Importez
                  le pack Storynix
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">3.</span>{' '}
                  Connectez votre Lunii
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-indigo-600">4.</span>{' '}
                  Synchronisez et profitez ! 🎉
                </li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                ✨ Avantages Storynix :
              </h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex gap-2">• Histoires 100% personnalisées</li>
                <li className="flex gap-2">• Compatible tous boîtiers Lunii</li>
                <li className="flex gap-2">• Création en moins de 2 minutes</li>
                <li className="flex gap-2">• Contenu adapté aux enfants</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
