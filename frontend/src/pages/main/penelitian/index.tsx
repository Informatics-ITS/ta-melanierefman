import { useTranslation } from 'react-i18next';

import { Typography } from '../../../components/atom/typography';
import Loading from '../../../components/atom/loading';
import SearchBar from "../../../components/molecule/form/search";
import Pagination from "../../../components/molecule/pagination";
import CardYear from '../../../components/molecule/card/year-card';
import ResearchCard from '../../../components/molecule/card/research-card';

import { PenelitianProps } from "../../../entities/penelitian";

import { useFetchData } from '../../../hooks/crud/useFetchData';
import useSearch from '../../../hooks/useSearch';
import usePagination from '../../../hooks/usePagination';

const Penelitian: React.FC = () => {
  const itemsPerPage = 3;
  const { t } = useTranslation();

  const { data, loading } = useFetchData<PenelitianProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/research`);
  
  const processedData = Array.isArray(data)
  ? data
      .filter((research: PenelitianProps) =>
        research?.created_at && !isNaN(new Date(research.created_at).getTime())
      )
      .map((research: PenelitianProps) => ({
        ...research,
        documentation: research.documentations || [],
        created_at_date: new Date(research.created_at),
      }))
      .sort((a, b) => b.created_at_date.getTime() - a.created_at_date.getTime())
  : [];


  const { handleSearch, filteredData } = useSearch(processedData, (item) => `${item.title} ${item.judul}`);
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div>
      {/* Hero */}
      <div className="pt-16">
        <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
          {/* Image Background */}
          <img
            src="/view6.png"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay & Content */}
          <div className="absolute bottom-0 h-[6rem] md:h-[8rem] bg-gradient-to-t from-black to-transparent flex flex-col justify-center text-white w-full">
            <Typography type="heading1" weight="semibold" className="px-4 lg:px-[140px]">
              {t('penelitian')}
            </Typography>
          </div>
        </div>
      </div>
      <div className="space-y-8 pt-8 px-4 lg:px-[140px] pb-8 md:pb-16">
        <div className="flex flex-col lg:gap-12 gap-4 md:flex-row">
          <div className="space-y-8 w-full md:w-3/4 md:mr-4">
            <SearchBar placeholder={t('cari')} onSearch={handleSearch} />
            <div>
              {filteredData.length > 0 ? (
                <>
                  <ResearchCard data={paginatedData} />
                  <Pagination
                    currentPage={currentPage}
                    totalItems={filteredData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setPage}
                  />
                </>
              ) : (
                <div className="flex justify-center items-center w-full py-12">
                  <Typography type="body" font="dm-sans" className="text-typo-secondary text-center">
                    {t('data_belum_tersedia')}
                  </Typography>
                </div>
              )}
            </div>
          </div>
          {processedData.length > 0 && (
            <div className="space-y-3 w-full md:w-1/4 mt-4 md:mt-0">
              <div className="underline decoration-primary decoration-2">
                <Typography type="heading6" weight="semibold">
                  {t('penelitian_tahun')}
                </Typography>
              </div>
              <CardYear data={processedData} showResearch={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Penelitian;