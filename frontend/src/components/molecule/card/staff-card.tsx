import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Typography } from '../../atom/typography';

import { AnggotaProps } from "../../../entities/anggota";

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';

interface CardListProps {
  data: AnggotaProps[];
}

const Card: React.FC<CardListProps> = ({ data }) => {
  const { t, i18n } = useTranslation(); 
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.id} className="relative w-full">
            <Link to={getLocalizedRoute('detail_anggota', { nama: item.name.toLowerCase().replace(/\s+/g, '+') })}>
              <img
                className="w-full aspect-[16/9] object-cover mb-2 rounded-xl bg-gray-200 border border-typo-outline"
                src={item.image? `${baseUrl}/storage/${item.image}` : "/no-image.png"}               
                alt={`${item.name}'s documentation image`}
              />
            </Link>
            <div className="w-full text-center">
              <Link to={getLocalizedRoute('detail_anggota', { nama: item.name.toLowerCase().replace(/\s+/g, '+') })}>
                <Typography type="body" weight="semibold" className="hover:text-primary">
                  {item.name}
                </Typography>
              </Link>
              <Typography type="caption1" font="dm-sans" weight="regular">
                {item.is_head ? (
                  <span className="block text-primary">{t('ketua')}</span>
                ) : null}

                {item.role === 'student' && item.members_education.length > 0 ? (
                  <span>
                    {item.members_education[0].major}, {item.members_education[0].university}
                  </span>
                ) : item.role === 'alumni' ? (
                  item.members_expertise && item.members_expertise.length > 0 ? (
                    lang === 'id'
                      ? item.members_expertise.slice(0, 2).map((exp, index) => (
                          <span key={index}>
                            {exp.keahlian}
                            {index < 1 && ', '}
                          </span>
                        ))
                      : item.members_expertise.slice(0, 2).map((exp, index) => (
                          <span key={index}>
                            {exp.expertise}
                            {index < 1 && ', '}
                          </span>
                        ))
                  ) : item.members_education.length > 0 ? (
                    <span>
                      {item.members_education[0].major}, {item.members_education[0].university}
                    </span>
                  ) : (
                    <span>No expertise or education listed</span>
                  )
                ) : item.members_expertise && item.members_expertise.length > 0 ? (
                  lang === 'id'
                    ? item.members_expertise.slice(0, 2).map((exp, index) => (
                        <span key={index}>
                          {exp.keahlian}
                          {index < 1 && ', '}
                        </span>
                      ))
                    : item.members_expertise.slice(0, 2).map((exp, index) => (
                        <span key={index}>
                          {exp.expertise}
                          {index < 1 && ', '}
                        </span>
                      ))
                ) : (
                  <span>No expertise listed</span>
                )}
              </Typography>
                {item.role !== 'alumni' && item.email && (
                  <div className="text-secondary flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <Typography type="caption1" font="dm-sans" weight="regular">{item.email}</Typography>
                  </div>
                )}
            </div>
          </div>
        ))
      ) : (
        <div>No members found for this category.</div>
      )}
    </div>
  );
};

export default Card;