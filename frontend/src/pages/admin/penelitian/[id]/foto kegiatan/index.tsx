import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Typography } from '../../../../../components/atom/typography';
import { Button } from '../../../../../components/atom/button';
import Loading from '../../../../../components/atom/loading';
import Image from "../../../../../components/molecule/image";
import SearchBar from "../../../../../components/molecule/form/search";
import Pagination from "../../../../../components/molecule/pagination";
import Modal from '../../../../../components/molecule/modal';
import Input from '../../../../../components/molecule/form/input';
import InputImage from '../../../../../components/molecule/form/image';
import Toast from '../../../../../components/molecule/toast';

import { PenelitianProps } from "../../../../../entities/penelitian";
import { DocumentationProps } from "../../../../../entities/dokumentasi";

import usePagination from "../../../../../hooks/usePagination";
import useSearch from "../../../../../hooks/useSearch";
import { useFetchData } from '../../../../../hooks/crud/useFetchData';
import { useDelete } from '../../../../../hooks/crud/useDelete';
import { useModal } from '../../../../../hooks/useModal';
import { useToast } from '../../../../../hooks/useToast';
import { useCreateData } from '../../../../../hooks/crud/useCreateData';

const FotoKegiatan: React.FC<{ currentPenelitian: PenelitianProps }> = ({ currentPenelitian }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const imagesUrl = `${baseUrl}/api/documentation/images/${currentPenelitian.id}`;

  const { data: rawImagesData, refetch, loading: isLoading } = useFetchData<DocumentationProps[]>(imagesUrl);
  const imagesData = Array.isArray(rawImagesData)
    ? [...rawImagesData].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      })
    : [];

  const { handleSearch, filteredData } = useSearch<DocumentationProps>(imagesData, (item) => item.judul);
  const { currentPage, paginatedData, setPage } = usePagination<DocumentationProps>(8, filteredData.length > 0 ? filteredData : imagesData || []);

  const { deleteData, loading: isDeleting } = useDelete(baseUrl);
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen: isFormModalOpen, openModal: formModalOpen, closeModal: formModalClose } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const { isModalOpen: isDeleteModalOpen, openModal: deleteModalOpen, closeModal: deleteModalClose } = useModal();

  const [selectedImage, setSelectedImage] = useState<{ id: number; judul: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const { createData } = useCreateData();

  const [formValues, setFormValues] = useState({
    type: "image",
    image: "",
    keterangan: "",
    caption: "",
    research_id: currentPenelitian.id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleDeleteClick = (id: number, judul: string) => {
    setSelectedImage({ id, judul });
    deleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!selectedImage) return;
    try {
      await deleteData(`api/documentation/research/${selectedImage.id}`);
      deleteModalClose();
      refetch();
      addToast("success", "Foto Kegiatan berhasil dihapus.");
    } catch (error) {
      addToast("error", "Terjadi kesalahan saat menghapus foto kegiatan.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: Record<string, string> = {};

    if (!uploadedImage) {
      newErrors.image = "The image must be uploaded.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Please check the information you entered.");
      return;
    }

    confirmModalOpen();
  }

  useEffect(() => {
    if (!isFormModalOpen) {
      setFormValues({
        type: "image",
        image: "",
        keterangan: "",
        caption: "",
        research_id: currentPenelitian.id,
      });
      setErrors({});
    }
  }, [isFormModalOpen]);

  const handleConfirm = async () => {
    const data = new FormData();
    data.append("keterangan", formValues.keterangan);
    data.append("caption", formValues.caption);
    data.append("research_id", formValues.research_id.toString());
    data.append("type", "image");

    if (uploadedImage) {
      data.append("image", uploadedImage);
    }

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/documentation`,
        data
      );

      if (result) {
        addToast("success", `Foto berhasil diunggah!`);
        refetch();
        setFormValues({
          type: "image",
          image: "",
          keterangan: "",
          caption: "",
          research_id: currentPenelitian.id,
        });
        formModalClose();
        confirmModalClose();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal mengunggah foto. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    }
  }

  if (isLoading) return <div className="mt-40"><Loading /></div>;

  return (
    <div>
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari Foto Kegiatan..." onSearch={handleSearch} />
        <Button variant="primary" iconLeft={<Plus />} onClick={formModalOpen}>Tambah Foto</Button>
     </div>

    {filteredData.length === 0 ? (
      <Typography type="body" font="dm-sans" className="text-typo-secondary mt-4">
        Foto Penelitian belum ada.
      </Typography>
    ) : (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {paginatedData.map((image, index) => (
            <Image key={index} image={image} index={index} images={imagesData} baseUrl={baseUrl} showOptions={true} onDelete={handleDeleteClick} isDeleting={isDeleting} variant="detail" mode="admin" />
          ))}
        </div>
        <div className="w-full flex items-end justify-end">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredData.length}
            itemsPerPage={8}
            onPageChange={setPage}
          />
        </div>
      </>
    )}

      <Modal isOpen={isFormModalOpen} onClose={formModalClose} title={`Tambah Foto Kegiatan`} showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Typography type="caption1" font="dm-sans" className="text-typo">Upload Gambar</Typography>
          {uploadedImage ? (
            <img 
              src={URL.createObjectURL(uploadedImage)} 
              alt="Preview" 
              className="h-48 w-full object-cover rounded-lg" 
            />
          ) : (
            <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm rounded-lg">
              Tidak ada gambar
            </div>
          )}
          <InputImage onInputImage={setUploadedImage} mode="browse" />
          <Input
            label="Keterangan (Bahasa Indonesia)"
            id="keterangan"
            name="keterangan"
            placeholder="Masukkan keterangan"
            value={formValues.keterangan}
            onChange={handleChange}
            error={errors.keterangan}
          />
          <Input
            label="Caption (English)"
            id="caption"
            name="caption"
            placeholder="Enter caption in English"
            value={formValues.caption}
            onChange={handleChange}
            error={errors.caption}
          />
          
          <Button type="submit" variant="primary" className="w-full">Simpan</Button>
        </form>
      </Modal>

      <Modal 
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isConfirmModalOpen}
        onClose={confirmModalClose}
        onConfirm={handleConfirm}
        title="Konfirmasi Simpan Data"
        message="Apakah Anda yakin ingin menyimpan data ini? Silakan konfirmasi untuk melanjutkan."
      />

      <Modal
        sizeClass="md:w-1/2 lg:w-1/4"
        isOpen={isDeleteModalOpen}
        onClose={deleteModalClose}
        onConfirm={confirmDelete}
        title="Konfirmasi Hapus Dokumentasi"
        message={`Apakah Anda yakin ingin menghapus dokumentasi ini?`}
      />

      <div>
        {toasts.map((toast) => (
          <Toast 
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default FotoKegiatan;