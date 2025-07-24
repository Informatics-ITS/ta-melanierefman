import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { Typography } from '../../../../components/atom/typography';
import SearchBar from "../../../../components/molecule/form/search";
import Pagination from "../../../../components/molecule/pagination";
import Breadcrumb from '../../../../components/molecule/breadcrumb';
import PublicationCard from '../../../../components/molecule/card/publication-card';

import { PublikasiProps } from "../../../../entities/publikasi";

import { useFetchData } from '../../../../hooks/crud/useFetchData';
import useSearch from "../../../../hooks/useSearch";
import usePagination from "../../../../hooks/usePagination";
import { useLocalizedRoute } from '../../../../hooks/useLocalizedRoute';
import Loading from '../../../../components/atom/loading';

const PublikasiTahun: React.FC = () => {
  const { year } = useParams<{ year: string }>();
  const itemsPerPage = 10;

  const { t } = useTranslation();
  const getLocalizedRoute = useLocalizedRoute();

  const { data: publikasiResponse } = useFetchData<{ message: string; data: PublikasiProps[]}>(`${import.meta.env.VITE_API_BASE_URL}/api/publication/year/${year}`);

  const publikasiByYear = Array.isArray(publikasiResponse?.data)
    ? [...publikasiResponse.data]
        .filter(item => item?.created_at)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const { data: researchData = [], loading } = useFetchData<any[]>(`${import.meta.env.VITE_API_BASE_URL}/api/research`);

  const { handleSearch, filteredData } = useSearch<PublikasiProps>(publikasiByYear,(item) => `${item.title} ${item.author}`);
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);

  const getResearchById = (research_id: number) => {
    return researchData?.find((research) => research.id === research_id);
  };

  const breadcrumbItems = [
    { label: t('beranda'), path: '/' },
    { label: t('publikasi'), path: getLocalizedRoute('publikasi') },
    { label: `${year}`, path: `/publikasi/${year}` },
  ];

  const publikasiWithResearch = Array.isArray(paginatedData)
  ? paginatedData.map((pub) => {
      const research = pub.research_id !== null ? getResearchById(pub.research_id) : null;
      return {
        ...pub,
        research,
      };
    })
  : [];

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div className="space-y-4 pt-[100px] md:pt-[120px] px-4 lg:px-[140px] pb-8 md:pb-16">
      <Breadcrumb items={breadcrumbItems} />
      <div className="mb-4">
        <Typography type="heading5" weight="semibold">
          {t('y_publikasi')} {year}
        </Typography>
        <div className="w-10 h-1 bg-primary" />
      </div>
      <SearchBar placeholder={t('cari')} onSearch={handleSearch} />
      <PublicationCard data={publikasiWithResearch} />
      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
      />
    </div>
  );
};

export default PublikasiTahun;