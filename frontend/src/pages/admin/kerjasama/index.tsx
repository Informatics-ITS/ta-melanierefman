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

import { MitraProps } from "../../../entities/kerjasama";

import usePagination from "../../../hooks/usePagination";
import useSearch from "../../../hooks/useSearch";
import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useDelete } from "../../../hooks/crud/useDelete";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

const KerjasamaPage: React.FC = () => {
  const itemsPerPage = 10;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading, error } = useFetchData<MitraProps[]>(`${baseUrl}/api/partners`);
  const [partners, setPartners] = useState<MitraProps[]>([]);
  const { searchQuery, handleSearch, filteredData } = useSearch(partners, "name");
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);
  const { deleteData, loading: isDeleting } = useDelete(baseUrl);
  const [selectedPartner, setSelectedPartner] = useState<{ id: number; title: string } | null>(null);
  const { isModalOpen, openModal, closeModal } = useModal();
  const { addToast, toasts, removeToast } = useToast();

  useEffect(() => {
    const userId = Number(localStorage.getItem("id"));
    const role = localStorage.getItem("role");
  
    if (data && userId) {
      let filteredPartners = data;

      if (role === 'admin') {
        filteredPartners = data.filter((partner) =>
          partner.research?.some((research) => research.user_id === userId)
        );
      }

      const sortedData = Array.isArray(filteredPartners)
        ? [...filteredPartners].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          })
        : [];
  
      setPartners(sortedData);
    }
  }, [data]);
    
  const handleDeleteClick = (id: number, title: string) => {
    setSelectedPartner({ id, title });
    openModal();
  }

  const confirmDelete = async () => {
    if (!selectedPartner) return;
    try {
      await deleteData(`api/partners/${selectedPartner.id}`, () => {
        setPartners((prevPartners) => prevPartners.filter((partner) => partner.id !== selectedPartner.id));
        addToast("success", `Kolaborator ${selectedPartner.title} berhasil dihapus.`);
      });
    } catch (error) {
      addToast("error", "Gagal menghapus kolaborator.");
    } finally {
      closeModal();
    }
  }

  const columns = [
    {
      header: "Institusi",
      accessor: (row: MitraProps) => row.name,
    },
    {
      header: "Anggota",
      accessor: (row: MitraProps) => (
        <div className="list-disc pl-6">
          {row.partners_member?.map((member, index) => (
            <span key={index} className="block mb-2">{member.name}</span>
          )) || "-"}
        </div>
      ),
    },
    {
      header: "Penelitian",
      accessor: (row: MitraProps) => (
        <div>
          {row.research?.length ? (
            row.research.map((research) => (
              <div key={research.id} className="mb-2">
                <Link
                  to={`/admin/penelitian/${research.judul.toLowerCase().replace(/\s+/g, "+") || ""}`}
                  className="text-secondary hover:underline"
                >
                  {research.judul}
                </Link>
              </div>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      ),
    },
    {
      header: "Action",
      accessor: (row: MitraProps) => (
        <div className="flex items-center space-x-2">
          <Link
            to={`/admin/kolaborator/edit/${row.id}`}
            className="text-typo hover:text-primary"
            aria-label={`Edit akun ${row.name}`}
          >
            <Pencil size={20} />
          </Link>
          <button
            className="text-typo hover:text-primary"
            aria-label={`Hapus akun ${row.name}`}
            onClick={() => handleDeleteClick(row.id, row.name)}
            disabled={isDeleting}
          >
            <Trash2 size={20} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <Typography type="heading6" weight="semibold">
        Daftar Kerjasama
      </Typography>
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari kolaborator..." onSearch={handleSearch} />
        <Button to="/admin/kolaborator/create" variant="primary" iconLeft={<Plus />}>Tambah Kolaborator</Button>
      </div>
      {filteredData.length === 0 ? (
        <Typography type="body" font="dm-sans" className="text-typo-secondary mt-4">
          Belum ada kolaborator yang tersedia.
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
        title="Konfirmasi Hapus Kolaborator"
        message={`Apakah Anda yakin ingin menghapus kolaborator "${selectedPartner?.title}"?`}
      />

      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default KerjasamaPage;