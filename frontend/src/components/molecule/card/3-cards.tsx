import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Typography } from '../../atom/typography';

import { PenelitianProps } from '../../../entities/penelitian';
import { ProgresPenelitianProps } from '../../../entities/progres-penelitian';

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';
import { useFormatDate } from '../../../hooks/useFormatDate';

type ThreeCardsProps = {
  data: (PenelitianProps | ProgresPenelitianProps)[];
  parentData?: { judul: string; title: string };
};

const ThreeCards: React.FC<ThreeCardsProps> = ({ data, parentData }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();
  const { formatDate } = useFormatDate();

  const isProgressData = (item: any): item is ProgresPenelitianProps => {
    return (item as ProgresPenelitianProps).research_id !== undefined;
  };

  return (
    <div className="flex flex-col space-y-4">
      {data.map((item) => {
        const formattedDate = formatDate(item.created_at ?? "", lang);

        const title = isProgressData(item)
        ? lang === 'id' ? item.judul_progres || 'Data tidak tersedia' : item.title_progress || 'Data not available'
        : lang === 'id' ? item.judul || 'Data tidak tersedia' : item.title || 'Data not available';

        const linkTo = isProgressData(item)
          ? getLocalizedRoute('progres_penelitian', {
              title: (lang === 'id' ? parentData?.judul || 'data-not-available' : parentData?.title || 'data-not-available')
                .toLowerCase()
                .replace(/\s+/g, '+'),
              progressTitle: title.toLowerCase().replace(/\s+/g, '+'),
            })
          : getLocalizedRoute('detail_penelitian', {
              title: title.toLowerCase().replace(/\s+/g, '+'),
            });  
        
        const imageUrl = (() => {
          if (isProgressData(item)) {
            const sortedImages = Array.isArray(item.progress_images)
              ? item.progress_images
                  .filter(img => !!img.image)
                  .sort((a, b) => a.index_order - b.index_order)
              : [];
        
            if (sortedImages && sortedImages.length > 0) {
              return `${import.meta.env.VITE_API_BASE_URL}/storage/${sortedImages[0].image}`;
            }
          } else {
            const sortedDocs = Array.isArray(item.documentations)
              ? item.documentations
                  .filter(doc => doc.image && doc.pivot?.is_thumbnail === 1)
                  .sort((a, b) => a.id - b.id)
              : [];

            if (sortedDocs && sortedDocs.length > 0) {
              return `${import.meta.env.VITE_API_BASE_URL}/storage/${sortedDocs[0].image}`;
            }
          }
      
          return "/no-image.png";
        })();
        
        return (
          <div key={item.id} className="flex items-center justify-center w-full gap-4">
            <div className="w-[160px] h-[100px] mb-2 md:mb-0 flex items-center justify-center bg-gray-200 border border-typo-outline overflow-hidden rounded-lg">
              <img 
                className="w-full h-full object-cover bg-gray-200 border border-typo-outline"
                src={imageUrl}
                alt="Preview"
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <Link to={linkTo}>
                <Typography type="paragraph" weight="semibold" className="!leading-tight line-clamp-3">
                  {title}
                </Typography>
              </Link>
              <Typography type="caption1" font="dm-sans" className="text-primary">
                {formattedDate}
              </Typography>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ThreeCards;