import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Typography } from '../../../../components/atom/typography';
import Loading from '../../../../components/atom/loading';
import SearchBar from "../../../../components/molecule/form/search";
import Pagination from "../../../../components/molecule/pagination";
import Breadcrumb from '../../../../components/molecule/breadcrumb'; 
import ResearchCard from '../../../../components/molecule/card/research-card';

import { PenelitianProps } from "../../../../entities/penelitian";

import { useLocalizedRoute } from '../../../../hooks/useLocalizedRoute';
import useSearch from '../../../../hooks/useSearch';
import usePagination from "../../../../hooks/usePagination";
import { useFetchData } from '../../../../hooks/crud/useFetchData';

const PenelitianTahun: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const itemsPerPage = 10;

  const { t } = useTranslation();
  const getLocalizedRoute = useLocalizedRoute();

  const { data: penelitianResponse, loading } = useFetchData<{ message: string; data: PenelitianProps[] }>(`/api/research/year/${year}`);
  const penelitianByYear = penelitianResponse?.data || [];

  const validData = Array.isArray(penelitianByYear) ? penelitianByYear : [];

  const { handleSearch, filteredData } = useSearch(validData, (item) => `${item.title} ${item.judul}`);
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);

  const breadcrumbItems = [
    { label: t('beranda'), path: '/' },
    { label: t('penelitian'), path: getLocalizedRoute('penelitian') },
    { label: `${year}`, path: `/penelitian/${year}` },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="space-y-4 pt-[100px] md:pt-[120px] px-4 lg:px-[140px] pb-8 md:pb-16">
      <Breadcrumb items={breadcrumbItems} />
      <div className="mb-4">
        <Typography type="heading5" weight="semibold">
          {t('y_penelitian')} {year}
        </Typography>
        <div className="w-10 h-1 bg-primary" />
      </div>
      <SearchBar placeholder={t('cari')} onSearch={handleSearch} />
      
      {paginatedData.length > 0 ? (
        paginatedData.map((research) => (
          <ResearchCard key={research.id} data={[research]} />
        ))
      ) : (
        <Typography type="body">{t('no-data-available')}</Typography>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
      />
    </div>
  );
};

export default PenelitianTahun;