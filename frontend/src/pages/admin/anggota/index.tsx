import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, Pencil, Plus } from "lucide-react";

import { Typography } from "../../../components/atom/typography";
import { ButtonSelect } from "../../../components/atom/button/select";
import Loading from "../../../components/atom/loading";
import SearchBar from "../../../components/molecule/form/search";
import Pagination from "../../../components/molecule/pagination";
import Table from "../../../components/molecule/table";
import Modal from "../../../components/molecule/modal";
import Toast from "../../../components/molecule/toast";

import { AnggotaProps } from "../../../entities/anggota";

import usePagination from "../../../hooks/usePagination";
import useSearch from "../../../hooks/useSearch";
import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useDelete } from "../../../hooks/crud/useDelete";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

const AnggotaPage: React.FC = () => {
  const itemsPerPage = 10;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading, error } = useFetchData<AnggotaProps[]>(`${baseUrl}/api/members`);

  const [members, setMembers] = useState<AnggotaProps[]>([]);
  const [selectedMember, setSelectedMember] = useState<{ id: number; name: string } | null>(null);
  const { isModalOpen, openModal, closeModal } = useModal();
  const { addToast, toasts, removeToast } = useToast();

  useEffect(() => {
    if (data) {
      const sortedData = Array.isArray(data)
        ? [...data].sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return timeB - timeA;
          })
        : [];
      setMembers(sortedData);
    }
  }, [data]);  

  const { searchQuery, handleSearch, filteredData } = useSearch(members, (item) => {
    const roleNames: Record<string, string> = {
      "researcher": "Peneliti",
      "postdoc": "Postdoctoral",
      "research assistant": "Asisten Riset",
      "student": "Mahasiswa",
      "alumni": "Alumni",
    };

    const bagian = item.is_alumni ? "Alumni" : roleNames[item.role] || item.role;
    return `${item.name} ${bagian}`;
  });
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);
  const { deleteData, loading: isDeleting } = useDelete(baseUrl);

  const handleDeleteClick = (id: number, name: string) => {
    setSelectedMember({ id, name });
    openModal();
  }

  const confirmDelete = async () => {
    if (!selectedMember) return;
    try {
      await deleteData(`api/members/${selectedMember.id}`, () => {
        setMembers((prevMembers) => prevMembers.filter((member) => member.id !== selectedMember.id));
        addToast("success", `Anggota ${selectedMember.name} berhasil dihapus.`);
      });
    } catch (error) {
      addToast("error", "Gagal menghapus anggota.");
    } finally {
      closeModal();
    }
  }

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  const columns = [
    {
      header: "Nama Anggota",
      accessor: (row: AnggotaProps) => (
        <span className="block whitespace-nowrap">{row.name}</span>
      ),
    },
    {
      header: "Bagian",
      accessor: (row: AnggotaProps) => {
        const roleNames: Record<string, string> = {
          "researcher": "Peneliti",
          "postdoc": "Postdoctoral",
          "research assistant": "Asisten Riset",
          "student": "Mahasiswa",
          "alumni": "Alumni",
        };

        const posisiColors: Record<string, string> = {
          "researcher": "bg-success-0 text-success-60",
          "postdoc": "bg-secondary-0 text-secondary-60",
          "research assistant": "bg-warning-0 text-warning-60",
          "student": "bg-primary-0 text-primary-60",
          "alulmni": "bg-typo-inline text-typo",
        };

        const colorClass = row.is_alumni ? "bg-typo-inline text-typo" : posisiColors[row.role] || "bg-gray-500 text-white";
        const roleName = row.is_alumni ? "Alumni" : roleNames[row.role] || row.role;

        return (
        <span
            className={`inline-block px-2 py-1 rounded-sm ${colorClass} whitespace-nowrap`}
        >
            {roleName}
        </span>
        );
      },
    },
    {
      header: "Action",
      accessor: (row: AnggotaProps) => (
        <div className="flex items-center space-x-2">
          <Link 
            to={ 
              row.role === "student"
                ? `/admin/anggota/edit-mahasiswa/${row.id}`
                : row.role === "postdoc"
                ? `/admin/anggota/edit-postdoctoral/${row.id}`
                : row.role === "research assistant"
                ? `/admin/anggota/edit-asisten-riset/${row.id}`
                : `/admin/anggota/edit-peneliti/${row.id}`
            } 
            className="text-typo hover:text-primary"
            aria-label={`Edit akun ${row.id}`}
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
  ]
  
  const options = [
    { label: "Peneliti", value: "peneliti", to: "/admin/anggota/tambah-peneliti" },
    { label: "Postdoctoral", value: "postdoctoral", to: "/admin/anggota/tambah-postdoctoral" },
    { label: "Asisten Riset", value: "asisten-riset", to: "/admin/anggota/tambah-asisten-riset" },
    { label: "Mahasiswa", value: "mahasiswa", to: "/admin/anggota/tambah-mahasiswa" },
  ];

  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <Typography type="heading6" weight="semibold">
        Daftar Anggota
      </Typography>
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari anggota..." onSearch={handleSearch} />
        <ButtonSelect
            options={options}
            variant="primary"
            placeholder="Tambah Anggota"
            iconLeft={<Plus className="w-6 h-6" />}
        />
      </div>
      {filteredData.length === 0 ? (
        <Typography type="body" className="text-typo-secondary mt-4">
          Belum ada anggota yang tersedia.
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
        title="Konfirmasi Hapus Anggota"
        message={`Apakah Anda yakin ingin menghapus anggota "${selectedMember?.name}"?`}
      />
      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default AnggotaPage;