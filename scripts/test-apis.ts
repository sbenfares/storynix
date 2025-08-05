#!/usr/bin/env node

/**
 * Script de test des APIs Storynix
 * Usage: pnpm run test:apis
 */

const baseUrl = process.env.TEST_URL || 'http://localhost:3000';

async function testAPI(endpoint: string, description: string): Promise<void> {
  try {
    console.log(`🧪 Test: ${description}`);
    const response = await fetch(`${baseUrl}${endpoint}`);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${endpoint} - OK`);
      console.log('📊 Response:', data);
    } else {
      console.log(`❌ ${endpoint} - Error ${response.status}`);
      console.log('📊 Error:', data);
    }
    console.log('---');
  } catch (error) {
    console.log(`💥 ${endpoint} - Network Error`);
    console.log(
      '📊 Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    console.log('---');
  }
}

async function testStoryGeneration(): Promise<void> {
  try {
    console.log('🧪 Test: Story Generation');
    const response = await fetch(`${baseUrl}/api/generate-story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        childName: 'Test',
        universe: 'pirates',
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Story Generation - OK');
      console.log('📖 Title:', data.title);
      console.log('📊 Content length:', data.content?.length || 0);
      console.log('📚 Chapters:', data.chapters?.length || 0);
    } else {
      console.log('❌ Story Generation - Error');
      console.log('📊 Error:', data);
    }
    console.log('---');
  } catch (error) {
    console.log('💥 Story Generation - Network Error');
    console.log(
      '📊 Error:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    console.log('---');
  }
}

async function main(): Promise<void> {
  console.log('🚀 Storynix API Tests');
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log('===========================\n');

  // Test des endpoints GET
  await testAPI('/api/generate-story', 'Story API Status');
  await testAPI('/api/generate-audio', 'Audio API Status');

  // Test de génération d'histoire (si les clés API sont configurées)
  if (process.env.OPENAI_API_KEY) {
    await testStoryGeneration();
  } else {
    console.log(
      '⚠️ OPENAI_API_KEY non configurée - Skip story generation test'
    );
  }

  console.log('🏁 Tests terminés');
  console.log('\n💡 Pour tester complètement:');
  console.log('1. Configure tes clés API dans .env.local');
  console.log('2. Lance pnpm dev');
  console.log('3. Relance pnpm run test:apis');
}

// Exécution
main().catch((error: unknown) => {
  console.error(
    '💥 Erreur fatale:',
    error instanceof Error ? error.message : 'Unknown error'
  );
  process.exit(1);
});
