import { useTranslation } from 'react-i18next';

import { Typography } from '../../../../components/atom/typography';
import Loading from '../../../../components/atom/loading';
import SearchBar from "../../../../components/molecule/form/search";
import Breadcrumb from '../../../../components/molecule/breadcrumb';
import Video from "../../../../components/molecule/video";

import { MateriProps } from "../../../../entities/materi";

import useSearch from '../../../../hooks/useSearch';
import { useLocalizedRoute } from '../../../../hooks/useLocalizedRoute';
import { useFetchData } from '../../../../hooks/crud/useFetchData';

const MateriVideo: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();

  const { data: materiData, loading } = useFetchData<MateriProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/lecturers`);

  const videoData = materiData?.filter((item) => item.type === 'video') || [];
  const { handleSearch, filteredData } = useSearch(videoData, (item) => `${item.title} ${item.judul}`);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  const breadcrumbItems = [
    { label: t('beranda'), path: '/' },
    { label: t('materi'), path: getLocalizedRoute('materi') },
    { label: t('video'), path: '' },
  ];

  return (
    <div className="space-y-4 pt-[100px] md:pt-[120px] px-4 lg:px-[140px] pb-8 md:pb-16">
      <div>
        <Breadcrumb items={breadcrumbItems} />
        <div className="mt-2 mb-4">
          <Typography type="heading5" weight="semibold">
            {t('video_materi')}
          </Typography>
          <div className="w-10 h-1 bg-primary" />
        </div>
      </div>
      <SearchBar placeholder={t('cari')} onSearch={handleSearch} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.id || item.title} className="space-y-2 card rounded-none">
              <Video
                video={{
                  id: item.id || 0,
                  youtube_link: item.youtube_link ?? null,
                  judul: lang === "id" ? item.judul : item.title,
                }}
                isDeleting={false}
              />
            </div>
          ))
        ) : (
          <div className="flex justify-center items-center w-full py-12">
            <Typography type="body" font="dm-sans" className="text-typo-secondary text-center">
              {t('data_belum_tersedia')}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default MateriVideo;