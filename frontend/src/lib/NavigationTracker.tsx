import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { pagesConfig } from '@/pages.config';
import axios from 'axios';
import { appParams } from '@/lib/app-params';

// Criar cliente axios para logs
const logsClient = axios.create({
  baseURL: '/api' // Ajuste a baseURL conforme sua API
});

// Interceptor para adicionar token de autenticação
logsClient.interceptors.request.use(
  (config) => {
    const token = appParams?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (appParams?.appId) {
      config.headers['X-App-Id'] = appParams.appId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Função para logar atividade do usuário no app
const logUserActivity = async (pageName) => {
  try {
    await logsClient.post('/apps/logs/user-activity', {
      page: pageName,
      timestamp: new Date().toISOString(),
      action: 'page_view'
    });
  } catch (error) {
    // Silenciosamente falha - logging não deve quebrar o app
    if (process.env.NODE_ENV === 'development') {
      console.debug('Logging failed (non-critical):', error.message);
    }
  }
};

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { Pages, mainPage } = pagesConfig;
    const mainPageKey = mainPage ?? Object.keys(Pages)[0];

    // Log user activity when navigating to a page
    useEffect(() => {
        // Extract page name from pathname
        const pathname = location.pathname;
        let pageName;

        if (pathname === '/' || pathname === '') {
            pageName = mainPageKey;
        } else {
            // Remove leading slash and get the first segment
            const pathSegment = pathname.replace(/^\//, '').split('/')[0];

            // Try case-insensitive lookup in Pages config
            const pageKeys = Object.keys(Pages);
            const matchedKey = pageKeys.find(
                key => key.toLowerCase() === pathSegment.toLowerCase()
            );

            pageName = matchedKey || null;
        }

        if (isAuthenticated && pageName) {
            logUserActivity(pageName);
        }
    }, [location, isAuthenticated, Pages, mainPageKey]);

    return null;
}