import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Typography } from '../../atom/typography';

import { PenelitianProps } from '../../../entities/penelitian';

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';
import { useFormatDate } from '../../../hooks/useFormatDate';

type ResearchCardProps = {
  data: PenelitianProps;
};

const ResearchCard: React.FC<ResearchCardProps> = ({ data }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();
  const { formatDate } = useFormatDate();

  const formattedDate = formatDate(data.created_at ?? '', lang);
  const title =
    lang === 'id' ? data.judul ?? 'Data tidak tersedia' : data.title ?? 'Data not available';

  const linkTo = getLocalizedRoute('detail_penelitian', {
    title: title.toLowerCase().replace(/\s+/g, '+'),
  });

  const imageUrl = data.documentations?.[0]?.image
    ? `${import.meta.env.VITE_API_BASE_URL}/storage/${data.documentations[0].image}`
    : "/no-image.png";

  return (
    <div className="relative w-full md:aspect-[3/4] aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 border border-typo-outline">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent flex flex-col justify-center text-white p-4">
        <Typography type="caption1" font="dm-sans" className="mt-16">
          {formattedDate}
        </Typography>
        <Link to={linkTo}>
          <Typography type="title" weight="semibold" className="line-clamp-3 !leading-tight">
            {title}
          </Typography>
        </Link>
      </div>
    </div>
  );
};

export default ResearchCard;