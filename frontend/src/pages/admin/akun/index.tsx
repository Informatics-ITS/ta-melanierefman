import { useEffect, useState } from "react";
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

import { UserProps } from "../../../entities/user";

import usePagination from "../../../hooks/usePagination";
import useSearch from "../../../hooks/useSearch";
import { useFetchData } from "../../../hooks/crud/useFetchData";
import { useDelete } from "../../../hooks/crud/useDelete";
import { useToast } from "../../../hooks/useToast";
import { useModal } from "../../../hooks/useModal";

const AkunPage: React.FC = () => {
  const itemsPerPage = 10;
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const { data, loading, error } = useFetchData<UserProps[]>(`${baseUrl}/api/users`);
  const [users, setUsers] = useState<UserProps[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<{ id: number; title: string } | null>(null);
  const { isModalOpen, openModal, closeModal } = useModal();
  const { addToast, toasts, removeToast } = useToast();
  const { searchQuery, handleSearch, filteredData } = useSearch(users, ["name", "email"]);
  const { currentPage, paginatedData, setPage } = usePagination(itemsPerPage, filteredData);
  const { deleteData, loading: isDeleting } = useDelete(baseUrl);

  useEffect(() => {
    if (data) setUsers(data);
  }, [data]);

  const handleDeleteClick = (id: number, title: string) => {
    setSelectedUsers({ id, title });
    openModal();
  };

  const confirmDelete = async () => {
    if (!selectedUsers) return;
    try {
      await deleteData(`api/users/${selectedUsers.id}`, () => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUsers.id));
        addToast("success", `Akun berhasil dihapus.`);
      });
    } catch (error) {
      addToast("error", "Gagal menghapus akun.");
    } finally {
      closeModal();
    }
  };

  if (loading) return <Loading />;
  if (error) return <div>{error}</div>;

  const columns = [
    {
      header: "Nama",
      accessor: (row: UserProps) => row.name,
    },
    {
      header: "Email",
      accessor: (row: UserProps) => row.email,
    },
    {
      header: "Role",
      accessor: (row: UserProps) => row.role,
    },
    {
      header: "Action",
      accessor: (row: UserProps) => (
        <div className="flex items-center space-x-2">
          <Link 
            to={`/admin/edit-akun/${row.id}`} 
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

  return (
    <div className="md:flex-1 space-y-4 px-4 md:py-8 py-4 mt-16">
      <Typography type="heading6" weight="semibold">
        Daftar Akun
      </Typography>
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari akun..." onSearch={handleSearch} />
        <Button to="/admin/tambah-akun" variant="primary" iconLeft={<Plus />}>
          Tambah Akun
        </Button>
      </div>
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

      <Modal
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isModalOpen}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Akun"
        message={`Apakah Anda yakin ingin menghapus akun "${selectedUsers?.title}"?`}
      />

      <div>
        {toasts.map((toast) => (
          <Toast key={toast.id} type={toast.type} message={toast.message} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </div>
  );
};

export default AkunPage;