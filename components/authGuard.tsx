'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Vérifier si déjà authentifié au chargement
  useEffect(() => {
    const authStatus = sessionStorage.getItem('storynix_auth');
    const authToken = sessionStorage.getItem('storynix_token');

    // Utilisateur authentifié seulement si les deux sont présents
    if (authStatus === 'authenticated' && authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Stocker BOTH l'état d'authentification ET le token
        sessionStorage.setItem('storynix_auth', 'authenticated');
        sessionStorage.setItem('storynix_token', password); // Le token = le code d'accès
        setIsAuthenticated(true);
      } else {
        setError(data.message || 'Mot de passe incorrect');
        setPassword(''); // Vider le champ en cas d'erreur
      }
    } catch (error) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction utilitaire pour déconnecter (optionnel)
  const logout = () => {
    sessionStorage.removeItem('storynix_auth');
    sessionStorage.removeItem('storynix_token');
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md border border-gray-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Lock className="text-indigo-600" size={32} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Storynix
            </h1>
            <Sparkles className="text-purple-500" size={32} />
          </div>
          <p className="text-gray-600 font-medium">
            Accès restreint - Entrez votre code d'accès
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Code d'accès
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Entrez votre code d'accès..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 text-black focus:outline-none text-lg transition-colors pr-12"
                disabled={isLoading}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm font-medium">❌ {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Vérification...
              </div>
            ) : (
              'Accéder à Storynix'
            )}
          </button>
        </form>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            ⚡ Version MVP - Accès limité aux utilisateurs autorisés
          </p>
        </div>
      </div>
    </div>
  );
}
