import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Typography } from '../../atom/typography';

import { PenelitianProps } from "../../../entities/penelitian";
import { ProgresPenelitianProps } from "../../../entities/progres-penelitian";

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';
import { useFormatDate } from '../../../hooks/useFormatDate';

type CardProps = {
  data: ProgresPenelitianProps | PenelitianProps;
  parentData: { judul: string; title: string };
};

const HighlightCard: React.FC<CardProps> = ({ data, parentData }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();
  const { formatDate } = useFormatDate();

  const isProgressData = (data: any): data is ProgresPenelitianProps => {
    return (data as ProgresPenelitianProps).research_id !== undefined;
  };

  const formattedDate = formatDate(data.created_at ?? "", lang);

  const title = isProgressData(data)
  ? lang === 'id' ? data.judul_progres || 'Data tidak tersedia' : data.title_progress || 'Data not available'
  : lang === 'id' ? data.judul || 'Data tidak tersedia' : data.title || 'Data not available';

  const description = lang === 'id' 
  ? data.deskripsi || 'Data tidak tersedia' 
  : data.description || 'Data not available';

  const linkTo = isProgressData(data)
    ? getLocalizedRoute('progres_penelitian', {
        title: (lang === 'id' ? parentData?.judul ?? 'data-not-available' : parentData?.title ?? 'data-not-available')
          .toLowerCase()
          .replace(/\s+/g, '+'),
        progressTitle: (lang === 'id' ? data.judul_progres ?? 'data-not-available' : data.title_progress ?? 'data-not-available')
          .toLowerCase()
          .replace(/\s+/g, '+'),
      })
    : getLocalizedRoute('detail_penelitian', {
        title: (lang === 'id' ? data.judul ?? 'data-not-available' : data.title ?? 'data-not-available')
          .toLowerCase()
          .replace(/\s+/g, '+'),
      });

  const imageUrl = (() => {
    if (isProgressData(data)) {
      const sortedImages = Array.isArray(data.progress_images)
        ? data.progress_images
            .filter(img => !!img.image)
            .sort((a, b) => a.index_order - b.index_order)
        : [];

      if (sortedImages && sortedImages.length > 0) {
        return `${import.meta.env.VITE_API_BASE_URL}/storage/${sortedImages[0].image}`;
      }
    } else {
      const firstDocImage = data.documentations?.[0]?.image;
      if (firstDocImage) {
        return `${import.meta.env.VITE_API_BASE_URL}/storage/${firstDocImage}`;
      }
    }

    return "/no-image.png";
  })();

  return (
    <div className="relative mb-4 rounded-xl overflow-hidden">
      <img
        className="w-full aspect-[4/3] md:h-[435px] object-cover"
        src={imageUrl}
      />
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparen justify-center text-typo-white p-4">
        <div className="mt-16">
          <Typography type="caption1" font="dm-sans" weight="regular">
            {formattedDate}
          </Typography>
          <Link to={linkTo}>
            <Typography type="title" weight="semibold" className="line-clamp-2">
              {title}
            </Typography>
          </Link>
          <Typography type="caption1" font="dm-sans" weight="regular" className="line-clamp-2">
            {description}
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default HighlightCard;