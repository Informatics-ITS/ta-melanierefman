import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Pencil, Plus } from "lucide-react";

import { Typography } from "../../../components/atom/typography";
import { Button } from "../../../components/atom/button";
import Loading from "../../../components/atom/loading";
import SearchBar from "../../../components/molecule/form/search";
import Pagination from "../../../components/molecule/pagination";
import Table from "../../../components/molecule/table";
import Modal from "../../../components/molecule/modal";
import Toast from "../../../components/molecule/toast";

import { PublikasiProps } from "../../../entities/publikasi";

import usePagination from "../../../hooks/usePagination";
import useSearch from "../../../hooks/useSearch";
import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useDelete } from "../../../hooks/crud/useDelete";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

const PublikasiPage: React.FC = () => {
  const itemsPerPage = 10;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data: publikasiData, loading, error } = useFetchData<PublikasiProps[]>(`${baseUrl}/api/publication`);
  const { data: researchData } = useFetchData<any[]>(`${baseUrl}/api/research`);
  const [publication, setPublication] = useState<PublikasiProps[]>([]);
  const { isModalOpen, openModal, closeModal } = useModal();
  const { addToast, toasts, removeToast } = useToast();
  const [selectedPublication, setSelectedPublication] = useState<{ id: number; title: string } | null>(null);
  const { searchQuery, handleSearch, filteredData } = useSearch(publication, "title");
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);
  const { deleteData, loading: isDeleting } = useDelete(baseUrl);

  useEffect(() => {
    if (publikasiData) {
        const role = localStorage.getItem("role");
        const userId = Number(localStorage.getItem("id"));

        const filteredData = role === "admin"
        ? publikasiData.filter(item => {
            if (item.research_id !== null) {
              const relatedResearch = getResearchById(item.research_id);
              if (relatedResearch) {
                return relatedResearch.user_id === userId;
              }
            }

            if (item.user_id) {
              return item.user_id === userId;
            }

            return false;
          })
        : publikasiData;

        const sortedData = Array.isArray(filteredData)
          ? [...filteredData].sort((a, b) => {
              const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return timeB - timeA;
            })
          : [];
        setPublication(sortedData);
    }
  }, [publikasiData, researchData]);

  const handleDeleteClick = (id: number, title: string) => {
    setSelectedPublication({ id, title });
    openModal();
  }

  const confirmDelete = async () => {
    if (!selectedPublication) return;
    try {
      await deleteData(`api/publication/${selectedPublication.id}`, () => {
        setPublication((prevPublication) => prevPublication.filter((publication) => publication.id !== selectedPublication.id));
        addToast("success", `Publikasi ${selectedPublication.title} berhasil dihapus.`);
      });
    } catch (error) {
      addToast("error", "Gagal menghapus publikasi.");
    } finally {
      closeModal();
    }
  }

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  const getResearchById = (research_id: number) => {
    return researchData?.find((research) => research.id === research_id);
  };  

  const formatCitation = (item: PublikasiProps) => {
    const formatAuthors = (authors: string) => {
      const authorList = authors
        .split(", ")
        .map((author) => {
          const nameParts = author.trim().split(" ");
          const lastName = nameParts.pop();
          const initials = nameParts.map((name) => name[0] + ".").join(" ");
          return `${lastName}, ${initials}`;
        });

      const numAuthors = authorList.length;

      if (numAuthors === 1) {
        return authorList[0];
      } else if (numAuthors === 2) {
        return `${authorList[0]}, & ${authorList[1]}`;
      } else if (numAuthors >= 3 && numAuthors <= 20) {
        return authorList.slice(0, -1).join(", ") + ", & " + authorList[authorList.length - 1];
      } else {
        const first19 = authorList.slice(0, 19);
        const lastAuthor = authorList[authorList.length - 1];
        return first19.join(", ") + ", ... " + lastAuthor;
      }
    };

    const toSentenceCase = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const formatDOI = (doi: string) => {
      if (doi.toLowerCase().startsWith('http')) {
        return doi;
      } else if (doi.toLowerCase().startsWith('doi:')) {
        return `https://doi.org/${doi.slice(4)}`;
      } else {
        return `https://doi.org/${doi}`;
      }
    };

    return (
      <div className="text-left">
        {formatAuthors(item.author)}
        {" "}({item.year}).
        {" "}{toSentenceCase(item.title)}.
        {item.name_journal && (
          <>
            {" "}<em>{item.name_journal}</em>
            {item.volume && (
              <>
                , <em>{item.volume}</em>
                {item.issue && `(${item.issue})`}
              </>
            )}
            {item.page && `, ${item.page}`}
            .
          </>
        )}
        
        {(item.DOI_link || item.article_link) && (
          <>
            {" "}
            <a 
              href={(item.DOI_link ? formatDOI(item.DOI_link) : item.article_link) ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {item.DOI_link ? formatDOI(item.DOI_link) : item.article_link}
            </a>
          </>
        )}
      </div>
    );
  };

  const columns = [
    {
      header: "Publikasi",
      accessor: (row: PublikasiProps) => formatCitation(row),
    },
    {
      header: "Penelitian",
      accessor: (row: PublikasiProps) => {
        if (!researchData) {
          return <span className="text-typo-secondary">Memuat data...</span>;
        }

        if (row.research_id === null) {
          return <span className="text-typo-secondary">Data tidak ditemukan</span>;
        }

        const research = getResearchById(row.research_id);

        return (
          <div className="flex items-center justify-center">
            <Button 
              to={`/admin/penelitian/${research.judul.toLowerCase().replace(/\s+/g, "+") || ""}`}
              variant="underline"
            >
              Lihat
            </Button>
          </div>
        );
      },
    },
    {
      header: "Action",
      accessor: (row: PublikasiProps) => (
        <div className="flex items-center space-x-2">
          <Link 
            to={`/admin/publikasi/edit/${row.id}`} 
            className="text-typo hover:text-primary"
            aria-label={`Edit publikasi ${row.id}`}
          >
            <Pencil size={20} />
          </Link>
          <button
            className="text-typo hover:text-primary"
            aria-label={`Hapus publikasi ${row.id}`}
            onClick={() => handleDeleteClick(row.id, row.title)}
            disabled={isDeleting}
          >
            <Trash2 size={20} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <Typography type="heading6" weight="semibold">
        Daftar Publikasi
      </Typography>
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari publikasi..." onSearch={handleSearch} />
        <Button to="/admin/publikasi/create" variant="primary" iconLeft={<Plus />}>Tambah Publikasi</Button>
      </div>
      {filteredData.length === 0 ? (
        <Typography type="body" font="dm-sans" className="text-typo-secondary mt-4">
          Belum ada publikasi yang tersedia.
        </Typography>
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
      <Modal
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Publikasi"
        message={`Apakah Anda yakin ingin menghapus publikasi penelitian "${selectedPublication?.title}"?`}
      />

      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default PublikasiPage;