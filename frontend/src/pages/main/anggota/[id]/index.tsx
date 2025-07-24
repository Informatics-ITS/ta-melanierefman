import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Typography } from '../../../../components/atom/typography';
import Loading from '../../../../components/atom/loading';
import Breadcrumb from '../../../../components/molecule/breadcrumb';
import Card from '../../../../components/molecule/card/card-info';

import { AnggotaProps } from "../../../../entities/anggota";

import { useFetchData } from '../../../../hooks/crud/useFetchData';
import { useLocalizedRoute } from '../../../../hooks/useLocalizedRoute';

const AnggotaDetail: React.FC = () => {
  const { nama } = useParams<{ nama: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();

  const { data: anggotaData, loading } = useFetchData<AnggotaProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/members`);
  const anggota = anggotaData?.find(
    (item) => item.name.toLowerCase().replace(/\s+/g, '+') === nama
  );

  const breadcrumbItems = [
    { label: t('beranda'), path: '/' },
    { label: t('anggota'), path: getLocalizedRoute('anggota') },
    {
      label: anggota ? anggota.name : t('unk'),
      path: anggota
        ? getLocalizedRoute('detail_anggota', {
            nama: anggota.name.toLowerCase().replace(/\s+/g, '+'),
          })
        : '#',
    },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;
  if (!anggota) return null;

  const roleMapping: Record<AnggotaProps['role'], { id: string; en: string }> = {
    researcher: { id: 'Peneliti', en: 'Researcher' },
    postdoc: { id: 'Postdoctoral', en: 'Postdoctoral' },
    'research assistant': { id: 'Asisten Riset', en: 'Research Assistant' },
    student: { id: 'Mahasiswa', en: 'Student' },
    alumni: { id: 'Alumni', en: 'Alumni' },
  };  

  const hasValidEducation = Array.isArray(anggota.members_education) &&
  anggota.members_education.some(
    (edu) =>
      (edu.degree && edu.degree.trim() !== '') ||
      (edu.major && edu.major.trim() !== '') ||
      (edu.university && edu.university.trim() !== '')
  );

  return (
    <div className="space-y-2 pt-[100px] md:pt-[120px] px-4 lg:px-[140px] pb-8 md:pb-16">
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-col md:flex-row md:gap-4">
        <div className="md:w-2/3">
          <Typography type="heading5" weight="bold" className="text-typo">
            {anggota.name}
          </Typography>
          <Typography type="title" weight="semibold" className="text-primary first-letter:uppercase">
          {anggota.is_head
            ? t('ketua')
            : `${roleMapping[anggota.role]?.[lang as 'id' | 'en'] || anggota.role}${anggota.is_alumni ? ' (Alumni)' : ''}`}
          </Typography>

          <div className="block md:hidden pt-4 space-y-4">
            <img
              className="w-full aspect-[16/9] object-cover mb-2 rounded-xl border border-typo-outline"
              src={anggota.image? `${import.meta.env.VITE_API_BASE_URL}/storage/${anggota.image}` : "/no-image.png"}               
              alt={`${anggota.name}'s documentation image`}
            />

            {!anggota.role.includes('student') && (anggota.phone || anggota.email) && (
              <Card
                title={t('info_kontak')}
                content={{
                  ...(anggota.phone && { [t('telp')]: anggota.phone }),
                  ...(anggota.email && { Email: anggota.email }),
                }}
              />
            )}
          </div>

          {!anggota.role.includes('student') && anggota.members_expertise.length > 0 && (
            <div className="mt-4">
              <div className="underline decoration-primary decoration-2 mb-2">
                <Typography type="title" weight="semibold">
                  {t('expertise')}
                </Typography>
              </div>
              <ul className="list-disc pl-5">
                {anggota.members_expertise.map((keahlian, index) => (
                  <li key={index}>
                    <Typography type="body" font="dm-sans" weight="regular">
                      {lang === 'id' ? keahlian.keahlian : keahlian.expertise}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!anggota.role.includes('student') && hasValidEducation && (
            <div className="mt-4">
              <div className="underline decoration-primary decoration-2 mb-2">
                <Typography type="title" weight="semibold">
                  {t('pendidikan')}
                </Typography>
              </div>
              <ul className="list-disc pl-5">
                {anggota.members_education.map((edu, index) => (
                  <li key={index}>
                    <Typography type="body" font="dm-sans" weight="regular">
                      {edu.degree} - {edu.major}, {edu.university}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {anggota.role.includes('student') && hasValidEducation && (
            <div className="mt-4">
              <div className="underline decoration-primary decoration-2 mb-2">
                <Typography type="title" weight="semibold">
                  {t('pendidikan')}
                </Typography>
              </div>
              <ul className="list-disc pl-5">
                {anggota.members_education.map((edu, index) => (
                  <li key={index}>
                    <Typography type="body" font="dm-sans" weight="regular">
                      {edu.major} - {edu.university}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {!anggota.role.includes('student') && (anggota.scopus_link || anggota.scholar_link) && (
            <div className="mt-4">
              <div className="underline decoration-primary decoration-2 mb-2">
                <Typography type="title" weight="semibold">
                  {t('publikasi')}
                </Typography>
              </div>
              <ul className="list-disc pl-5">
                  <li>
                    <a href={anggota.scopus_link ? anggota.scopus_link : '#'} target="_blank" rel="noopener noreferrer">
                      <Typography type="body" font="dm-sans" weight="regular" className="text-secondary hover:underline">
                        Scopus
                      </Typography>
                    </a>
                  </li>
                  <li>
                    <a href={anggota.scholar_link ? anggota.scholar_link : '#'} target="_blank" rel="noopener noreferrer">
                      <Typography type="body" font="dm-sans" weight="regular" className="text-secondary hover:underline">
                        Google Scholar
                      </Typography>
                    </a>
                  </li>
              </ul>
            </div>
          )}

          {!anggota.role.includes('student') && anggota.research?.length > 0 && (
            <div className="mt-4">
              <div className="underline decoration-primary decoration-2 mb-2">
                <Typography type="title" weight="semibold">
                  {t('penelitian')}
                </Typography>
              </div>
              <ul className="list-disc pl-5">
                {anggota.research.map((research) => (
                  <li key={research.id}>
                    <a
                      href={getLocalizedRoute('detail_penelitian', {
                        title: (lang === 'id' ? research.judul ?? 'data-not-available' : research.title ?? 'data-not-available')
                          .toLowerCase()
                          .replace(/\s+/g, '+'),
                      })}
                      className="text-secondary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Typography type="body" font="dm-sans" weight="regular">
                        {lang === "id" ? research.judul : research.title}
                      </Typography>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {anggota.role.includes('student') && (
            <div className="mt-4">
              <div className="underline decoration-primary decoration-2 mb-2">
                <Typography type="title" weight="semibold">
                  {t('tugas_akhir')}
                </Typography>
              </div>
              <Typography type="body" font="dm-sans" weight="regular">
                {lang === "id" ? anggota.judul_project : anggota.project_title}
              </Typography>
            </div>
          )}
        </div>
        <div className="hidden md:block md:w-1/3">
          <img
            className="w-full aspect-[16/9] object-cover mb-2 rounded-xl border border-typo-outline"
            src={anggota.image? `${import.meta.env.VITE_API_BASE_URL}/storage/${anggota.image}` : "/no-image.png"}               
            alt={`${anggota.name}'s documentation image`}
          />
          {!['student', 'alumni'].includes(anggota.role) && (anggota.phone || anggota.email) && (
            <Card
              title={t('info_kontak')}
              content={{
                ...(anggota.phone && { [t('telp')]: anggota.phone }),
                ...(anggota.email && { Email: anggota.email }),
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AnggotaDetail;