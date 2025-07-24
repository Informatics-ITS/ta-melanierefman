import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaCirclePlay } from 'react-icons/fa6';

import { Typography } from '../../../../../components/atom/typography';
import { PenelitianProps } from '../../../../../entities/penelitian';
import { useLocalizedRoute } from '../../../../../hooks/useLocalizedRoute';

interface PenelitianDetailGaleriProps {
  currentPenelitian: PenelitianProps;
  variant?: 'white' | 'white2';
}

const PenelitianDetailGaleri: React.FC<PenelitianDetailGaleriProps> = ({
  currentPenelitian,
  variant = 'white2',
}) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();

  const availableImages = Array.isArray(currentPenelitian.documentations)
  ? currentPenelitian.documentations.filter(doc => doc.image)
  : [];

  const randDocImage = availableImages.length > 0
    ? availableImages[Math.floor(Math.random() * availableImages.length)]
    : null;

  const backgroundClass =
    variant === 'white' ? 'bg-typo-white' : 'bg-typo-white2';

  const imageSrc = randDocImage
    ? `${baseUrl}/storage/${randDocImage.image}`
    : '/no-image.png';

  const generateRoute = (routeName: string) =>
    getLocalizedRoute(routeName, {
      title:
        lang === 'id'
          ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+')
          : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
    });

  return (
    <div>
      <div
        className={`${backgroundClass} md:flex flex-row md:flex-col justify-center px-4 lg:px-[140px] py-8 lg:py-16`}
      >
        <div className="mb-4">
          <Typography type="heading4" weight="semibold">
            {t('d_penelitian')}
          </Typography>
          <div className="w-14 h-1 bg-primary" />
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
          {/* Foto */}
          <Link to={generateRoute('foto_penelitian')}>
            <div className="relative overflow-hidden rounded-xl">
              <img
                className="w-full h-[210px] object-cover"
                src={imageSrc}
                alt={randDocImage?.caption || 'Dokumentasi Penelitian'}
              />
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent px-4 py-3 text-white">
                <Typography type="title" weight="semibold">
                  {t('foto')}
                </Typography>
              </div>
            </div>
          </Link>

          {/* Video */}
          <Link to={generateRoute('video_penelitian')}>
            <div className="relative overflow-hidden rounded-xl">
              <img
                className="w-full h-[210px] object-cover"
                src={imageSrc}
                alt={randDocImage?.caption || 'Dokumentasi Penelitian'}
              />
              <div className="absolute inset-0 bg-black/30 z-10" />
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <FaCirclePlay className="text-white text-5xl group-hover:scale-110 transition-transform opacity-75" />
              </div>
              <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent px-4 py-3 text-white z-40">
                <Typography type="title" weight="semibold">
                  {t('video')}
                </Typography>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PenelitianDetailGaleri;