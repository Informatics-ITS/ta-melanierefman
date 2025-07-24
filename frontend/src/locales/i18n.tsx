import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './en/translation.json';
import idTranslation from './id/translation.json';

const savedLanguage = localStorage.getItem('i18nextLng') || 'id';

i18n
  .use(initReactI18next)
  .init({
    resources: {
        en: { translation: enTranslation },
        id: { translation: idTranslation },
      },
    lng: savedLanguage,
    fallbackLng: 'id',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;