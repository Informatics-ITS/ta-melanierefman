import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Typography } from "../../../../../../components/atom/typography";
import Loading from "../../../../../../components/atom/loading";
import ResearchProgressCard from "../../../../../../components/molecule/card/research2-card";
import SearchBar from "../../../../../../components/molecule/form/search";
import Pagination from "../../../../../../components/molecule/pagination";
import Breadcrumb from '../../../../../../components/molecule/breadcrumb';

import { PenelitianProps } from "../../../../../../entities/penelitian";
import { ProgresPenelitianProps } from "../../../../../../entities/progres-penelitian";

import { useFetchData } from "../../../../../../hooks/crud/useFetchData";
import useSearch from "../../../../../../hooks/useSearch";
import usePagination from "../../../../../../hooks/usePagination";
import { useLocalizedRoute } from "../../../../../../hooks/useLocalizedRoute";

const ResearchProgressList: React.FC = () => {
    const itemsPerPage = 5;
    const { title } = useParams<{ title: string }>();
    const { t, i18n } = useTranslation();
    const getLocalizedRoute = useLocalizedRoute();
    const lang = i18n.language;
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const { data: researchData, loading: loadingResearch } =
        useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);

    const currentPenelitian = researchData?.find((penelitian) =>
        title?.toLowerCase().replace(/\s+/g, '+') === (lang === 'id' 
          ? penelitian.judul.toLowerCase().replace(/\s+/g, '+') 
          : penelitian.title.toLowerCase().replace(/\s+/g, '+')
        )
    );

    if (!loadingResearch && !currentPenelitian) {
        return <div>{t("data_not_available")}</div>;
    }

    const progressUrl = currentPenelitian?.id 
        ? `${baseUrl}/api/research/${currentPenelitian.id}/progress` 
        : null;

    const { data: researchProgress, loading: loadingProgress } =
        useFetchData<ProgresPenelitianProps[]>(progressUrl ?? '');
    
    const processedData = Array.isArray(researchProgress)
        ? researchProgress.map((progress) => ({
            ...progress,
            created_at_date: new Date(progress.created_at ?? ""),
        })).sort((a, b) => b.created_at_date.getTime() - a.created_at_date.getTime())
        : [];    

    const searchField = lang === 'id' ? "judul_progres" : "title_progress";
    const { handleSearch, filteredData } = useSearch(processedData, searchField);        
    const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);

    const breadcrumbItems = [
        { label: t('beranda'), path: '/' },
        { label: t('penelitian'), path: getLocalizedRoute('penelitian') },
        {
          label: currentPenelitian
            ? lang === "id"
              ? currentPenelitian.judul
              : currentPenelitian.title
            : t("unk"),
          path: currentPenelitian
            ? getLocalizedRoute('detail_penelitian', { 
              title: lang === 'id' 
                ? currentPenelitian.judul.toLowerCase().replace(/\s+/g, '+') 
                : currentPenelitian.title.toLowerCase().replace(/\s+/g, '+'),
            })
            : getLocalizedRoute("researchNotFound"),
        },
        { label: t('progres'), path: '#' },
      ];

    if (loadingResearch || (progressUrl && loadingProgress)) {
      return <div className="h-screen flex items-center justify-center"><Loading /></div>;
    }

    return (
      <div className="space-y-4 pt-[100px] md:pt-[120px] px-4 lg:px-[140px] pb-8 md:pb-16">
        <div>
          <Breadcrumb items={breadcrumbItems} />
          <div className="mt-2 mb-4">
            <Typography type="heading5" weight="semibold">
              {t("progres")}
            </Typography>
            <div className="w-14 h-1 bg-primary" />
          </div>
        </div>    
        <SearchBar placeholder={t("cari")} onSearch={handleSearch} />
        {paginatedData.length > 0 ? (
          paginatedData.map((progress) => (
            <ResearchProgressCard 
              key={progress.id} 
              data={progress}
              parentData={{
                judul: currentPenelitian?.judul ?? "data-not-available",
                title: currentPenelitian?.title ?? "data-not-available"
              }} 
            />          
          ))
        ) : (
          <Typography type="paragraph">{t("data_not_available")}</Typography>
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

export default ResearchProgressList;