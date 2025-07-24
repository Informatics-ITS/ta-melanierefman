import { format } from "date-fns";
import { Link } from "react-router-dom";
import { User, Microscope, Users, CircleUser, BookOpenCheck } from "lucide-react";

import { Typography } from "../../../components/atom/typography";
import Loading from "../../../components/atom/loading";
import SearchBar from "../../../components/molecule/form/search";
import IconCard from "../../../components/molecule/card/icon-card";
import Pagination from "../../../components/molecule/pagination";
import Table from "../../../components/molecule/table";

import { PenelitianProps } from "../../../entities/penelitian";
import { AnggotaProps } from "../../../entities/anggota";
import { MitraProps } from "../../../entities/kerjasama";
import { PublikasiProps } from "../../../entities/publikasi";
import { UserProps } from "../../../entities/user";

import usePagination from "../../../hooks/usePagination";
import useSearch from "../../../hooks/useSearch";
import { useFetchData } from "../../../hooks/crud/useFetchData";

const Dashboard: React.FC = () => {
  const itemsPerPage = 10;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const { data, loading, error } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);
  const { data: memberData } = useFetchData<AnggotaProps[]>(`${baseUrl}/api/members`);
  const { data: partnerData } = useFetchData<MitraProps[]>(`${baseUrl}/api/partners`);
  const { data: publicationData } = useFetchData<PublikasiProps[]>(`${baseUrl}/api/publication`);
  const { data: userData } = useFetchData<UserProps[]>(`${baseUrl}/api/users`);

  const userId = Number(localStorage.getItem("id"));
  const userRole = localStorage.getItem("role");

  const sortedData = Array.isArray(data)
    ? [...data].sort((a, b) => {
        const timeA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const timeB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return timeB - timeA;
      })
    : [];
  
  const filteredResearch = userRole === "admin" ? sortedData?.filter((research) => research.user_id === userId) : sortedData;
  const filteredPartners = userRole === "admin" ? partnerData?.filter((partner) => partner.research.some((research) => filteredResearch?.some((filtered) => filtered.id === research.id))) : partnerData;
  const filteredPublications = userRole === "admin" ? publicationData?.filter((publication) => filteredResearch?.some((research) => research.id === publication.research_id)) : publicationData;

  const getCoordinatorName = (members: PenelitianProps["members"]) => {
    const coordinator = members.find(member => member.pivot.is_coor === 1);
    return coordinator ? coordinator.name : "Tidak ditemukan";
  };

  const getMitraNames = (partners: MitraProps[]) => {
    return partners.map(partner => partner.name).join(", ") || "Tidak ada kolaborator";
  };

  const formatDuration = (start: string, end: string) => {
    if (!start || !end || start === 'null' || end === 'null') {
      return "Tidak ada durasi";
    }
    
    try {
      const startDate = format(new Date(start), "MMM yyyy");
      const endDate = format(new Date(end), "MMM yyyy");
      return `${startDate} - ${endDate}`;
    } catch {
      return "Tidak ada durasi";
    }
  };

  const { searchQuery, handleSearch, filteredData } = useSearch(
    filteredResearch || [],
    (item: PenelitianProps) => {
      const coordinatorName = getCoordinatorName(item.members).toLowerCase();
      const mitraNames = getMitraNames(
        filteredPartners?.filter(partner =>
          partner.research.some(research => research.id === item.id)
        ) || []
      ).toLowerCase();

      return `${item.judul.toLowerCase()} ${coordinatorName} ${mitraNames}`;
    }
  );
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  const columns = [
    {
      header: "Judul Penelitian",
      accessor: (row: PenelitianProps) => (
        <Link
          to={`/admin/penelitian/${row.judul.toLowerCase().replace(/\s+/g, "+")}`}
          className="text-secondary hover:underline"
        >
          {row.judul}
        </Link>
      ),
    },
    {
      header: "Koordinator",
      accessor: (row: PenelitianProps) => getCoordinatorName(row.members),
    },
    {
      header: "Kolaborator",
      accessor: (row: PenelitianProps) => {
        const relatedPartners = filteredPartners?.filter(partner =>
          partner.research.some(research => research.id === row.id)
        );
        return getMitraNames(relatedPartners || []);
      },
    },
    {
      header: "Durasi",
      accessor: (row: PenelitianProps) => formatDuration(row.start_date, row.end_date),
    },
  ];

  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <Typography type="heading6" weight="semibold">
        Dashboard
      </Typography>
      <div className={`grid grid-cols-3 gap-4`}>
        {userRole !== "admin" && (
          <IconCard icon={<User size={36} />} count={memberData?.length || 0} label="Anggota"/>
        )}
        {userRole !== "admin" && userData && (
          <IconCard icon={<CircleUser size={36} />} count={userData.length || 0} label="Akun Pengguna"/>
        )}
        <IconCard icon={<Microscope size={36} />} count={filteredResearch?.length || 0} label="Penelitian"/>
        <IconCard icon={<Users size={36} />} count={filteredPartners?.length || 0} label="Kerjasama"/>
        <IconCard icon={<BookOpenCheck size={32} />} count={filteredPublications?.length || 0} label="Publikasi"/>
      </div>
      <div className="flex justify-between">
        <SearchBar placeholder="Cari penelitian..." onSearch={handleSearch} />
      </div>
      
      {filteredData.length === 0 ? (
        <Typography type="body" font="dm-sans" className="text-typo-secondary">Belum ada penelitian yang tersedia.</Typography>
      ) : (
        <>
          <Table
            columns={columns}
            data={paginatedData}
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
          <div className="w-full flex items-end justify-end">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;