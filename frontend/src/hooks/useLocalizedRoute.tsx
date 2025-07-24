import { useTranslation } from 'react-i18next';

export const useLocalizedRoute = () => {
  const { t, i18n } = useTranslation();

  const getLocalizedRoute = (key: string, params: Record<string, string> = {}) => {
    let route = t(`routes.${key}`, { lng: i18n.language });

    if (!route) {
      console.error(`Route not found for key: ${key}`);
      return '/';
    }

    Object.keys(params).forEach((param) => {
      route = route.replace(`:${param}`, params[param]);
    });

    return route;
  };

  return getLocalizedRoute;
};
