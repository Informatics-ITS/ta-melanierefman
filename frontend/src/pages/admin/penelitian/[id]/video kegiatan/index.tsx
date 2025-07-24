import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

import { Typography } from '../../../../../components/atom/typography';
import { Button } from '../../../../../components/atom/button';
import Loading from '../../../../../components/atom/loading';
import Video from "../../../../../components/molecule/video";
import SearchBar from "../../../../../components/molecule/form/search";
import Pagination from "../../../../../components/molecule/pagination";
import Modal from '../../../../../components/molecule/modal';
import Toast from '../../../../../components/molecule/toast';
import Input from '../../../../../components/molecule/form/input';

import { PenelitianProps } from "../../../../../entities/penelitian";
import { DocumentationProps } from "../../../../../entities/dokumentasi";

import usePagination from "../../../../../hooks/usePagination";
import useSearch from "../../../../../hooks/useSearch";
import { useCreateData } from '../../../../../hooks/crud/useCreateData';
import { useFetchData } from '../../../../../hooks/crud/useFetchData';
import { useDelete } from '../../../../../hooks/crud/useDelete';
import { useToast } from '../../../../../hooks/useToast';
import { useModal } from '../../../../../hooks/useModal';

const VideoKegiatan: React.FC<{ currentPenelitian: PenelitianProps }> = ({ currentPenelitian }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const videosUrl = `${baseUrl}/api/documentation/videos/${currentPenelitian.id}`;

  const { data: rawVideosData, refetch, loading: isLoading } = useFetchData<DocumentationProps[]>(videosUrl);
  const videosData = Array.isArray(rawVideosData)
    ? [...rawVideosData].sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      })
    : [];

  const { handleSearch, filteredData } = useSearch<DocumentationProps>(videosData, (item) => item.judul);
  const { currentPage, paginatedData, setPage } = usePagination<DocumentationProps>(8, filteredData.length > 0 ? filteredData : videosData || []);

  const { deleteData, loading: isDeleting } = useDelete(baseUrl);
  const { toasts, addToast, removeToast } = useToast();
  const { isModalOpen: isFormModalOpen, openModal: formModalOpen, closeModal: formModalClose } = useModal();
  const { isModalOpen: isConfirmModalOpen, openModal: confirmModalOpen, closeModal: confirmModalClose } = useModal();
  const { isModalOpen: isDeleteModalOpen, openModal: deleteModalOpen, closeModal: deleteModalClose } = useModal();

  const [selectedVideo, setSelectedVideo] = useState<{ id: number; judul: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createData } = useCreateData();

  const [formValues, setFormValues] = useState({
    judul: "",
    title: "",
    type: "video",
    youtube_link: "",
    research_id: currentPenelitian.id,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleDeleteClick = (id: number, judul: string) => {
    setSelectedVideo({ id, judul });
    deleteModalOpen();
  };

  const confirmDelete = async () => {
    if (!selectedVideo) return;
    try {
      await deleteData(`api/documentation/research/${selectedVideo.id}`, () => {
        addToast("success", "Video berhasil dihapus!");
        refetch();
      });
    } catch (error) {
      addToast("error", "Gagal menghapus dokumentasi.");
    } finally {
      deleteModalClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let newErrors: Record<string, string> = {};
    
    if (!formValues.judul.trim()) newErrors.judul = "Judul tidak boleh kosong.";
    if (!formValues.title.trim()) newErrors.title = "Title tidak boleh kosong.";
    if (!formValues.youtube_link.trim()) newErrors.youtube_link = "Link Youtube tidak boleh kosong.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast("error", "Mohon periksa kembali inputan Anda.");
      return;
    }

    confirmModalOpen();
  };

  useEffect(() => {
    if (!isFormModalOpen) {
      setFormValues({
        judul: "",
        title: "",
        type: "video",
        youtube_link: "",
        research_id: currentPenelitian.id,
      });
      setErrors({});
    }
  }, [isFormModalOpen]);

  const handleConfirm = async () => {
    const data = new FormData();
    data.append("judul", formValues.judul);
    data.append("title", formValues.title);
    data.append("youtube_link", formValues.youtube_link);
    data.append("research_id", formValues.research_id.toString());
    data.append("type", "video");

    try {
      const { data: result, errors: beErrors } = await createData(
        `${baseUrl}/api/documentation`,
        data
      );

      if (result) {
        addToast("success", `Video berhasil diunggah!`);
        refetch();
        setFormValues({ 
          judul: "",
          title: "", 
          type: "video", 
          youtube_link: "", 
          research_id: currentPenelitian.id, 
        });
        confirmModalClose();
        formModalClose();
      } else if (beErrors) {
        setErrors(beErrors);
        addToast("error", "Gagal mengunggah video. Silakan coba lagi.");
      }
    } catch (error) {
      addToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    }
  };

  if (isLoading) return <div className="mt-40"><Loading /></div>;

  return (
    <div>
      <div className="md:flex md:justify-between space-y-2 md:space-y-0">
        <SearchBar placeholder="Cari Video Kegiatan..." onSearch={handleSearch} />
        <Button variant="primary" iconLeft={<Plus />} onClick={formModalOpen}>Tambah Video</Button>
      </div>

      {videosData.length === 0 ? (
        <Typography type="body" font="dm-sans" className="text-typo-secondary mt-4">
          Video Penelitian belum ada.
        </Typography>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 mb-4">
            {paginatedData.map((video) => (
              <Video key={video.id} video={{ ...video, youtube_link: video.youtube_link ?? null }} onDelete={handleDeleteClick} isDeleting={isDeleting} mode="admin"/>
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

      <Modal isOpen={isFormModalOpen} onClose={formModalClose} title={`Tambah Video Kegiatan`} showFooter={false} sizeClass="md:w-3/5 lg:w-1/3">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Judul (Bahasa Indonesia)"
            id="judul"
            name="judul"
            placeholder="Masukkan judul"
            value={formValues.judul}
            onChange={handleChange}
            error={errors.judul}
          />
          <Input
            label="Title (English)"
            id="title"
            name="title"
            placeholder="Enter title in English"
            value={formValues.title}
            onChange={handleChange}
            error={errors.title}
          />
          <Input
              label="Link Video" 
              id="youtube_link" 
              name="youtube_link" 
              placeholder="Masukkan link video youtube"
              value={formValues.youtube_link}
              onChange={handleChange}
              error={errors.youtube_link} />
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
        message={`Apakah Anda yakin ingin menghapus dokumetasi ini?`}
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

export default VideoKegiatan;