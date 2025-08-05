import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const authToken = sessionStorage.getItem('storynix_auth');
      setIsAuthenticated(authToken === 'authenticated');
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    sessionStorage.removeItem('storynix_auth');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, loading, logout };
}
