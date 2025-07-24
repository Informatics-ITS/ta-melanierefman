import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { Typography } from '../../../components/atom/typography';
import { Button } from '../../../components/atom/button';
import Loading from '../../../components/atom/loading/index.tsx';
import Doc from '../../../components/molecule/card/file/doc-card.tsx';
import SearchBar from "../../../components/molecule/form/search";
import Pagination from "../../../components/molecule/pagination/index.tsx";
import Video from '../../../components/molecule/video/index.tsx';

import { MateriProps } from "../../../entities/materi";

import { useFetchData } from '../../../hooks/crud/useFetchData';
import useSearch from '../../../hooks/useSearch';
import usePagination from '../../../hooks/usePagination';

const Materi: React.FC = () => {
  const itemsPerPage = 9;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'lecturer';
  const [activeBagian, setActiveBagian] = useState<string>(defaultTab);

  useEffect(() => {
    setSearchParams({ tab: activeBagian });
  }, [activeBagian, setSearchParams]);

  const { data: materiData, loading } = useFetchData<MateriProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/lecturers`);

  useEffect(() => {
      if (location.hash) {
        const elementId = location.hash.replace('#', '');
        const el = document.getElementById(elementId);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'auto' });
          }, 200);
        }
      }
    }, [location.hash, materiData]);

  const fileData = Array.isArray(materiData)
    ? materiData.filter(
        (item) => item.type === "file" && item.doc_type === activeBagian
      )
    : [];

  const { handleSearch, filteredData } = useSearch(fileData, (item) => `${item.title} ${item.judul}`);
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  const latestVideos = Array.isArray(materiData)
    ? materiData
        .filter(item => item?.type === "video" && item?.created_at && !isNaN(new Date(item.created_at).getTime()))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
    : [];

  return (
    <div>
      {/* Hero */}
      <div className="pt-16">
        <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
          {/* Image Background */}
          <img
            src="/view7.png"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay & Content */}
          <div className="absolute bottom-0 h-[6rem] md:h-[8rem] bg-gradient-to-t from-black to-transparent flex flex-col justify-center text-white w-full">
            <Typography type="heading1" weight="semibold" className="px-4 lg:px-[140px]">
              {t('materi')}
            </Typography>
          </div>
        </div>
      </div>
      <div id="doc" className="space-y-4 pt-8 px-4 lg:px-[140px] py-8 lg:py-16">
        <div className="mb-8">
          <Typography type="heading4" weight="semibold">
            {t('doc_materi')}
          </Typography>
          <div className="w-14 h-1 bg-primary" />
        </div>
        <div>
          <div className="flex overflow-x-auto whitespace-nowrap space-x-4 mb-2">
            {[
              { label: t('materi_belajar'), value: 'lecturer' },
              { label: t('petunjuk_teknis'), value: 'guideline' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveBagian(tab.value)}
                className={`${activeBagian === tab.value ? 'text-primary font-dm-sans font-bold' : 'text-typo-secondary font-dm-sans hover:text-primary font-medium'} uppercase`}
              >
                <Typography type="button" font="dm-sans" weight={activeBagian === tab.value ? 'bold' : 'medium'}>
                  {tab.label}
                </Typography>
              </button>
            ))}
          </div>
          <span className="block border-t-2 border-typo-outline w-full"></span>
        </div>
        <SearchBar placeholder={t('cari')} onSearch={handleSearch} />
        {filteredData.length > 0 ? (
          <>
            <Doc data={paginatedData} />
            <Pagination
              currentPage={currentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="flex justify-center items-center py-12">
            <Typography type="body" font="dm-sans" className="text-typo-secondary text-center">
              {t('data_belum_tersedia')}
            </Typography>
          </div>
        )}
      </div>
      <div className="bg-typo-white2 space-y-8 px-4 lg:px-[140px] py-8 lg:py-16">
        <div className="flex items-center justify-between">
          <div>
            <Typography type="heading4" weight="semibold">
              {t('video_materi')}
            </Typography>
            <div className="w-14 h-1 bg-primary" />
          </div>
          <Button to={t('routes.materi_video')} variant='outline'>{t('button.selengkapnya2')}</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {latestVideos.length > 0 ? (
            latestVideos.map((item) => (
              <Video
                key={item.id}
                video={{
                  id: item.id,
                  youtube_link: item.youtube_link ?? null,
                  judul: lang === "id" ? item.judul : item.title,
                }}
                isDeleting={false}
              />
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
    </div>
  );
};

export default Materi;