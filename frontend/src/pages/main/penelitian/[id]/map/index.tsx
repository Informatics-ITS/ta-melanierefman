import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '../../../../../components/atom/typography';

interface PenelitianDetailMapProps {
  latitude: string | null;
  longitude: string | null;
  zoom: number | null;
  variant?: 'white' | 'white2';
}

const PenelitianDetailMap: React.FC<PenelitianDetailMapProps> = ({
  latitude,
  longitude,
  zoom,
  variant = 'white2',
}) => {
  const { t } = useTranslation();

  if (!latitude || !longitude || !zoom) return null;

  const backgroundClass = variant === 'white' ? 'bg-typo-white' : 'bg-typo-white2';

  return (
    <div className={`${backgroundClass} md:flex flex-row md:flex-col justify-center px-4 lg:px-[140px] py-8 lg:py-16`}>
      <div className="mb-4">
        <Typography type="heading4" weight="semibold">
          {t('p_penelitian')}
        </Typography>
        <div className="w-14 h-1 bg-primary" />
      </div>
      <div className="lg:w-2/3 lg:pr-2">
        <div className="w-full md:h-[450px] h-[200px] rounded-xl overflow-hidden border">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.google.com/maps/embed/v1/view?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&center=${latitude || '-6.20876'},${longitude || '106.84513'}&zoom=${zoom || 12}`}
            loading="lazy"
            style={{ border: 0 }}
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default PenelitianDetailMap;