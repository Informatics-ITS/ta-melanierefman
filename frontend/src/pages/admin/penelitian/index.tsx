import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { Typography } from "../../../components/atom/typography";
import { Button } from "../../../components/atom/button";
import Loading from "../../../components/atom/loading";
import SearchBar from "../../../components/molecule/form/search";
import Pagination from "../../../components/molecule/pagination";
import ResearchCard from "../../../components/molecule/card/research3-card";
import Modal from "../../../components/molecule/modal";
import Toast from "../../../components/molecule/toast";

import { PenelitianProps } from "../../../entities/penelitian";

import usePagination from "../../../hooks/usePagination";
import useSearch from "../../../hooks/useSearch";
import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useDelete } from "../../../hooks/crud/useDelete";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

const PenelitianPage: React.FC = () => {
  const itemsPerPage = 3;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading, error } = useFetchData<PenelitianProps[]>(`${baseUrl}/api/research`);
  const [research, setResearch] = useState<PenelitianProps[]>([]);
  const [selectedResearch, setSelectedResearch] = useState<{ id: number; judul: string } | null>(null);
  const { isModalOpen, openModal, closeModal } = useModal();
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
      setResearch(sortedData);
    }
  }, [data]);

  const { handleSearch, filteredData } = useSearch(research, "judul");
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);
  const { deleteData, loading: isDeleting} = useDelete(baseUrl);

  const handleDeleteClick = (id: number, judul: string) => {
    setSelectedResearch({ id, judul });
    openModal();
  };

  const confirmDelete = async () => {
    if (!selectedResearch) return;
    try {
      await deleteData(`api/research/${selectedResearch.id}`, () => {
        setResearch((prevResearch) => prevResearch.filter((research) => research.id !== selectedResearch.id));
        addToast("success", `Penelitian ${selectedResearch.judul} berhasil dihapus.`);
      });
    } catch (error) {
      addToast("error", "Gagal menghapus materi.");
    } finally {
      closeModal();
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <Typography type="heading6" weight="semibold">
        Daftar Penelitian
      </Typography>
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari penelitian..." onSearch={handleSearch} />
        <Button to="/admin/tambah-penelitian" variant="primary" iconLeft={<Plus />}>Tambah Penelitian</Button>
      </div>
      {filteredData.length === 0 ? (
        <Typography type="body" font="dm-sans" className="text-typo-secondary mt-4">
          Belum ada penelitian yang tersedia.
        </Typography>
      ) : (
        <>
          <ResearchCard data={paginatedData} onDelete={handleDeleteClick} isDeleting={isDeleting} />
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
        title="Konfirmasi Hapus Penelitian"
        message={`Apakah Anda yakin ingin menghapus penelitian "${selectedResearch?.judul}"?`}
      />
      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default PenelitianPage;