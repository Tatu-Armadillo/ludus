const API_BASE_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:9090/api';
import { createContext, useState, useContext, useEffect } from 'react';
import { appParams } from '@/lib/app-params';
import axios from 'axios';

const authClient = axios.create({
  baseURL: API_BASE_URL 
});

authClient.interceptors.request.use(
  (config) => {
    const token = appParams.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-App-Id'] = appParams.appId;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const formattedError = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    };
    return Promise.reject(formattedError);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      const response = await axios.get(`/api/apps/public/prod/public-settings/by-id/${appParams.appId}`, {
        headers: {
          'X-App-Id': appParams.appId
        }
      });
      
      setAppPublicSettings(response.data);
      
      if (appParams.token) {
        await checkUserAuth();
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
      }
      setIsLoadingPublicSettings(false);
    } catch (appError) {
      console.error('App state check failed:', appError);
      
      if (appError.status === 403 && appError.data?.extra_data?.reason) {
        const reason = appError.data.extra_data.reason;
        if (reason === 'auth_required') {
          setAuthError({
            type: 'auth_required',
            message: 'Authentication required'
          });
        } else if (reason === 'user_not_registered') {
          setAuthError({
            type: 'user_not_registered',
            message: 'User not registered for this app'
          });
        } else {
          setAuthError({
            type: reason,
            message: appError.message
          });
        }
      } else {
        setAuthError({
          type: 'unknown',
          message: appError.message || 'Failed to load app'
        });
      }
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      
      const response = await authClient.get('/auth/me'); // Ajuste o endpoint conforme sua API
      setUser(response.data);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      
      if (error.status === 401 || error.status === 403) {
        setAuthError({
          type: 'auth_required',
          message: 'Authentication required'
        });
      }
    }
  };

  const logout = async (shouldRedirect = true) => {
    try {
      await authClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      
      if (shouldRedirect) {
        // Redirecionar para página de login
        globalThis.location.href = '/login';
      }
    }
  };

  const navigateToLogin = () => {
    const returnUrl = encodeURIComponent(globalThis.location.href);
    globalThis.location.href = `/login?returnUrl=${returnUrl}`;
  };

  // Função auxiliar para login
  const login = async (email, password) => {
    try {
      const response = await authClient.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      // Armazenar token
      if (token) {
        localStorage.setItem('auth_token', token);
        appParams.token = token;
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      setAuthError(null);
      
      return { success: true, data: response.data };
    } catch (error) {
      setAuthError({
        type: 'login_failed',
        message: error.message || 'Login failed'
      });
      return { success: false, error };
    }
  };

  // Função auxiliar para registro
  const register = async (userData) => {
    try {
      const response = await authClient.post('/auth/register', userData);
      const { token, user: newUser } = response.data;
      
      if (token) {
        localStorage.setItem('auth_token', token);
        appParams.token = token;
      }
      
      setUser(newUser);
      setIsAuthenticated(true);
      setAuthError(null);
      
      return { success: true, data: response.data };
    } catch (error) {
      setAuthError({
        type: 'registration_failed',
        message: error.message || 'Registration failed'
      });
      return { success: false, error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      login,
      register,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};