export const secureApiCall = async (url: string, options: RequestInit = {}) => {
  const token = sessionStorage.getItem('storynix_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Ajouter le token d'authentification
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
