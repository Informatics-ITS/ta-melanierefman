import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";

import { Typography } from "../../../components/atom/typography";
import Loading from "../../../components/atom/loading";
import SearchBar from "../../../components/molecule/form/search";
import Pagination from "../../../components/molecule/pagination";
import Table from "../../../components/molecule/table";

import { MitraProps } from "../../../entities/kerjasama";

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';
import { useFetchData } from "../../../hooks/crud/useFetchData";
import usePagination from "../../../hooks/usePagination";

type ProcessedResearchData = {
  id: number;
  researchTitle: string;
  researchTitleEn: string;
  membersWithInstitutions: { name: string; institution: string; }[];
  createdAt: string;
};

const Mitra: React.FC = () => {
  const itemsPerPage = 10;
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();

  const { data, loading } = useFetchData<MitraProps[]>(`${import.meta.env.VITE_API_BASE_URL}/api/partners`);

  const processedData = useMemo(() => {
    if (!Array.isArray(data)) return [];

    const researchMap = new Map<number, ProcessedResearchData>();
    
    data.forEach((partner: MitraProps) => {
      const members = Array.isArray(partner.partners_member) ? partner.partners_member : [];
      const research = Array.isArray(partner.research) ? partner.research : [];
      
      research.forEach(r => {
        if (researchMap.has(r.id)) {
          const existing = researchMap.get(r.id)!;
          
          members.forEach(member => {
            const memberExists = existing.membersWithInstitutions.some(
              m => m.name === member.name && m.institution === partner.name
            );
            
            if (!memberExists) {
              existing.membersWithInstitutions.push({
                name: member.name,
                institution: partner.name
              });
            }
          });
        } else {
          researchMap.set(r.id, {
            id: r.id,
            researchTitle: r.judul || 'data-not-available',
            researchTitleEn: r.title || 'data-not-available',
            membersWithInstitutions: members.map(member => ({
              name: member.name,
              institution: partner.name
            })),
            createdAt: partner.created_at || ''
          });
        }
      });
    });
    
    return Array.from(researchMap.values()).sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [data]);

  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return processedData;
    
    const lowerQuery = searchQuery.toLowerCase();
    
    return processedData.filter(item => {
      const researchTitle = lang === "id" ? item.researchTitle : item.researchTitleEn;
      const matchesResearch = researchTitle.toLowerCase().includes(lowerQuery);

      const matchesInstitution = item.membersWithInstitutions.some(member => 
        member.institution.toLowerCase().includes(lowerQuery)
      );

      const matchesMember = item.membersWithInstitutions.some(member => 
        member.name.toLowerCase().includes(lowerQuery)
      );
      
      return matchesResearch || matchesInstitution || matchesMember;
    });
  }, [processedData, searchQuery, lang]);

  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);

  const columns = [
    {
      header: t("penelitian"),
      accessor: (row: ProcessedResearchData) => (
        <a
          href={getLocalizedRoute('detail_penelitian', {
            title: (lang === 'id' ? row.researchTitle : row.researchTitleEn)
              .toLowerCase()
              .replace(/\s+/g, '+'),
          })}
          className="text-secondary hover:underline block"
          target="_blank"
          rel="noopener noreferrer"
        >
          {lang === "id" ? row.researchTitle : row.researchTitleEn}
        </a>
      ),
    },
    {
      header: t("colab"),
      accessor: (row: ProcessedResearchData) => (
        <div>
          {row.membersWithInstitutions.length > 0 
            ? row.membersWithInstitutions.map((member, index) => (
                <span key={index} className="inline-block mr-2 mb-1">
                  {member.name} ({member.institution}){index < row.membersWithInstitutions.length - 1 ? ',' : ''}
                </span>
              ))
            : t("no_members")}
        </div>
      ),
    },        
  ];

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading /></div>;

  return (
    <div>
      {/* Hero */}
      <div className="pt-16">
        <div className="relative w-full h-[200px] md:h-[300px] overflow-hidden">
          {/* Image Background */}
          <img
            src="/view4.png"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient Overlay & Content */}
          <div className="absolute bottom-0 h-[6rem] md:h-[8rem] bg-gradient-to-t from-black to-transparent flex flex-col justify-center text-white w-full">
            <Typography type="heading1" weight="semibold" className="px-4 lg:px-[140px]">
              {t('n_mitra')}
            </Typography>
          </div>
        </div>
      </div>
      <div className="space-y-4 pt-8 px-4 lg:px-[140px] pb-8 md:pb-16">
        <SearchBar placeholder={t("cari")} onSearch={handleSearch} />
        {filteredData.length > 0 ? (
          <>
            <Table
              columns={columns}
              data={paginatedData}
              searchQuery={searchQuery}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="flex items-center justify-center py-12">
            <Typography type="body" font="dm-sans" className="text-typo-secondary text-center">
              {t("data_belum_tersedia")}
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mitra;