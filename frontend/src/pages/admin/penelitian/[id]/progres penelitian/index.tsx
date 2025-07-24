import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Typography } from '../../../../../components/atom/typography';
import { Button } from '../../../../../components/atom/button';
import Loading from '../../../../../components/atom/loading';
import SearchBar from "../../../../../components/molecule/form/search";
import Pagination from "../../../../../components/molecule/pagination";
import ResearchCard from '../../../../../components/molecule/card/research4-card';
import Modal from '../../../../../components/molecule/modal';
import Toast from '../../../../../components/molecule/toast';

import { PenelitianProps } from "../../../../../entities/penelitian";
import { ProgresPenelitianProps } from "../../../../../entities/progres-penelitian";

import usePagination from "../../../../../hooks/usePagination";
import useSearch from "../../../../../hooks/useSearch";
import { useFetchData } from '../../../../../hooks/crud/useFetchData';
import { useDelete } from '../../../../../hooks/crud/useDelete';
import { useModal } from '../../../../../hooks/useModal';
import { useToast } from '../../../../../hooks/useToast';

const ProgresPenelitian: React.FC<{ currentPenelitian: PenelitianProps }> = ({ currentPenelitian }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  
  const { data: rawProgressData, refetch, loading: isLoading } = useFetchData<ProgresPenelitianProps[]>(
    `${baseUrl}/api/research/${currentPenelitian.id}/progress`
  );
  
  const progressData = Array.isArray(rawProgressData) ? rawProgressData : [];
  
  const { handleSearch, filteredData } = useSearch<ProgresPenelitianProps>(
    progressData, 
    (item) => item.judul_progres
  );
  
  const sortedFilteredData = [...filteredData].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
    return dateB.getTime() - dateA.getTime();
  });

  const { currentPage, setPage, paginatedData } = usePagination<ProgresPenelitianProps>(8, sortedFilteredData);
  const { deleteData, loading: isDeleting } = useDelete(baseUrl);
  const { isModalOpen, openModal, closeModal } = useModal();
  const { addToast, toasts, removeToast } = useToast();

  const [selectedProgressId, setSelectedProgressId] = useState<number | null>(null);
  const [selectedProgressTitle, setSelectedProgressTitle] = useState<string>("");

  const handleDeleteClick = (id: number, judul: string) => {
    setSelectedProgressId(id);
    setSelectedProgressTitle(judul);
    openModal();
  };

  const confirmDelete = async () => {
    if (!currentPenelitian || !selectedProgressId) return;
    try {
      await deleteData(`api/research/${currentPenelitian.id}/progress/${selectedProgressId}`, () => {
        refetch();
        addToast("success", `Progres ${selectedProgressTitle} berhasil dihapus.`);
      });
    } catch (error) {
      addToast("error", "Gagal menghapus progres penelitian.");
    } finally {
      closeModal();
    }
  };

  if (isLoading) return <div className="mt-40"><Loading /></div>;

  return (
    <div className="space-y-4">
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari progres penelitian..." onSearch={handleSearch} />
        <Button 
          to={`/admin/penelitian/tambah-progres-penelitian?researchId=${currentPenelitian.id}`} 
          variant="primary" 
          iconLeft={<Plus />}
        >
          Tambah Progres
        </Button>
      </div>

      {sortedFilteredData.length === 0 ? (
        <Typography type="body" font="dm-sans" className="text-typo-secondary">
          Progres Penelitian belum ada.
        </Typography>
      ) : (
        <>
        {paginatedData.map((progress) => (
          <ResearchCard 
            key={progress.id} 
            data={[progress]} 
            currentPenelitian={currentPenelitian}
            onDelete={(id) => handleDeleteClick(id, progress.judul_progres)}
            isDeleting={isDeleting}
          />
        ))}
        <div className="w-full flex items-end justify-end">
          <Pagination
            currentPage={currentPage}
            totalItems={sortedFilteredData.length}
            itemsPerPage={8}
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
        title="Konfirmasi Hapus Progres Penelitian"
        message={`Apakah Anda yakin ingin menghapus progres penelitian "${selectedProgressTitle}"?`}
      />
      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default ProgresPenelitian;