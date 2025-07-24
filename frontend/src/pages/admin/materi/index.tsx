import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";

import { Typography } from "../../../components/atom/typography";
import Loading from "../../../components/atom/loading";
import SearchBar from "../../../components/molecule/form/search";
import Pagination from "../../../components/molecule/pagination";
import Table from "../../../components/molecule/table";
import Modal from "../../../components/molecule/modal";
import Toast from "../../../components/molecule/toast";

import { MateriProps } from "../../../entities/materi";

import usePagination from "../../../hooks/usePagination";
import useSearch from "../../../hooks/useSearch";
import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useDelete } from "../../../hooks/crud/useDelete";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

import CreateMateri from "../materi/create";
import EditMateri from "../materi/edit";

const MateriPage: React.FC = () => {
  const itemsPerPage = 10;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading, error, refetch } = useFetchData<MateriProps[]>(`${baseUrl}/api/lecturers`);

  const [lecturers, setLecturers] = useState<MateriProps[]>([]);
  const [selectedMateri, setSelectedMateri] = useState<{ id: number; title: string } | null>(null);
  const { isModalOpen: isDeleteModalOpen, openModal: deleteModalOpen, closeModal: deleteModalClose } = useModal();
  const { addToast, toasts, removeToast } = useToast();

  useEffect(() => {
    if (data) {
      const role = localStorage.getItem("role");
      const userId = Number(localStorage.getItem("id"));

      const filteredData = role === "admin" 
        ? data.filter(item => item.user_id === userId)
        : data;

      const sortedData = Array.isArray(filteredData)
        ? [...filteredData].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          })
        : [];

      setLecturers(sortedData);
    }
  }, [data]);

  const { searchQuery, handleSearch, filteredData } = useSearch(lecturers, ["judul", "kata_kunci", "type"]);
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);
  const { deleteData, loading: isDeleting } = useDelete(baseUrl);

  const handleDeleteClick = (id: number, title: string) => {
    setSelectedMateri({ id, title });
    deleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!selectedMateri) return;
    try {
      await deleteData(`api/lecturers/${selectedMateri.id}`, () => {
        setLecturers((prevLecturers) => prevLecturers.filter((lecturer) => lecturer.id !== selectedMateri.id));
        addToast("success", `Materi ${selectedMateri.title} berhasil dihapus.`);
        refetch();
      });
    } catch (error) {
      addToast("error", "Gagal menghapus materi.");
    } finally {
      deleteModalClose();
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  const columns = [
    {
      header: "Judul",
      accessor: (row: MateriProps) => (
        <a
          href={row.youtube_link || `${baseUrl}/storage/${row.file}`}
          className="text-secondary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {row.judul}
        </a>
      ),
    },
    {
      header: "Keyword",
      accessor: (row: MateriProps) => row.kata_kunci,
    },
    {
      header: "Jenis",
      accessor: (row: MateriProps) => (
        <span className={`inline-block px-2 py-1 rounded-sm ${row.type === "video" ? "bg-success-0 text-success-60" : "bg-secondary-0 text-secondary-60"}`}>
          {row.type === "video" ? "Video" : "File"}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (row: MateriProps) => (
        <div className="flex items-center space-x-2">
          <EditMateri row={row} onSuccess={refetch}/>
          <button
            className="text-typo hover:text-primary"
            aria-label={`Hapus akun ${row.judul}`}
            onClick={() => handleDeleteClick(row.id, row.judul)}
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
        Daftar Materi Pembelajaran
      </Typography>
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari materi pembelajaran..." onSearch={handleSearch} />
        <CreateMateri onSuccess={refetch}/>
      </div>
      {filteredData.length === 0 ? (
        <Typography type="body" font="dm-sans" className="text-typo-secondary mt-4">
          Belum ada materi pembelajaran yang tersedia.
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
        isOpen={isDeleteModalOpen}
        onClose={deleteModalClose}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Materi"
        message={`Apakah Anda yakin ingin menghapus materi "${selectedMateri?.title}"?`}
      />

      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default MateriPage;