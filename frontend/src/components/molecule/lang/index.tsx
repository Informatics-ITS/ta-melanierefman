import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { Button } from '../../atom/button';
import { useRouteTranslation } from '../../../hooks/useRouteTranslation';

interface LanguageSwitcherProps {
  onChange?: () => void;
}

export function LanguageSwitcher({ onChange }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { translateRoute, loading } = useRouteTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'id' ? 'en' : 'id';
    
    if (loading) {
      const basicPath = newLang === 'id' ? '/id' : '/en';
      i18n.changeLanguage(newLang);
      localStorage.setItem('i18nextLng', newLang);
      navigate(basicPath);
    } else {
      const translatedPath = translateRoute(newLang, location.pathname);
      i18n.changeLanguage(newLang);
      localStorage.setItem('i18nextLng', newLang);
      navigate(translatedPath);
    }

    if (onChange) {
      onChange();
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Globe className="text-white mr-2" />
      <Button 
        variant="lang" 
        className="uppercase" 
        onClick={toggleLanguage}
      >
        {(i18n.language === 'id' ? 'ID' : 'EN')}
      </Button>
    </div>
  );
}