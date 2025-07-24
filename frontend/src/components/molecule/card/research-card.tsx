import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import { Typography } from '../../atom/typography';
import { Button } from '../../atom/button';

import { PenelitianProps } from "../../../entities/penelitian";

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';
import { useFormatDate } from '../../../hooks/useFormatDate';

interface CardProps {
  data: PenelitianProps[];
}

const Card: React.FC<CardProps> = ({ data }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();
  const { formatDate } = useFormatDate();

  return (
    <div className='w-full max-w-full'>
      {data.map((item) => {
        const formattedDate = formatDate(item.created_at, lang);

        const thumbnailDocumentation = item.documentations?.find(doc => doc.pivot?.is_thumbnail === 1);
        const firstDocumentation = thumbnailDocumentation || item.documentations?.[0];
        const firstImage = firstDocumentation?.image;
        const imagePath = firstImage ? `${baseUrl}/storage/${firstImage}` : undefined;

        return (
          <div key={item.id} className="items-center mb-4">
            <div className="md:flex">
              <div className="md:w-[180px] w-full h-[160px] mr-4 mb-2 md:mb-0 flex bg-gray-200 border border-typo-outline rounded-lg items-center justify-center">
                <img
                  className="w-full h-full object-cover rounded-lg border border-typo-outline"
                  src={imagePath || "/no-image.png"}
                  alt={item.title}
                />
              </div>
              <div className="flex flex-col justify-between w-full md:w-5/6">
                <div className="space-y-1 md:mb-0">
                  <Link to={getLocalizedRoute('detail_penelitian', { 
                      title: lang === 'id' 
                        ? item.judul.toLowerCase().replace(/\s+/g, '+') 
                        : item.title.toLowerCase().replace(/\s+/g, '+'),
                    })}>
                    <Typography type="paragraph" weight="semibold" className="text-typo line-clamp-2 !leading-tight">
                      {lang === "id" ? item.judul : item.title}
                    </Typography>
                  </Link>
                  <Typography type="caption1" font="dm-sans" className="text-primary">
                    {formattedDate}
                  </Typography>
                  <div className="text-typo line-clamp-3">
                    <Typography type="caption1" font="dm-sans">
                      {lang === "id" ? item.deskripsi : item.description}
                    </Typography>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button 
                    to={getLocalizedRoute('detail_penelitian', { 
                      title: lang === 'id' 
                        ? item.judul.toLowerCase().replace(/\s+/g, '+') 
                        : item.title.toLowerCase().replace(/\s+/g, '+'),
                    })}
                    key={item.id}
                    variant="underline"
                  >
                    {t('button.selengkapnya1')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Card;